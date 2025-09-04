import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query"
import {
  addCustomerAddress,
  deleteCustomerAddress,
  getCustomer,
  login,
  signout,
  signup,
  updateCustomer,
  updateCustomerAddress,
} from "@lib/shopenup/customer"
import { clearAllCartData } from "@lib/shopenup/cookies"
import { z } from "zod"
import { StoreCustomer } from "@shopenup/types"

export const useCustomer = () => {
  return useQuery({
    queryKey: ["customer"],
    queryFn: async () => {
      const customer = await getCustomer()
      return customer
    },
    staleTime: 5 * 60 * 1000,
  })
}

export const loginFormSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  redirect_url: z.string().optional().nullable(),
})

export const useLogin = (
  options?: UseMutationOptions<
    { success: boolean; redirectUrl?: string; message?: string },
    Error,
    z.infer<typeof loginFormSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["login"],
    mutationFn: async (values: z.infer<typeof loginFormSchema>) => {
      return login({ ...values })
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useSignout = (
  options?: UseMutationOptions<string, Error, string>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["signout"],
    mutationFn: async (countryCode: string) => {
      return signout(countryCode)
    },
    onSuccess: async (...args) => {
      console.log('🔄 Clearing queries after signout (keeping cart data)...')
      
      // Only invalidate customer-related queries, keep cart data
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      
      // Don't clear cart queries - keep cart data for when user logs back in
      // await queryClient.invalidateQueries({ queryKey: ["cart"] })
      // await queryClient.invalidateQueries({ queryKey: ["cart-quantity"] })
      
      // Don't clear cart data - only clear auth token
      // await clearAllCartData()
      
      console.log('✅ Customer queries cleared, cart data preserved')
      
      await options?.onSuccess?.(...args)
    },
    onError: async (error, variables, context) => {
      console.error('❌ Error during signout:', error)
      await options?.onError?.(error, variables, context)
    },
    ...options,
  })
}

export const updateCustomerFormSchema = z.object({
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional().nullable(),
})

export const useUpdateCustomer = (
  options?: UseMutationOptions<
    { state: "error" | "success" | "initial"; error?: string },
    Error,
    z.infer<typeof updateCustomerFormSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["update-customer"],
    mutationFn: async (values: z.infer<typeof updateCustomerFormSchema>) => {
      return updateCustomer(values)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const customerAddressSchema = z.object({
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
})

export const useAddressMutation = (
  addressId?: string,
  options?: UseMutationOptions<
    { addressId: string; success: boolean; error: string | null },
    Error,
    z.infer<typeof customerAddressSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["add-address", "update-address"],
    mutationFn: async (values: z.infer<typeof customerAddressSchema>) => {
      return addressId
        ? updateCustomerAddress(addressId, values)
        : addCustomerAddress(values)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const useDeleteCustomerAddress = (
  options?: UseMutationOptions<void, Error, string>
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["delete-address"],
    mutationFn: async (addressId: string) => {
      return deleteCustomerAddress(addressId)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}

export const signupFormSchema = z.object({
  email: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  phone: z.string().optional().nullable(),
  password: z.string().min(6),
})

export const useSignup = (
  options?: UseMutationOptions<
    { success: boolean; error?: string | null; customer?: StoreCustomer },
    Error,
    z.infer<typeof signupFormSchema>
  >
) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (values: z.infer<typeof signupFormSchema>) => {
      return signup(values)
    },
    onSuccess: async (...args) => {
      await queryClient.invalidateQueries({ queryKey: ["customer"] })
      await options?.onSuccess?.(...args)
    },
    ...options,
  })
}
