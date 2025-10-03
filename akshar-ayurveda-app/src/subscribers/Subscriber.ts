import { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"
import { subjects } from "src/modules/resend/emails"

interface SubscriberData {
  email: string
  name: string
}

export default async function newsletterSubscriber({
  event: { data },
  container,
}: SubscriberArgs<SubscriberData>) {
  const notificationService = container.resolve("notification")

  // Send welcome email to subscriber
  await notificationService.createNotifications({
    to: data.email,
    channel: "email",
    template: "newsletter-subscription", // your HBS template
    data: {
      subject: `🎉 Welcome to ${process.env.STORE_NAME}`,
      name: data.email,
      store_name: process.env.STORE_NAME,
      store_url: process.env.STORE_URL,
    },
  })
}

export const config: SubscriberConfig = {
  event: "newsletter.subscribed",
}
