// import { SubscriberArgs } from "@shopenup/framework";

// interface IEventBusService {
//     subscribe(event: string, handler: (data: any) => Promise<void>): void
//   }
  
//   interface INotificationService {
//     send(input: { to: string; template: string; data: any }): Promise<void>
//   }
  
//   export default async function onOrderSmsSubscriber({
//     container,
//   }: SubscriberArgs<"order.placed">) {
//     const eventBusService = container.resolve<IEventBusService>("eventBusService")
//     const notificationService = container.resolve<INotificationService>("notificationService")
  
//     eventBusService.subscribe("order.placed", async (data) => {
//       await notificationService.send({
//         to: data.customer.email,
//         template: "order_confirmation_sms",
//         data: { order: data },
//       })
//     })
//   }


import type { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string;}>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve("notification")

  // Try phone from shipping address first, fallback to customer
  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
    "id",
    "email",
    "billing_address.*", // This will include phone if present
    // ...other fields as needed
    ],
    filters: { id: data.id },
    })
  console.log(order)
  // const phone =
  //   order.billing_address?.phone ||
  //   order.customer?.phone

  // if (!phone) {
  //   console.warn("No phone number found on order", order.id)
  //   console.warn("No phone number found on order", order)

  //   console.log("customer.phone:", order.customer?.phone)
  //   console.log("shipping_address.phone:", order.billing_address?.phone)
  //   return
  // }
// const phone = 98
  // console.log("✅ Phone number found:", phone)

  // await notificationModuleService.createNotifications({
  //   to: `+91` + order.billing_address.phone,
  //   channel: "sms",
  //   template: "order-confirmation-sms",
  //   data: {
  //     order_id: order.id,
  //   },
  // })

  const phone =
  order.billing_address?.phone ||
  order.customer?.phone

if (!phone) {
  console.warn("No phone number found for order", order.id)
  return
}

// List of SMS templates you want to send
const smsTemplates = [
  {
    template: "order-confirmation-sms",
    data: { order_id: order.id },
  },
  // {
  //   template: "order-shipped-sms",
  //   data: { order_id: order.id, tracking_link: "https://track.com/12345" },
  // },
  // {
  //   template: "order-delivered-sms",
  //   data: { order_id: order.id },
  // },
  // {
  //   template: "order-cancelled-sms",
  //   data: { order_id: order.id },
  // },
]

// Send all notifications
for (const sms of smsTemplates) {
  await notificationModuleService.createNotifications({
    to: `+91${phone}`,
    channel: "sms",
    template: sms.template,
    data: sms.data,
  })
}
}

export const config: SubscriberConfig = {
event: "order.placed",
}


  


  