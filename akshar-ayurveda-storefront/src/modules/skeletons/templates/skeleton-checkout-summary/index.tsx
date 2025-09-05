import Skeleton from "@components/ui/Skeleton"

export default function SkeletonCheckoutSummary() {
  return (
    <>
      <Skeleton className="w-full h-6 mb-8 lg:mb-16" />
      <div className="flex gap-4 lg:gap-6 mb-8">
        <Skeleton className="w-25 lg:w-33 aspect-[3/4]" />
        <div className="flex flex-col flex-1 justify-between">
          <div className="flex flex-wrap gap-x-4 gap-y-1 justify-between">
            <Skeleton className="w-full h-6" />
          </div>
          <div className="flex flex-col gap-1.5 max-lg:text-xs">
            <Skeleton className="w-full h-6" />
            <Skeleton className="w-full h-6" />
          </div>
        </div>
      </div>
      <div className="flex max-sm:flex-col gap-x-6 gap-y-4 mb-8">
        <Skeleton className="h-12 lg:h-14 flex-1" />
        <Skeleton
          className="lg:h-14 flex-1 sm:max-w-23 h-12"
        />
      </div>
      <div className="flex flex-col gap-2 lg:gap-1 mb-8">
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
        <Skeleton className="w-full h-6" />
      </div>
      <div className="flex justify-between text-md">
        <Skeleton className="w-full h-8" />
      </div>
    </>
  )
}
