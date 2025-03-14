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
  try {
    const supabase = await createClient();

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
      .eq("user_id", user.id) // Only get booking types for the current user
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching booking types:", error);
      throw new Error(`Failed to fetch booking types: ${error.message}`);
    }

    return bookingTypes ? bookingTypes.map(mapDbBookingTypeToBookingType) : [];
  } catch (error) {
    console.error("Unexpected error in getBookingTypesServer:", error);
    // Return empty array instead of throwing to prevent UI from breaking
    return [];
  }
}

// Get a booking type by ID (server-side)
export async function getBookingTypeByIdServer(
  id: string
): Promise<BookingType | null> {
  try {
    const supabase = await createClient();

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
      .eq("user_id", user.id) // Only get booking types for the current user
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
    console.error("Unexpected error in getBookingTypeByIdServer:", error);
    return null;
  }
}

// Create a new booking type (server-side)
export async function createBookingTypeServer(
  data: Partial<BookingType>
): Promise<BookingType> {
  try {
    const supabase = await createClient();

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
    console.error("Unexpected error in createBookingTypeServer:", error);
    throw error;
  }
}

// Update an existing booking type (server-side)
export async function updateBookingTypeServer(
  id: string,
  data: Partial<BookingType>
): Promise<BookingType> {
  try {
    const supabase = await createClient();

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
    console.error("Unexpected error in updateBookingTypeServer:", error);
    throw error;
  }
}

// Delete a booking type (server-side)
export async function deleteBookingTypeServer(id: string): Promise<void> {
  try {
    const supabase = await createClient();

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
    console.error("Unexpected error in deleteBookingTypeServer:", error);
    throw error;
  }
}

// Toggle the active status of a booking type (server-side)
export async function toggleBookingTypeStatusServer(
  id: string,
  active: boolean
): Promise<void> {
  try {
    const supabase = await createClient();

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
    console.error("Unexpected error in toggleBookingTypeStatusServer:", error);
    throw error;
  }
}

// Check if a slug is available (server-side)
export async function isSlugAvailableServer(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  try {
    const supabase = await createClient();

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
    console.error("Unexpected error in isSlugAvailableServer:", error);
    return false;
  }
}
