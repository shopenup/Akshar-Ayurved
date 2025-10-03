import { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export default async function contactFormHandler({
  event: { data },
  container,
}: SubscriberArgs<ContactFormData>) {
  const notificationService = container.resolve("notification")

const adminEmail = process.env.SUPPORT_EMAIL || "support@yourstore.com"
  console.log("Sending support email to:", adminEmail)
  console.log("User email:", data.email)

  // Send email to support
  await notificationService.createNotifications({
    to: adminEmail || "support@yourstore.com",
    channel: "email",
    template: "contact-form-support", // your HBS for support
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

  // Send confirmation email to user
  await notificationService.createNotifications({
    to: data.email,
    channel: "email",
    template: "contact-form-user", // your HBS for user confirmation
    data: {
      subject: `✅ We received your request: ${data.subject}`,
      name: data.name,
      email:data.email,
      phone:data.phone,
      message:data.message,
      store_name: process.env.STORE_NAME,
      store_url: process.env.STOREFRONT_URL,
    },
  })
}

export const config: SubscriberConfig = {
  event: "contact_form.submitted",
}
