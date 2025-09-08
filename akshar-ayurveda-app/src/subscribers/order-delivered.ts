// src/subscribers/order-delivered.ts
import type { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

export default async function orderDeliveredHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve("notification")

  // Fetch fulfillment details using the fulfillment id from the event payload
  const { data: [fulfillment] } = await query.graph({
    entity: "fulfillment",
    fields: [
        "*", "labels.*", "order.*", "order.shipping_address.*"
      // Add any other fulfillment fields you need
    ],
    filters: { id: data.id },
  })


//   Fetch order details using the order_id from the fulfillment
//   const { data: [order] } = await query.graph({
//     entity: "order",
//     fields: [
//       "id",
//       "email",
//       "shipping_address.*",
//       "billing_address.*",
//       "items.*",
//       "shipping_methods.*",
//       // Add any other order fields you need for the email template
//     ],
//     filters: { id: fulfillment.order_id },
//   })
//   Send the notification email to the customer
  await notificationModuleService.createNotifications({
    to: fulfillment?.order?.email || "",
    channel: "email",
    template: process.env.SENDGRID_CUSTOM_DELIVERY_COMPLETE_TEMP_ID, // Replace with your actual template ID
    data: {
      order_id: fulfillment?.order?.id,
      first_name: fulfillment?.order?.shipping_address?.first_name,
      tracking_id: fulfillment?.labels[0]?.tracking_number,
      // Add any other dynamic data for your template
    },
  })
}

export const config: SubscriberConfig = {
  event: "delivery.created",
}