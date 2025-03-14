import { BookingTypesList } from "@/components/booking-types/booking-types-list"
import { BookingTypesHeader } from "@/components/booking-types/booking-types-header"

export default function BookingTypesPage() {
  return (
    <div className="space-y-6">
      <BookingTypesHeader />
      <BookingTypesList />
    </div>
  )
}

