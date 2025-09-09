"use client"

import React from "react"
import { HttpTypes } from "@shopenup/types"

import { convertToLocale } from "@lib/util/money"

type CartTotalsProps = {
  cart: HttpTypes.StoreCart
}

const CartTotals: React.FC<CartTotalsProps> = ({ cart }) => {
  const {
    currency_code,
    total,
    subtotal,
    tax_total,
    discount_total,
    shipping_total,
    gift_card_total,
  } = cart

  // Calculate items subtotal from cart.items
  const itemsSubtotal = cart.items && Array.isArray(cart.items)
    ? cart.items.reduce((sum, item) => sum + ((item.unit_price || 0) * (item.quantity || 0)), 0)
    : 0;

  return (
    <div>
      <div className="flex flex-col gap-2 lg:gap-1 mb-8">
        <div className="flex justify-between max-lg:text-xs">
          <div>
            <p>Items Subtotal</p>
          </div>
          <div className="self-end">
            <p>{convertToLocale({ amount: itemsSubtotal, currency_code })}</p>
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
                  amount: discount_total ?? 0,
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
              {convertToLocale({ amount: shipping_total ?? 0, currency_code })}
            </p>
          </div>
        </div>
        <div className="flex justify-between max-lg:text-xs">
          <div>
            <p>Taxes</p>
          </div>
          <div className="self-end">
            <p>{convertToLocale({ amount: tax_total ?? 0, currency_code })}</p>
          </div>
        </div>
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
          <p className="text-green-600 font-bold">{convertToLocale({ amount: total ?? 0, currency_code })}</p>
        </div>
      </div>
      <div className="absolute h-full w-auto top-0 right-0 bg-black" />
    </div>
  )
}

export default CartTotals
