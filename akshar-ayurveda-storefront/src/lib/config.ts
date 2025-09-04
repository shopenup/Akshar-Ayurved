import Shopenup from "@shopenup/js-sdk"

// Defaults to standard port for Shopenup server
let SHOPENUP_BACKEND_URL = "http://localhost:9000"

if (process.env['NEXT_PUBLIC_SHOPENUP_BACKEND_URL']) {
    SHOPENUP_BACKEND_URL = process.env['NEXT_PUBLIC_SHOPENUP_BACKEND_URL'];
  }

export const sdk = new Shopenup({
  baseUrl: SHOPENUP_BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  publishableKey: process.env['NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY'] || '', 
})
