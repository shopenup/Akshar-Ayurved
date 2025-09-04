const { loadEnv, defineConfig } = require('@shopenup/framework/utils');
const { Modules, ContainerRegistrationKeys } = require('@shopenup/framework');

loadEnv(process.env.NODE_ENV, process.cwd());

module.exports = defineConfig({
  admin: {
    backendUrl:
      process.env.BACKEND_URL ?? '',
    storefrontUrl: process.env.STOREFRONT_URL,
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS,
      adminCors: process.env.ADMIN_CORS,
      authCors: process.env.AUTH_CORS,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  // plugins: ["medusa-plugin-razorpay-v2"],
  modules: [
    {
      resolve: '@shopenup/shopenup/payment',
      options: {
        providers: [
          {
            id: 'stripe',
            resolve: '@shopenup/shopenup/payment-stripe',
            options: {
              apiKey: process.env.STRIPE_API_KEY,
              webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
            },
          },
          // {
          //   resolve:
          //     "medusa-plugin-razorpay-v2/providers/payment-razorpay/src",
          //   id: "razorpay",
          //   options: {
          //     key_id:
          //       process?.env?.RAZORPAY_TEST_KEY_ID ??
          //       process?.env?.RAZORPAY_ID,
          //     key_secret:
          //       process?.env?.RAZORPAY_TEST_KEY_SECRET ??
          //       process?.env?.RAZORPAY_SECRET,
          //     razorpay_account:
          //       process?.env?.RAZORPAY_TEST_ACCOUNT ??
          //       process?.env?.RAZORPAY_ACCOUNT,
          //     automatic_expiry_period: 30 /* any value between 12minuts and 30 days expressed in minutes*/,
          //     manual_expiry_period: 20,
          //     refund_speed: "normal",
          //     webhook_secret:
          //       process?.env?.RAZORPAY_TEST_WEBHOOK_SECRET ??
          //       process?.env?.RAZORPAY_WEBHOOK_SECRET
          //   }
          // }
        ],
      },
    },
    {
      resolve: '@shopenup/shopenup/fulfillment',
      options: {
        providers: [
          {
            resolve: '@shopenup/fulfillment-manual',
            id: 'manual',
          }
        ],
      },
    },
    {
      resolve: '@shopenup/shopenup/notification',
      options: {
        providers: [
          // {
          //   resolve: './src/modules/resend',
          //   id: 'resend',
          //   options: {
          //     channels: ['email'],
          //     api_key: process.env.RESEND_API_KEY,
          //     from: process.env.RESEND_FROM,
          //     siteTitle: 'ShopenUp',
          //     companyName: 'Sofa Society',
          //     footerLinks: [
          //       {
          //         url: 'https://agilo.com',
          //         label: 'Agilo',
          //       },
          //       {
          //         url: 'https://www.instagram.com/agiloltd/',
          //         label: 'Instagram',
          //       },
          //       {
          //         url: 'https://www.linkedin.com/company/agilo/',
          //         label: 'LinkedIn',
          //       },
          //     ],
          //   },
          // },
          {
            resolve: "./src/modules/twilio-sms",
            id: "twilio-sms",
            options: {
              channels: ["sms"],
              accountSid: process.env.TWILIO_ACCOUNT_SID,
              authToken: process.env.TWILIO_AUTH_TOKEN,
              from: process.env.TWILIO_PHONE_NUMBER
              ,
            },
          },

        ],
      },
    },
   
  ],
});
