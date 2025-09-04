import * as React from "react"
import { twJoin, twMerge } from "tailwind-merge"

export type IconNames =
  | "arrow-left"
  | "arrow-right"
  | "arrow-up-right"
  | "calendar"
  | "case"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "chevron-up"
  | "close"
  | "credit-card"
  | "heart"
  | "info"
  | "loader"
  | "map-pin"
  | "menu"
  | "minus"
  | "package"
  | "plus"
  | "receipt"
  | "search"
  | "sliders"
  | "trash"
  | "truck"
  | "undo"
  | "user"

const baseClasses = "w-4 h-auto shrink-0"

export type IconProps = React.ComponentPropsWithoutRef<"svg"> & {
  name: IconNames
  status?: number
  wrapperClassName?: string
}

export const Icon: React.FC<IconProps> = ({
  name,
  status = 0,
  wrapperClassName,
  className,
  ...rest
}) => (
  <div className={twMerge("relative shrink-0", wrapperClassName)}>
    {Boolean(status) && (
      <div
        className={twJoin(
          "absolute -right-1 -top-0.5 leading-none rounded-full flex items-center justify-center w-4 h-4 bg-black text-white text-[0.625rem]",
          status > 99 && "!text-[0.5rem]"
        )}
      >
        <span>{status > 99 ? "+99" : status}</span>
      </div>
    )}
    
    {name === "arrow-left" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    )}
    
    {name === "arrow-right" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )}
    
    {name === "arrow-up-right" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
      </svg>
    )}
    
    {name === "calendar" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    )}
    
    {name === "case" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )}
    
    {name === "check" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    )}
    
    {name === "chevron-down" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )}
    
    {name === "chevron-left" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    )}
    
    {name === "chevron-right" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    )}
    
    {name === "chevron-up" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    )}
    
    {name === "close" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    )}
    
    {name === "credit-card" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    )}
    
    {name === "heart" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    )}
    
    {name === "info" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )}
    
    {name === "loader" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    )}
    
    {name === "map-pin" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )}
    
    {name === "menu" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )}
    
    {name === "minus" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
      </svg>
    )}
    
    {name === "package" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )}
    
    {name === "plus" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    )}
    
    {name === "receipt" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )}
    
    {name === "search" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    )}
    
    {name === "sliders" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2" />
      </svg>
    )}
    
    {name === "trash" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    )}
    
    {name === "truck" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0zM13.828 10.172a4 4 0 00-5.656 0M9 10h6m-6 4h6m-6 4h6m-6 4h6" />
      </svg>
    )}
    
    {name === "undo" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    )}
    
    {name === "user" && (
      <svg {...rest} className={twMerge(baseClasses, className)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )}
  </div>
)
