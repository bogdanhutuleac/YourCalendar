import type { BookingType } from "@/types/booking-type";
import { createClient } from "@/lib/supabase/server";

// Helper function to convert database booking type to our BookingType interface
function mapDbBookingTypeToBookingType(dbBookingType: any): BookingType {
  return {
    id: dbBookingType.id,
    name: dbBookingType.name,
    slug: dbBookingType.slug,
    description: dbBookingType.description || undefined,
    duration: dbBookingType.duration,
    location: dbBookingType.location || undefined,
    active: dbBookingType.active,
    createdAt: dbBookingType.created_at,
    updatedAt: dbBookingType.updated_at,
  };
}

// Get all booking types for the current user (server-side)
export async function getBookingTypesServer(): Promise<BookingType[]> {
  const supabase = await createClient();

  const { data: bookingTypes, error } = await supabase
    .from("booking_types")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching booking types:", error);
    throw new Error("Failed to fetch booking types");
  }

  return bookingTypes.map(mapDbBookingTypeToBookingType);
}

// Get a booking type by ID (server-side)
export async function getBookingTypeByIdServer(
  id: string
): Promise<BookingType | null> {
  const supabase = await createClient();

  const { data: bookingType, error } = await supabase
    .from("booking_types")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // PGRST116 is the error code for "no rows returned"
      return null;
    }
    console.error("Error fetching booking type:", error);
    throw new Error("Failed to fetch booking type");
  }

  return bookingType ? mapDbBookingTypeToBookingType(bookingType) : null;
}

// Create a new booking type (server-side)
export async function createBookingTypeServer(
  data: Partial<BookingType>
): Promise<BookingType> {
  const supabase = await createClient();

  const { data: newBookingType, error } = await supabase
    .from("booking_types")
    .insert({
      name: data.name,
      slug: data.slug,
      description: data.description,
      duration: data.duration,
      location: data.location,
      active: data.active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating booking type:", error);
    throw new Error("Failed to create booking type");
  }

  return mapDbBookingTypeToBookingType(newBookingType);
}

// Update an existing booking type (server-side)
export async function updateBookingTypeServer(
  id: string,
  data: Partial<BookingType>
): Promise<BookingType> {
  const supabase = await createClient();

  const { data: updatedBookingType, error } = await supabase
    .from("booking_types")
    .update({
      name: data.name,
      slug: data.slug,
      description: data.description,
      duration: data.duration,
      location: data.location,
      active: data.active,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating booking type:", error);
    throw new Error("Failed to update booking type");
  }

  return mapDbBookingTypeToBookingType(updatedBookingType);
}

// Delete a booking type (server-side)
export async function deleteBookingTypeServer(id: string): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("booking_types").delete().eq("id", id);

  if (error) {
    console.error("Error deleting booking type:", error);
    throw new Error("Failed to delete booking type");
  }
}

// Toggle the active status of a booking type (server-side)
export async function toggleBookingTypeStatusServer(
  id: string,
  active: boolean
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("booking_types")
    .update({ active })
    .eq("id", id);

  if (error) {
    console.error("Error toggling booking type status:", error);
    throw new Error("Failed to toggle booking type status");
  }
}

// Check if a slug is available (server-side)
export async function isSlugAvailableServer(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = await createClient();

  let query = supabase.from("booking_types").select("id").eq("slug", slug);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error checking slug availability:", error);
    throw new Error("Failed to check slug availability");
  }

  return data.length === 0;
}
