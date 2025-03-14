import type { BookingType } from "@/types/booking-type";

// Mock data for booking types
const mockBookingTypes: BookingType[] = [
  {
    id: "1",
    name: "30 Minute Meeting",
    slug: "30-minute-meeting",
    description: "A quick 30 minute meeting to discuss your project.",
    duration: 30,
    location: "Zoom",
    active: true,
    createdAt: "2024-01-01T12:00:00.000Z",
    updatedAt: "2024-01-01T12:00:00.000Z",
  },
  {
    id: "2",
    name: "60 Minute Consultation",
    slug: "60-minute-consultation",
    description:
      "An in-depth 60 minute consultation to discuss your business needs.",
    duration: 60,
    location: "Google Meet",
    active: true,
    createdAt: "2024-01-02T12:00:00.000Z",
    updatedAt: "2024-01-02T12:00:00.000Z",
  },
  {
    id: "3",
    name: "15 Minute Quick Chat",
    slug: "15-minute-quick-chat",
    description: "A brief 15 minute chat to answer your questions.",
    duration: 15,
    location: "Phone Call",
    active: false,
    createdAt: "2024-01-03T12:00:00.000Z",
    updatedAt: "2024-01-03T12:00:00.000Z",
  },
];

// Simulate API calls with a delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getBookingTypes(): Promise<BookingType[]> {
  await delay(1000);
  return [...mockBookingTypes];
}

export async function getBookingTypeById(
  id: string
): Promise<BookingType | null> {
  await delay(800);
  const bookingType = mockBookingTypes.find((type) => type.id === id);
  return bookingType ? { ...bookingType } : null;
}

export async function createBookingType(
  data: Partial<BookingType>
): Promise<BookingType> {
  await delay(1500);
  const timestamp = new Date().toISOString();
  const newId = Math.random().toString(36).substring(2, 9);
  const newBookingType: BookingType = {
    id: newId,
    name: data.name || "New Booking Type",
    slug: data.slug || `new-booking-type-${newId}`,
    description: data.description,
    duration: data.duration || 30,
    location: data.location,
    active: data.active ?? true,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  return newBookingType;
}

export async function updateBookingType(
  id: string,
  data: Partial<BookingType>
): Promise<BookingType> {
  await delay(1200);
  // In a real app, this would update the database
  const timestamp = new Date().toISOString();
  return {
    id,
    name: data.name || "Updated Booking Type",
    slug: data.slug || `updated-booking-type-${id}`,
    description: data.description,
    duration: data.duration || 30,
    location: data.location,
    active: data.active ?? true,
    createdAt: data.createdAt || timestamp,
    updatedAt: timestamp,
  };
}

export async function deleteBookingType(id: string): Promise<void> {
  await delay(1000);
  // In a real app, this would delete from the database
}

export async function toggleBookingTypeStatus(
  id: string,
  active: boolean
): Promise<void> {
  await delay(800);
  // In a real app, this would update the database
}
