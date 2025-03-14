"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookingTypeForm } from "@/components/booking-types/booking-type-form";
import { BookingTypeAvailability } from "@/components/booking-types/booking-type-availability";
import { BookingTypeQuestions } from "@/components/booking-types/booking-type-questions";
import { BookingTypeIntegrations } from "@/components/booking-types/booking-type-integrations";
import { ChevronLeft } from "lucide-react";
import { getBookingTypeById } from "@/lib/booking-types";
import type { BookingType } from "@/types/booking-type";

export default function EditBookingTypePage() {
  const params = useParams();
  const router = useRouter();
  const [bookingType, setBookingType] = useState<BookingType | null>(null);
  const [loading, setLoading] = useState(true);
  const id = params.id as string;

  useEffect(() => {
    const fetchBookingType = async () => {
      try {
        const data = await getBookingTypeById(id);
        setBookingType(data);
      } catch (error) {
        console.error("Failed to fetch booking type:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingType();
  }, [id]);

  const handleBack = () => {
    router.push("/dashboard/booking-types");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!bookingType && !loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h3 className="text-lg font-medium">Booking type not found</h3>
            <p className="text-muted-foreground mt-2">
              The booking type you're looking for doesn't exist or you don't
              have access to it.
            </p>
            <Button onClick={handleBack} className="mt-4">
              Go back to booking types
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {id === "new" ? "Create Booking Type" : `Edit: ${bookingType?.name}`}
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
          <BookingTypeForm bookingType={bookingType} />
        </TabsContent>
        <TabsContent value="availability" className="space-y-6">
          <BookingTypeAvailability bookingType={bookingType} />
        </TabsContent>
        <TabsContent value="questions" className="space-y-6">
          <BookingTypeQuestions bookingType={bookingType} />
        </TabsContent>
        <TabsContent value="integrations" className="space-y-6">
          <BookingTypeIntegrations bookingType={bookingType} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
