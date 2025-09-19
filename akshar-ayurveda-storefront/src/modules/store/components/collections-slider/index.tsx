import * as React from "react"
import Image from "next/image"

import { productService, ProductCollection } from "@lib/shopenup/product"
import Carousel from "@components/ui/Carousel"
import { LocalizedLink } from "@components/LocalizedLink"
import { twMerge } from "tailwind-merge"

export const CollectionsSlider: React.FC<{
  heading?: React.ReactNode
  className?: string
}> = async ({ heading = "Collections", className }) => {
  const collections = await productService.getCollections()

  if (!collections || !collections.length) {
    return null
  }

  return (
    <div className={twMerge("mb-26 md:mb-36", className)}>
      <h3 className="text-md md:text-2xl mb-4">{heading}</h3>
      <Carousel>
      {collections.map((c: ProductCollection) => (
        <div
          key={c.id}
          className="w-[70%] sm:w-[60%] lg:w-full max-w-72 flex-shrink-0"
        >
          <LocalizedLink href={`/collections/${c.id}`}>
            {typeof c.image === "string" &&
              c.image &&
              typeof c.image === "string" && (
                <div className="relative mb-4 md:mb-6 w-full aspect-[3/4]">
                  <Image src={c.image} alt={c.title} fill />
                </div>
              )}
            <h3>{c.title}</h3>
          </LocalizedLink>
        </div>
      ))}
    </Carousel>
    </div>
  )
}
