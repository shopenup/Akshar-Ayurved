"use client"

import * as ReactAria from "react-aria-components"
import {
  UiSelectButton,
  UiSelectListBox,
  UiSelectIcon,
} from "@components/ui/Select"
import {
  UiCheckbox,
  UiCheckboxBox,
  UiCheckboxLabel,
} from "@components/ui/Checkbox"
import { UiDialogTrigger } from "@components/Dialog"

export const TypeFilter: React.FC<{
  types: Record<string, string>
  type?: string[]
  setQueryParams: (name: string, value: string[]) => void
}> = ({ type, types, setQueryParams }) => (
  <UiDialogTrigger>
    <UiSelectButton className="w-35">
      <span>Type</span>
      <UiSelectIcon />
    </UiSelectButton>
    <ReactAria.Popover className="w-64" placement="bottom left">
      <UiSelectListBox>
        <ReactAria.CheckboxGroup
          value={type ?? []}
          onChange={(value) => {
            setQueryParams("type", value)
          }}
          className="max-h-50 overflow-scroll"
        >
          {Object.entries(types).map(([key, value]) => (
            <UiCheckbox className="p-4" key={key} onPress={() => setQueryParams("type", [key])}>
              <UiCheckboxBox isSelected={type?.includes(key)} />
              <UiCheckboxLabel>{value}</UiCheckboxLabel>
            </UiCheckbox>
          ))}
        </ReactAria.CheckboxGroup>
      </UiSelectListBox>
    </ReactAria.Popover>
  </UiDialogTrigger>
)
