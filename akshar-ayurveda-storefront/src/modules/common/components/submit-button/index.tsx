"use client"

import React from "react"
import { Button, ButtonProps } from "@components/Button"

export function SubmitButton(props: Omit<ButtonProps, "type">) {
  return (
    <Button {...props} type="submit" isLoading={props.isLoading} />
  )
}
