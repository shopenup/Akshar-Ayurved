import { Config } from "@mikro-orm/core"
import { SubscriberArgs, type SubscriberConfig } from "@shopenup/framework"

export default async function inviteCreatedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  const notificationModuleService = container.resolve("notification")
  const config = container.resolve("configModule")

  const { data: [invite] } = await query.graph({
    entity: "invite",
    fields: ["email", "token"],
    filters: { id: data.id },
  })

  
  

  const backend_url = config.admin.backendUrl !== "/" ? config.admin.backendUrl : "http://localhost:9000"
  const adminPath = config.admin.path

  await notificationModuleService.createNotifications({
    to: invite.email,
    template: process.env.SENDGRID_CUSTOM_USER_INVITE_TEMP_ID, // Replace with your actual SendGrid template ID
    channel: "email",
    data: {
      invite_url: `${backend_url}${adminPath}/invite?token=${invite.token}`,
      email: invite.email,
    },
  })
}

export const config: SubscriberConfig = {
  event: [
    "invite.created",
    "invite.resent",
  ],
}