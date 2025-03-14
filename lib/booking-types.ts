import type { BookingType } from "@/types/booking-type";
import { createClient } from "@/lib/supabase/client";
import { createServerClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

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

// Get all booking types for the current user
export async function getBookingTypes(): Promise<BookingType[]> {
  const supabase = createClient();

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

// Get a booking type by ID
export async function getBookingTypeById(
  id: string
): Promise<BookingType | null> {
  const supabase = createClient();

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

// Create a new booking type
export async function createBookingType(
  data: Partial<BookingType>
): Promise<BookingType> {
  const supabase = createClient();

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

// Update an existing booking type
export async function updateBookingType(
  id: string,
  data: Partial<BookingType>
): Promise<BookingType> {
  const supabase = createClient();

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

// Delete a booking type
export async function deleteBookingType(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("booking_types").delete().eq("id", id);

  if (error) {
    console.error("Error deleting booking type:", error);
    throw new Error("Failed to delete booking type");
  }
}

// Toggle the active status of a booking type
export async function toggleBookingTypeStatus(
  id: string,
  active: boolean
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("booking_types")
    .update({ active })
    .eq("id", id);

  if (error) {
    console.error("Error toggling booking type status:", error);
    throw new Error("Failed to toggle booking type status");
  }
}

// Check if a slug is available (not used by any other booking type for the current user)
export async function isSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const supabase = createClient();

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
