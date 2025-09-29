import { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

export default async function contactFormHandler({
  event: { data },
  container,
}: SubscriberArgs<{
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}>) {
  const notificationModuleService = container.resolve("notification")

  // Send email to support
  await notificationModuleService.createNotifications({
    to: process.env.SUPPORT_EMAIL || "support@yourstore.com",
    channel: "email",
    template: "contact-form", // e.g. contact-form.hbs inside your templates folder
    data: {
      subject: `📩 New Contact Form Submission: ${data.subject}`,
      name: data.name,
      email: data.email,
      phone: data.phone || "N/A",
      message: data.message,
      store_name: process.env.STORE_NAME,
      store_url: process.env.STORE_URL,
    },
  })
}

export const config: SubscriberConfig = {
  event: "contact_form.submitted",
}
