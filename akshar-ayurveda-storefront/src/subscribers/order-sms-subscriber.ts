import type { SubscriberArgs, SubscriberConfig } from "@shopenup/framework"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ 
  id: string; 
  customer: { 
    phone: string; 
    email: string; 
    first_name: string; 
    last_name: string 
  }; 
  total: number; 
  items: unknown[]; 
  status: string 
}>) {
  try {
    
    const notificationModuleService = container.resolve("notification")
    
    // Get phone number from event data
    const phone = data.customer?.phone;
    
    if (!phone) {
      return;
    }
    
    
    // Format phone number to ensure it starts with +91
    const formattedPhone = phone.startsWith('+91') ? phone : `+91${phone}`;
    
    // Send SMS notification
    await notificationModuleService.createNotifications({
      to: formattedPhone,
      channel: "sms",
      template: "order-confirmation-sms",
      data: {
        order_id: data.id,
        customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
        total_amount: data.total,
        status: data.status
      },
    });
    
    
  } catch {
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}


  


  