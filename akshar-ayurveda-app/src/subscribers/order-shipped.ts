// src/subscribers/order-shipped.ts
import type { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

export default async function orderShippedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve("notification")


  const { data: [fulfillment] } = await query.graph({
    entity: "fulfillment",
    fields: [
      "*", "labels.*", "order.*", "order.shipping_address.*"
    ],
    filters: { id: data.id },
  })

  // Send the notification email to the customer

  await notificationModuleService.createNotifications({
    to: fulfillment.order.email || "",
    template: process.env.SENDGRID_CUSTOM_SHIPMENT_CREATED_TEMP_ID, // Replace with your actual template ID
    channel: "email",
    data: {
        order_id: fulfillment?.order.id,
        address_1: fulfillment?.order.shipping_address.address_1,
        address_2: fulfillment?.order.shipping_address.address_2,
        tracking_id: fulfillment.labels[0].tracking_number,
        first_name: fulfillment?.order.shipping_address.first_name,
        last_name: fulfillment?.order.shipping_address.last_name,
        phone: fulfillment?.order.shipping_address.phone
      // Add any other dynamic data for your template
    },
  })
}

export const config: SubscriberConfig = {
  event: "shipment.created",
}