"use client"

import { LayoutColumn } from "@components/Layout"
import { usePathname } from "next/navigation"
import { LocalizedLink } from "@components/LocalizedLink"

export const NoResults = () => {
  const pathname = usePathname()

  return (
    <LayoutColumn className="pt-28">
      <div className="flex justify-center flex-col items-center">
        <div>
          <p className="text-md text-center mb-2">No results match!</p>
        </div>
        <LocalizedLink
          scroll={false}
          href={pathname}
          className="underline inline-flex md:pb-0"   
        >
          Clear filters
        </LocalizedLink>
      </div>
    </LayoutColumn>
  )
}
