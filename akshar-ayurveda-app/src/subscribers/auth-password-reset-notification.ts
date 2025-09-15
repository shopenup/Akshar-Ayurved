import type { SubscriberArgs, SubscriberConfig } from "@shopenup/shopenup";
import { ContainerRegistrationKeys, Modules } from "@shopenup/framework/utils";
import type { CustomerDTO } from "@shopenup/framework/types";

export default async function sendPasswordResetNotification({
  event: { data },
  container,
}: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const notificationModuleService = container.resolve(Modules.NOTIFICATION);

  const isCustomer = data.actor_type === "customer" || data.actor_type === "logged-in-customer";
  
  const fields = [
    "id",
    "email",
    "first_name",
    "last_name",
  ] as const satisfies (keyof CustomerDTO)[];

  const { data: customers } = await query.graph({
    entity: isCustomer ? "customer" : "user",
    fields,
    filters: { email: data.entity_id },
  });
  const customer = customers[0] as Pick<CustomerDTO, (typeof fields)[number]>;

  await notificationModuleService.createNotifications({
    to: customer.email,
    channel: "email",
    template:
      data.actor_type === "logged-in-customer"
        ? "auth-password-reset"
        : process.env.SENDGRID_CUSTOM_FORGET_PASSWORD_TEMP_ID,
    data: 
    { 
      customer, 
      store_name: process.env.STORE_NAME, 
      store_url: `${isCustomer ? process.env.STORE_URL : `${process.env.BACKEND_URL}/app`}/reset-password?email=${customer.email}&token=${data.token}`, 
      // token: data.token 
    },
  });
}

export const config: SubscriberConfig = {
  event: "auth.password_reset",
};
