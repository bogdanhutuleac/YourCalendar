"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { BookingType } from "@/types/booking-type"
import { toast } from "@/hooks/use-toast"

const daysOfWeek = [
  { id: "monday", label: "Monday" },
  { id: "tuesday", label: "Tuesday" },
  { id: "wednesday", label: "Wednesday" },
  { id: "thursday", label: "Thursday" },
  { id: "friday", label: "Friday" },
  { id: "saturday", label: "Saturday" },
  { id: "sunday", label: "Sunday" },
]

const timeSlots = Array.from({ length: 24 * 4 }, (_, i) => {
  const hour = Math.floor(i / 4)
  const minute = (i % 4) * 15
  const ampm = hour >= 12 ? "PM" : "AM"
  const hour12 = hour % 12 || 12
  return {
    value: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
    label: `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`,
  }
})

interface BookingTypeAvailabilityProps {
  bookingType?: BookingType | null
}

export function BookingTypeAvailability({ bookingType }: BookingTypeAvailabilityProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDays, setSelectedDays] = useState<Record<string, boolean>>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  })
  const [timeRanges, setTimeRanges] = useState<Record<string, { start: string; end: string }>>({
    monday: { start: "09:00", end: "17:00" },
    tuesday: { start: "09:00", end: "17:00" },
    wednesday: { start: "09:00", end: "17:00" },
    thursday: { start: "09:00", end: "17:00" },
    friday: { start: "09:00", end: "17:00" },
    saturday: { start: "09:00", end: "17:00" },
    sunday: { start: "09:00", end: "17:00" },
  })

  const handleDayChange = (day: string, checked: boolean) => {
    setSelectedDays((prev) => ({ ...prev, [day]: checked }))
  }

  const handleTimeChange = (day: string, type: "start" | "end", value: string) => {
    setTimeRanges((prev) => ({
      ...prev,
      [day]: { ...prev[day], [type]: value },
    }))
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast({
        title: "Availability updated",
        description: "Your availability settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Failed to save availability:", error)
      toast({
        title: "Error",
        description: "Failed to save availability settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
          <CardDescription>Set your weekly availability for this booking type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {daysOfWeek.map((day) => (
            <div key={day.id} className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${day.id}`}
                  checked={selectedDays[day.id]}
                  onCheckedChange={(checked) => handleDayChange(day.id, checked as boolean)}
                />
                <Label htmlFor={`day-${day.id}`} className="font-medium">
                  {day.label}
                </Label>
              </div>
              {selectedDays[day.id] && (
                <div className="ml-6 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`start-${day.id}`}>Start Time</Label>
                    <Select
                      value={timeRanges[day.id].start}
                      onValueChange={(value) => handleTimeChange(day.id, "start", value)}
                    >
                      <SelectTrigger id={`start-${day.id}`}>
                        <SelectValue placeholder="Start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={`start-${day.id}-${slot.value}`} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`end-${day.id}`}>End Time</Label>
                    <Select
                      value={timeRanges[day.id].end}
                      onValueChange={(value) => handleTimeChange(day.id, "end", value)}
                    >
                      <SelectTrigger id={`end-${day.id}`}>
                        <SelectValue placeholder="End time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((slot) => (
                          <SelectItem key={`end-${day.id}-${slot.value}`} value={slot.value}>
                            {slot.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              {day.id !== "sunday" && <Separator className="my-4" />}
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

