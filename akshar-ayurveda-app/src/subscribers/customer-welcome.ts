// src/subscribers/user-created.ts
import { SubscriberArgs, type SubscriberConfig } from "@shopenup/shopenup"

export default async function userCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
    const query = container.resolve("query")
    const notificationModuleService = container.resolve("notification")
  const { data: [customer] } = await query.graph({
    entity: "customer",
    fields: ["*"],
    filters: { id: data.id },
  })

  
  await notificationModuleService.createNotifications({
    to: customer.email,
    channel: "email",
    template: process.env.SENDGRID_CUSTOM_USER_CREATED_TEMP_ID, 
    data: {
        store_name: process.env.STORE_NAME,
        first_name: customer.first_name,
        email: customer.email,
        store_url: process.env.STORE_URL,
    },
  })
}

export const config: SubscriberConfig = {
  event: "customer.created",
}