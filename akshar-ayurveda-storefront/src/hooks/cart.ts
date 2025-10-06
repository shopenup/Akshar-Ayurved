import React from "react"
import {
  addToCart,
  applyPromotions,
  clearCheckoutData,
  deleteLineItem,
  getCartQuantity,
  getPaymentMethod,
  initiatePaymentSession,
  placeOrder,
  retrieveCart,
  setAddresses,
  setEmail,
  setPaymentMethod,
  setShippingMethod,
  updateLineItem,
  updateRegion,
} from "@lib/shopenup/cart"
import { listCartShippingMethods } from "@lib/shopenup/fulfillment"
import { listCartPaymentMethods } from "@lib/shopenup/payment"
import { HttpTypes } from "@shopenup/types"
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import { z } from "zod"
import { useAppContext } from "@context/AppContext"

export const useCart = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await retrieveCart()
      return res
    },
    enabled,
    retry: 3, // Retry up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    // Reduce refetch frequency to avoid CORS issues
    refetchOnWindowFocus: false,
    // Reduce refetch interval to every 5 minutes instead of 30 seconds
    refetchInterval: 300000,
    // Cache for 2 minutes to reduce API calls
    staleTime: 120000,
    // Enable refetch on mount to ensure we get fresh data
    refetchOnMount: true,
    // Refetch when the component becomes visible again
    refetchOnReconnect: true,
  })
}

// Custom hook that ensures cart count is always synchronized with context
export const useCartWithSync = ({ enabled }: { enabled: boolean }) => {
  const { updateCartCount } = useAppContext()
  const cartQuery = useCart({ enabled })
  
  // Update context whenever cart data changes
  React.useEffect(() => {
    if (updateCartCount) {
      if (cartQuery.data?.items) {
        const count = cartQuery.data.items.reduce((sum, item) => sum + item.quantity, 0)
        updateCartCount(count)
      } else {
        // Cart is empty or null, set count to 0
        updateCartCount(0)
      }
    }
  }, [cartQuery.data, updateCartCount])
  
  return cartQuery
}

export const useCartQuantity = () => {
  return useQuery({
    queryKey: ["cart", "cart-quantity"],
    queryFn: async () => {
      const res = await getCartQuantity()
      return res
    },

  })
}

export const useCartShippingMethods = (cartId: string) => {
  return useQuery({
    queryKey: ['shipping-methods', cartId],
    queryFn: async () => {
      const res = await listCartShippingMethods(cartId)
      return res
    },
    enabled: !!cartId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection time)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: 2,
    // Add network mode to prevent duplicate requests
    networkMode: 'online',
    // Add structural sharing to prevent unnecessary re-renders
    structuralSharing: true,
  })
}

