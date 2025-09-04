import { HttpTypes } from "@shopenup/types"
import { notFound } from "next/navigation"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.NEXT_PUBLIC_SHOPENUP_BACKEND_URL || "http://localhost:9000"
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_SHOPENUP_PUBLISHABLE_KEY || "pk_03d087dc82a71a3723b4ebfc54024a1b7ad03ab5c58b15d27129f8c482bfac5f"
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "us"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap() {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (
    !regionMap.keys().next().value ||
    regionMapUpdated < Date.now() - 3600 * 1000
  ) {
    console.log({ PUBLISHABLE_API_KEY })
    // Fetch regions from Shopenup. We can't use the JS client here because middleware is running on Edge and the client needs a Node environment.
    try {
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY!,
        },
        next: {
          revalidate: 3600,
          tags: ["regions"],
        },
      })
      
      if (!response.ok) {
        console.warn(`Failed to fetch regions: ${response.status} ${response.statusText}`)
        return regionMapCache.regionMap
      }
      
      const { regions } = await response.json()

      if (!regions?.length) {
        console.warn("No regions found in response")
        return regionMapCache.regionMap
      }

      // Create a map of country codes to regions.
      regions.forEach((region: HttpTypes.StoreRegion) => {
        region.countries?.forEach((c) => {
          regionMapCache.regionMap.set(c.iso_2 ?? "", region)
        })
      })

      regionMapCache.regionMapUpdated = Date.now()
    } catch (error) {
      console.warn("Error fetching regions:", error)
      // Return existing region map if available, otherwise return empty map
      return regionMapCache.regionMap
    }
  }

  return regionMapCache.regionMap
}

/**
 * Fetches regions from Shopenup and sets the region cookie.
 * @param request
 * @param response
 */
async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    let countryCode

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (urlCountryCode && regionMap.has(urlCountryCode)) {
      countryCode = urlCountryCode
    } else if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      countryCode = vercelCountryCode
    } else if (regionMap.has(DEFAULT_REGION)) {
      countryCode = DEFAULT_REGION
    } else if (regionMap.keys().next().value) {
      countryCode = regionMap.keys().next().value
    } else {
      // Fallback to default region if no regions are available
      countryCode = DEFAULT_REGION
    }

    return countryCode
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error(
        "Middleware.ts: Error getting the country code. Did you set up regions in your Shopenup Admin and define a NEXT_PUBLIC_SHOPENUP_BACKEND_URL environment variable?"
      )
    }
    // Return default region as fallback
    return DEFAULT_REGION
  }
}

/**
 * Middleware to handle region selection and onboarding status.
 */
export async function middleware(request: NextRequest) {
  const regionMap = await getRegionMap()
  const countryCode = regionMap && (await getCountryCode(request, regionMap))

  // Do not redirect. Only set a cookie with the detected country code to avoid navigation loops.
  const response = NextResponse.next()

  try {
    if (countryCode) {
      const currentCookie = request.cookies.get("country-code")?.value?.toLowerCase()
      if (currentCookie !== countryCode) {
        response.cookies.set("country-code", countryCode, {
          path: "/",
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
      }
    }
  } catch (_) {
    // noop: never block the request due to cookie errors
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|favicon.ico|_next/image|images|robots.txt).*)",
  ],
}
