import { ShopenupRequest, ShopenupResponse } from "@shopenup/framework/http"

export async function POST(req: ShopenupRequest, res: ShopenupResponse) {
  const eventModuleService = req.scope.resolve("event_bus")

  interface ContactFormBody {
    name?: string
    email: string
    message?: string
    phone?: string
    subject?: string
  }

  try {
    const body = req.body as ContactFormBody

    if (!body.email) {
      return res.status(400).json({ success: false, error: "Email is required" })
    }

    // Determine event type based on presence of 'message' or 'subject'
    const isFullContact = body.message && body.name && body.subject

    if (isFullContact) {
      // Full contact form submission
      await eventModuleService.emit({
        name: "contact_form.submitted",
        data: {
          email: body.email,
          name: body.name,
          message: body.message,
          phone: body.phone,
          subject: body.subject,
        },
      })
    } else {
      // Footer newsletter subscription
      await eventModuleService.emit({
        name: "newsletter.subscribed",
        data: {
          email: body.email,
          name: body.name || "Subscriber",
        },
      })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error("Error emitting event:", error)
    return res.status(500).json({ success: false, error: "Failed to send event" })
  }
}
