"use client"

import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function BookingTypesHeader() {
  const router = useRouter()

  const handleCreateNew = () => {
    router.push("/dashboard/booking-types/new")
  }

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold tracking-tight">Booking Types</h1>
      <Button onClick={handleCreateNew}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New
      </Button>
    </div>
  )
}

