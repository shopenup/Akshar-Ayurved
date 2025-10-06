"use client"

import dynamic from "next/dynamic"

// Load the component only on the client (no SSR)
const CompressedImage = dynamic(() => import("./CompressedImage"), {
  ssr: false,
  loading: () => (
    <div className="bg-gray-200 animate-pulse flex items-center justify-center w-full h-full">
      <span className="text-gray-400 text-sm">Loading image...</span>
    </div>
  ),
})

export default CompressedImage
