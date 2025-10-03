// // src/subscribers/order-shipped.ts
// import type { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

// export default async function orderShippedHandler({
//   event: { data },
//   container,
// }: SubscriberArgs<{ id: string }>) {
//   const query = container.resolve("query")
//   const notificationModuleService = container.resolve("notification")


//   const { data: [fulfillment] } = await query.graph({
//     entity: "fulfillment",
//     fields: [
//       "*", "labels.*", "order.*", "order.shipping_address.*"
//     ],
//     filters: { id: data.id },
//   })

//   // Send the notification email to the customer

//   await notificationModuleService.createNotifications({
//     to: fulfillment.order.email || "",
//     template: process.env.SENDGRID_CUSTOM_SHIPMENT_CREATED_TEMP_ID, // Replace with your actual template ID
//     channel: "email",
//     data: {
//         order_id: fulfillment?.order.id,
//         address_1: fulfillment?.order.shipping_address.address_1,
//         address_2: fulfillment?.order.shipping_address.address_2,
//         tracking_id: fulfillment.labels[0].tracking_number,
//         first_name: fulfillment?.order.shipping_address.first_name,
//         last_name: fulfillment?.order.shipping_address.last_name,
//         phone: fulfillment?.order.shipping_address.phone
//       // Add any other dynamic data for your template
//     },
//   })
// }

// export const config: SubscriberConfig = {
//   event: "shipment.created",
// }

// import type { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

// export default async function orderShippedHandler({
//   event: { data },
//   container,
// }: SubscriberArgs<{ id: string }>) {
//   const query = container.resolve("query")
//   const notificationModuleService = container.resolve("notification")

//   // Fetch fulfillment with order + shipping info
//   const { data: [fulfillment] } = await query.graph({
//     entity: "fulfillment",
//     fields: [
//       "id",
//       "labels.*",
//       "order.id",
//       "order.email",
//       "order.shipping_address.*",
//       "order.items.*",
//     ],
//     filters: { id: data.id },
//   })

//   if (!fulfillment?.order?.email) {
//     return
//   }

//   // Send shipment notification
//   await notificationModuleService.createNotifications({
//     to: fulfillment.order.email,
//     channel: "email",
//     template: "order-shipped", // <- use your Handlebars file: order-shipped.hbs
//     data: {
//       subject: `Your order has been shipped 🚚`,
//       order_id: fulfillment.order.id,
//       first_name: fulfillment.order.shipping_address?.first_name,
//       last_name: fulfillment.order.shipping_address?.last_name,
//       address_1: fulfillment.order.shipping_address?.address_1,
//       address_2: fulfillment.order.shipping_address?.address_2,
//       phone: fulfillment.order.shipping_address?.phone,
//       tracking_id: fulfillment.labels?.[0]?.tracking_number || "Not available",

//     },
//   })
// }

// export const config: SubscriberConfig = {
//   event: "shipment.created",
// }


import type { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

export default async function orderShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve("notification")
  const currencyModuleService = container.resolve("currency")

  // Fetch fulfillment with order + shipping info
  const { data: [fulfillment] } = await query.graph({
    entity: "fulfillment",
    fields: [
      "id",
      "labels.*",
      "order.*",
      "order.items.*",
      "order.items.variant.*",
      "order.items.variant.product.*",
      "order.shipping_address.*",
      "order.billing_address.*",
      "order.shipping_methods.*",
      "order.currency_code",
      "order.total",
      "order.subtotal",
      "order.original_item_subtotal",
      "order.discount_total",
      "order.tax_total",
      "order.shipping_total",
      "order.item_total",
      "order.shipping_subtotal",
    ],
    filters: { id: data.id },
  })

  if (!fulfillment?.order?.email) return

  const order = fulfillment.order
  const currency = await currencyModuleService.retrieveCurrency(order.currency_code)

  // Map items into structured format for email table
  const items = order.items.map(item => ({
    name: item.title || item.variant?.product?.title,
    quantity: item.quantity,
    unit_price: item.unit_price || 0, // price per unit
    line_total: item.subtotal || (item.unit_price * item.quantity) || 0, // total for that line
  }))

  // Get tracking information
  const trackingNumber = fulfillment.labels?.[0]?.tracking_number
  const carrier = "Standard Shipping"
  const trackingUrl = trackingNumber ? `https://tracking.example.com/${trackingNumber}` : ""

  // Calculate subtotal (sum of all item subtotals)
  const subtotal = order.subtotal || order.original_item_subtotal || items.reduce((sum, item) => sum + item.line_total, 0)
  
  // Get shipping amount
  const shipping_amount = order.shipping_total || order.shipping_methods?.[0]?.amount || 0
  
  // Calculate total properly with number validation
  const discount_total = Number(order.discount_total) || 0
  //const tax_total = Number(order.tax_total) || 0
  
  // If tax_total is not available, calculate it from the difference
  const order_total = Number(order.total) || 0
  const calculated_subtotal = Number(subtotal) || 0
  const calculated_shipping = Number(shipping_amount) || 0
  const calculated_discount = Number(discount_total) || 0
  
  //const calculated_tax = tax_total || Math.max(0, order_total - calculated_subtotal + calculated_discount - calculated_shipping)
  //const final_tax_total = Number(calculated_tax) || 0
  
  const calculated_total = calculated_subtotal - calculated_discount + calculated_shipping 
  
  // Debug tax information
  console.log("Tax Debug:", {
    order_tax_total: order.tax_total,
    order_total: order.total,
    order_subtotal: order.subtotal,
    order_original_item_subtotal: order.original_item_subtotal,
    calculated_subtotal: subtotal,
    shipping_amount: shipping_amount,
    discount_total: discount_total,
    order_keys: Object.keys(order)
  })

  // Format addresses
  const shipping_address = [
    order.shipping_address.address_1,
    order.shipping_address.address_2,
    order.shipping_address.city,
    order.shipping_address.province,
    order.shipping_address.postal_code,
    order.shipping_address.country_code
  ].filter(Boolean).join(", ")

  const billing_address = [
    order.billing_address.address_1,
    order.billing_address.address_2,
    order.billing_address.city,
    order.billing_address.province,
    order.billing_address.postal_code,
    order.billing_address.country_code
  ].filter(Boolean).join(", ")

  // Calculate estimated delivery (you can customize this logic)
  const estimated_delivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString() // 3 days from now

  // Send shipment notification
  await notificationModuleService.createNotifications({
    to: order.email,
    channel: "email",
    template: "order-shipped", // your HBS template
    data: {
      subject: `Your order has been shipped 🚚`,
      order_id: order.id,
      first_name: order.shipping_address.first_name,
      last_name: order.shipping_address.last_name,
      address_1: order.shipping_address.address_1,
      address_2: order.shipping_address.address_2,
      phone: order.shipping_address.phone,
      shipping_address: shipping_address,
      billing_first_name: order.billing_address.first_name,
      billing_last_name: order.billing_address.last_name,
      billing_address_1: order.billing_address.address_1,
      billing_address_2: order.billing_address.address_2,
      billing_phone: order.billing_address.phone,
      billing_address: billing_address,
      currency_symbol: currency.symbol_native,
      subtotal: subtotal,
      discount_total: discount_total,
     // tax_total: final_tax_total,
      shipping_amount: calculated_shipping,
      total: order_total || calculated_total,
      tracking_id: trackingNumber || "Not available",
      tracking_url: trackingUrl,
      carrier: carrier,
      estimated_delivery: estimated_delivery,
      item_names: order.items.map(item => item.variant?.product?.title || item.title),
      items
    },
  })
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}