export const useCartPaymentMethods = (regionId: string) => {
  return useQuery({
    queryKey: ['payment-methods', regionId],
    queryFn: async () => {
      const res = await listCartPaymentMethods(regionId)
      return res
    },
    retry: (failureCount, error) => {
      console.error('🔄 Payment methods query retry:', failureCount, error)
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useUpdateLineItem = (
  options?: UseMutationOptions<
    void,
    Error,
    { lineId: string; quantity: number },
    unknown
  >
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["cart-update-line-item"],
    mutationFn: async (payload: { lineId: string; quantity: number }) => {
      const response = await updateLineItem({
        lineId: payload.lineId,
        quantity: payload.quantity,
      })
      return response
    },
    onSuccess: async function (...args) {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["cart"],
      })

      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useDeleteLineItem = (
  options?: UseMutationOptions<void, Error, { lineId: string }, unknown>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["cart-delete-line-item"],
    mutationFn: async (payload: { lineId: string }) => {
      const response = await deleteLineItem(payload.lineId)

      return response
    },
    onSuccess: async function (...args) {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["cart"],
      })

      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useAddLineItem = (
  options?: UseMutationOptions<
    void,
    Error,
    { variantId: string; quantity: number; countryCode: string | undefined },
    unknown
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["cart-add-line-item"],
    mutationFn: async (payload: {
      variantId: string
      quantity: number
      countryCode: string | undefined
    }) => {
      const response = await addToCart({ ...payload })

      return response
    },
    onSuccess: async function (...args) {
      // Use debounced invalidation to prevent rapid API calls
      // This prevents multiple cart API calls when adding items
      debouncedCartInvalidation(queryClient)
      
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useSetShippingMethod = (
  { cartId }: { cartId: string },
  options?: UseMutationOptions<
    void,
    Error,
    { shippingMethodId: string },
    unknown
  >
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["shipping-update", cartId],
    mutationFn: async ({ shippingMethodId }) => {
      const response = await setShippingMethod({
        cartId,
        shippingMethodId,
      })

      return response
    },
    onSuccess: async function (...args) {
      // Use debounced invalidation to prevent rapid API calls
      debouncedCartInvalidation(queryClient)
      
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}


export const useClearCheckoutData = (
  options?: UseMutationOptions<
    { success: boolean; error: string | null },
    Error,
    void,
    unknown
  >
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["clear-checkout-data"],
    mutationFn: async () => {
      const response = await clearCheckoutData()
      return response
    },
    onSuccess: async function (...args) {
      // Invalidate all cart-related queries
      await queryClient.invalidateQueries({ queryKey: ["cart"] })
      await queryClient.invalidateQueries({ queryKey: ["shipping-methods"] })
      await queryClient.invalidateQueries({ queryKey: ["payment-methods"] })
      
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const addressesFormSchema = z
  .object({
    shipping_address: z.object({
      first_name: z.string().min(1),
      last_name: z.string().min(1),
      company: z.string().optional().nullable(),
      address_1: z.string().min(1),
      address_2: z.string().optional().nullable(),
      city: z.string().min(1),
      postal_code: z.string().min(1),
      province: z.string().optional().nullable(),
      country_code: z.string().min(2),
      phone: z.string().optional().nullable(),
    }),
  })
  .and(
    z.discriminatedUnion("same_as_billing", [
      z.object({
        same_as_billing: z.literal("on"),
      }),
      z.object({
        same_as_billing: z.literal("off").optional(),
        billing_address: z.object({
          first_name: z.string().min(1),
          last_name: z.string().min(1),
          company: z.string().optional().nullable(),
          address_1: z.string().min(1),
          address_2: z.string().optional().nullable(),
          city: z.string().min(1),
          postal_code: z.string().min(1),
          province: z.string().optional().nullable(),
          country_code: z.string().min(2),
          phone: z.string().optional().nullable(),
        }),
      }),
    ])
  )

export const useSetShippingAddress = (
  options?: UseMutationOptions<
    { success: boolean; error: string | null },
    Error,
    z.infer<typeof addressesFormSchema>,
    unknown
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["shipping-address-update"],
    mutationFn: async (payload) => {
      const response = await setAddresses(payload)
      return response
    },
    onSuccess: async function (...args) {
      // Use debounced invalidation to prevent rapid API calls
      debouncedCartInvalidation(queryClient)
      
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

// Debounced cart invalidation to prevent rapid API calls during step navigation
let cartInvalidationTimeout: NodeJS.Timeout | null = null
const debouncedCartInvalidation = (queryClient: any) => {
  if (cartInvalidationTimeout) {
    clearTimeout(cartInvalidationTimeout)
  }
  cartInvalidationTimeout = setTimeout(() => {
    queryClient.invalidateQueries({
      exact: false,
      queryKey: ["cart"],
    })
  }, 500) // 500ms delay to batch multiple step changes
}

export const useSetEmail = (
  options?: UseMutationOptions<
    { success: boolean; error: string | null },
    Error,
    { email: string; country_code: string },
    unknown
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["set-email"],
    mutationFn: async (payload) => {
      const response = await setEmail(payload)
      return response
    },
    onSuccess: async function (...args) {
      // Use debounced invalidation to prevent rapid API calls
      debouncedCartInvalidation(queryClient)
      
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useInitiatePaymentSession = (
  options?: UseMutationOptions<
    HttpTypes.StorePaymentCollectionResponse,
    Error,
    {
      providerId: string
    },
    unknown
  >
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["initiate-payment"],
    mutationFn: async (payload: { providerId: string }) => {
      const response = await initiatePaymentSession(payload.providerId)

      return response
    },
    onSuccess: async function (...args) {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["cart"],
      })

      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useSetPaymentMethod = (
  options?: UseMutationOptions<
    void,
    Error,
    { sessionId: string; token: string | null | undefined },
    unknown
  >
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["set-payment"],
    mutationFn: async (payload) => {
      const response = await setPaymentMethod(payload.sessionId, payload.token)

      return response
    },
    onSuccess: async function (...args) {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["cart"],
      })

      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useGetPaymentMethod = (id: string | undefined) => {
  return useQuery({
    queryKey: ["payment", id],
    queryFn: async () => {
      if (!id) {
        return null
      }
      const res = await getPaymentMethod(id)
      return res
    },
  })
}

export const usePlaceOrder = (
  options?: UseMutationOptions<
    | {
        type: "cart"
        cart: HttpTypes.StoreCart
        error: {
          message: string
          name: string
          type: string
        }
      }
    | {
        type: "order"
        order: HttpTypes.StoreOrder
      }
    | null,
    Error,
    null,
    unknown
  >
) => {
  const queryClient = useQueryClient()
  const { updateCartCount } = useAppContext()
  
  return useMutation({
    mutationKey: ["place-order"],
    mutationFn: async () => {
      const response = await placeOrder()
      return response
    },
    ...options,
    onSuccess: async function (...args) {
      // Clear cart data from storage and metadata after successful order
      try {
        const { clearCartAfterOrder } = await import('@lib/shopenup/cart-sync')
        await clearCartAfterOrder()
      } catch (error) {
        console.warn('⚠️ Failed to clear cart data after order:', error)
      }
      
      // Invalidate cart queries to trigger refetch
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["cart"],
      })
      
      // Explicitly set cart count to 0 after successful order
      if (updateCartCount) {
        updateCartCount(0)
      }

      if (options?.onSuccess) {
        try {
          await options.onSuccess(...args)
        } catch {
        }
      }
    },
  })
}

export const useApplyPromotions = (
  options?: UseMutationOptions<void, Error, string[], unknown>
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["apply-promotion"],
    mutationFn: async (payload) => {
      const response = await applyPromotions(payload)

      return response
    },
    onSuccess: async function (...args) {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["cart"],
      })

      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useUpdateRegion = (
  options?: UseMutationOptions<
    void,
    Error,
    { countryCode: string; currentPath: string },
    unknown
  >
) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ["update-region"],
    mutationFn: async ({ countryCode, currentPath }) => {
      await updateRegion(countryCode, currentPath)
    },
    onSuccess: async function (...args) {
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["cart"],
      })
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["regions"],
      })
      await queryClient.invalidateQueries({
        exact: false,
        queryKey: ["products"],
      })

      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}
