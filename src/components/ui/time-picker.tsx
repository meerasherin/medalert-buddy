
"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  date: Date | undefined
  setDate: (date: Date | undefined) => void
  className?: string
}

export function TimePicker({ date, setDate, className }: TimePickerProps) {
  const minuteRef = React.useRef<HTMLInputElement>(null)
  const hourRef = React.useRef<HTMLInputElement>(null)

  // This function ensures that the hour is always between 0 and 23
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHour = parseInt(e.target.value)
    
    if (isNaN(newHour)) {
      return
    }

    const newDate = date ? new Date(date) : new Date()
    newDate.setHours(Math.max(0, Math.min(23, newHour)))
    setDate(newDate)

    if (e.target.value.length === 2) {
      minuteRef.current?.focus()
    }
  }

  // This function ensures that the minute is always between 0 and 59
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMinute = parseInt(e.target.value)
    
    if (isNaN(newMinute)) {
      return
    }

    const newDate = date ? new Date(date) : new Date()
    newDate.setMinutes(Math.max(0, Math.min(59, newMinute)))
    setDate(newDate)
  }

  // Format the hour and minute to ensure they're always 2 digits
  const hour = date ? date.getHours().toString().padStart(2, '0') : ''
  const minute = date ? date.getMinutes().toString().padStart(2, '0') : ''

  return (
    <div className={cn("flex items-end gap-2", className)}>
      <div className="grid gap-1 text-center">
        <Label htmlFor="hour" className="text-xs">Hour</Label>
        <Input
          ref={hourRef}
          id="hour"
          className="w-14 text-center"
          value={hour}
          onChange={handleHourChange}
          placeholder="00"
          max={23}
          min={0}
        />
      </div>
      <div className="text-center pb-2">:</div>
      <div className="grid gap-1 text-center">
        <Label htmlFor="minute" className="text-xs">Minute</Label>
        <Input
          ref={minuteRef}
          id="minute"
          className="w-14 text-center"
          value={minute}
          onChange={handleMinuteChange}
          placeholder="00"
          max={59}
          min={0}
        />
      </div>
      <div className="pb-2">
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}

export function TimePickerDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date())
  
  return <TimePicker date={date} setDate={setDate} />
}
