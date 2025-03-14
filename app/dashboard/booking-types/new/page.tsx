"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingTypeForm } from "@/components/booking-types/booking-type-form";
import { BookingTypeAvailability } from "@/components/booking-types/booking-type-availability";
import { BookingTypeQuestions } from "@/components/booking-types/booking-type-questions";
import { BookingTypeIntegrations } from "@/components/booking-types/booking-type-integrations";
import { ChevronLeft } from "lucide-react";

export default function NewBookingTypePage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/dashboard/booking-types");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          Create Booking Type
        </h1>
      </div>

      <Tabs defaultValue="event_type" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="event_type">Event Type</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        <TabsContent value="event_type" className="space-y-6">
          <BookingTypeForm />
        </TabsContent>
        <TabsContent value="availability" className="space-y-6">
          <BookingTypeAvailability />
        </TabsContent>
        <TabsContent value="questions" className="space-y-6">
          <BookingTypeQuestions />
        </TabsContent>
        <TabsContent value="integrations" className="space-y-6">
          <BookingTypeIntegrations />
        </TabsContent>
      </Tabs>
    </div>
  );
}
