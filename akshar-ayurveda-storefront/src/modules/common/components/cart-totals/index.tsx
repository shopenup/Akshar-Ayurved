"use client"

import React from "react"
import { HttpTypes } from "@shopenup/types"

import { convertToLocale } from "@lib/util/money"
import { TaxDisplay } from "@components/ui/tax-display"

type CartTotalsProps = {
  cart: HttpTypes.StoreCart
}

const CartTotals: React.FC<CartTotalsProps> = ({ cart }) => {
  const {
    currency_code,
    total,
    tax_total,
    discount_total,
    shipping_total,
    gift_card_total,
  } = cart

  // Calculate items subtotal from cart.items
  const itemsSubtotal = cart.items && Array.isArray(cart.items)
    ? cart.items.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 0)), 0)
    : 0;

  // Collect all tax lines from all cart items to calculate real tax percentage
  const allTaxLines = cart.items && Array.isArray(cart.items)
    ? cart.items.flatMap(item => item.tax_lines || [])
    : [];

  // Group tax lines by code to avoid duplicates and sum rates
  const uniqueTaxLines = allTaxLines.reduce((acc, taxLine) => {
    const code = taxLine.code || taxLine.description || 'unknown';
    if (!acc[code]) {
      acc[code] = {
        ...taxLine,
        rate: taxLine.rate || 0
      };
    }
    return acc;
  }, {} as Record<string, any>);

  // Convert to array for tax percentage calculation
  const taxLinesArray = Object.values(uniqueTaxLines);

  return (
    <div>
      <div className="flex flex-col gap-2 lg:gap-1 mb-8">
        <div className="flex justify-between max-lg:text-xs">
          <div>
            <p>Items Subtotal</p>
          </div>
          <div className="self-end">
            <p>{convertToLocale({ amount: cart.original_item_subtotal ?? 0, currency_code })}</p>
          </div>
        </div>
        {!!discount_total && (
          <div className="flex justify-between max-lg:text-xs">
            <div>
              <p>Discount</p>
            </div>
            <div className="self-end">
              <p>
                -{" "}
                {convertToLocale({
                  amount: (cart as any).discount_subtotal ?? 0,
                  currency_code,
                })}
              </p>
            </div>
          </div>
        )}
        <div className="flex justify-between max-lg:text-xs">
          <div>
            <p>Shipping</p>
          </div>
          <div className="self-end">
            <p>
              {convertToLocale({ amount: cart.original_shipping_subtotal ?? 0, currency_code })}
            </p>
          </div>
        </div>
        {tax_total && tax_total > 0 && (
          <TaxDisplay
            taxAmount={tax_total}
            subtotal={cart.original_item_subtotal ?? 0}
            currencyCode={currency_code}
            className="max-lg:text-xs"
            label="Taxes"
            taxLines={taxLinesArray}
          />
        )}
        {!!gift_card_total && (
          <div className="flex justify-between max-lg:text-xs">
            <div>
              <p>Gift card</p>
            </div>
            <div className="self-end">
              <p>
                -{" "}
                {convertToLocale({
                  amount: gift_card_total ?? 0,
                  currency_code,
                })}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-between text-md">
        <div> 
          <p>Total</p>
        </div>
        <div className="self-end">
          <p className="text-[#cd8973] font-bold">{convertToLocale({ amount: total ?? 0, currency_code })}</p>
        </div>
      </div>
      <div className="absolute h-full w-auto top-0 right-0 bg-black" />
    </div>
  )
}

export default CartTotals
