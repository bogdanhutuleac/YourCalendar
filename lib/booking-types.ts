import type { BookingType } from "@/types/booking-type";
import { createClient } from "@/lib/supabase/client";

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
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      // Return empty array instead of throwing if user is not authenticated
      return [];
    }

    const { data: bookingTypes, error } = await supabase
      .from("booking_types")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching booking types:", error);
      throw new Error(`Failed to fetch booking types: ${error.message}`);
    }

    return bookingTypes ? bookingTypes.map(mapDbBookingTypeToBookingType) : [];
  } catch (error) {
    console.error("Unexpected error in getBookingTypes:", error);
    // Return empty array instead of throwing to prevent UI from breaking
    return [];
  }
}

// Get a booking type by ID
export async function getBookingTypeById(
  id: string
): Promise<BookingType | null> {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return null;
    }

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
      throw new Error(`Failed to fetch booking type: ${error.message}`);
    }

    return bookingType ? mapDbBookingTypeToBookingType(bookingType) : null;
  } catch (error) {
    console.error("Unexpected error in getBookingTypeById:", error);
    return null;
  }
}

// Create a new booking type
export async function createBookingType(
  data: Partial<BookingType>
): Promise<BookingType> {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("You must be logged in to create a booking type");
    }

    const { data: newBookingType, error } = await supabase
      .from("booking_types")
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        duration: data.duration,
        location: data.location,
        active: data.active ?? true,
        user_id: user.id, // Add user_id to the booking type
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating booking type:", error);
      throw new Error(`Failed to create booking type: ${error.message}`);
    }

    return mapDbBookingTypeToBookingType(newBookingType);
  } catch (error) {
    console.error("Unexpected error in createBookingType:", error);
    throw error;
  }
}

// Update an existing booking type
export async function updateBookingType(
  id: string,
  data: Partial<BookingType>
): Promise<BookingType> {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("You must be logged in to update a booking type");
    }

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
      .eq("user_id", user.id) // Ensure the user can only update their own booking types
      .select()
      .single();

    if (error) {
      console.error("Error updating booking type:", error);
      throw new Error(`Failed to update booking type: ${error.message}`);
    }

    return mapDbBookingTypeToBookingType(updatedBookingType);
  } catch (error) {
    console.error("Unexpected error in updateBookingType:", error);
    throw error;
  }
}

// Delete a booking type
export async function deleteBookingType(id: string): Promise<void> {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("You must be logged in to delete a booking type");
    }

    const { error } = await supabase
      .from("booking_types")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id); // Ensure the user can only delete their own booking types

    if (error) {
      console.error("Error deleting booking type:", error);
      throw new Error(`Failed to delete booking type: ${error.message}`);
    }
  } catch (error) {
    console.error("Unexpected error in deleteBookingType:", error);
    throw error;
  }
}

// Toggle the active status of a booking type
export async function toggleBookingTypeStatus(
  id: string,
  active: boolean
): Promise<void> {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      throw new Error("You must be logged in to update a booking type");
    }

    const { error } = await supabase
      .from("booking_types")
      .update({ active })
      .eq("id", id)
      .eq("user_id", user.id); // Ensure the user can only update their own booking types

    if (error) {
      console.error("Error toggling booking type status:", error);
      throw new Error(`Failed to toggle booking type status: ${error.message}`);
    }
  } catch (error) {
    console.error("Unexpected error in toggleBookingTypeStatus:", error);
    throw error;
  }
}

// Check if a slug is available (not used by any other booking type for the current user)
export async function isSlugAvailable(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const supabase = createClient();

    // Check if user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      // Return false if user is not authenticated
      return false;
    }

    let query = supabase
      .from("booking_types")
      .select("id")
      .eq("slug", slug)
      .eq("user_id", user.id); // Only check slugs for the current user

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error checking slug availability:", error);
      throw new Error(`Failed to check slug availability: ${error.message}`);
    }

    return !data || data.length === 0;
  } catch (error) {
    console.error("Unexpected error in isSlugAvailable:", error);
    return false;
  }
}
