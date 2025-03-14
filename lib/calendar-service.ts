import { createClient } from "@/lib/supabase/client";

// Types for calendar providers
export type CalendarProvider = "google" | "outlook" | "apple";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  attendees?: string[];
  calendarId: string;
}

export interface ConnectedCalendar {
  id: string;
  provider: CalendarProvider;
  name: string;
  email: string;
  primary: boolean;
}

// Class to handle calendar operations
export class CalendarService {
  private supabase = createClient();

  /**
   * Get all connected calendars for the current user
   */
  async getConnectedCalendars(): Promise<ConnectedCalendar[]> {
    try {
      // Try to fetch Google calendars
      const response = await fetch("/api/google/calendar/list");

      if (!response.ok) {
        const data = await response.json();

        // If the calendar is not connected, return an empty array
        if (data.code === "not_connected") {
          return [];
        }

        throw new Error(data.error || "Failed to fetch calendars");
      }

      const { calendars } = await response.json();
      return calendars;
    } catch (error) {
      console.error("Error fetching calendars:", error);
      // Return an empty array if there's an error
      return [];
    }
  }

  /**
   * Connect a new calendar
   */
  async connectCalendar(
    provider: CalendarProvider
  ): Promise<ConnectedCalendar> {
    if (provider === "google") {
      try {
        // Get the auth URL
        const response = await fetch("/api/google/calendar/auth");

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Failed to get auth URL");
        }

        const { url } = await response.json();

        // Redirect to the auth URL
        window.location.href = url;

        // This is a placeholder return since the user will be redirected
        return {
          id: "redirecting",
          provider,
          name: "Redirecting...",
          email: "",
          primary: false,
        };
      } catch (error) {
        console.error("Error connecting to Google Calendar:", error);
        throw error;
      }
    }

    throw new Error(`Calendar provider ${provider} not supported`);
  }

  /**
   * Get events from a connected calendar
   */
  async getEvents(
    calendarId: string,
    startDate: Date,
    endDate: Date
  ): Promise<CalendarEvent[]> {
    try {
      // Fetch events from the API
      const url = new URL(
        "/api/google/calendar/events",
        window.location.origin
      );
      url.searchParams.append("calendarId", calendarId);
      url.searchParams.append("timeMin", startDate.toISOString());
      url.searchParams.append("timeMax", endDate.toISOString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to fetch events");
      }

      const { events } = await response.json();

      // Convert string dates to Date objects
      return events.map((event: any) => ({
        ...event,
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime),
      }));
    } catch (error) {
      console.error("Error fetching events:", error);
      return [];
    }
  }

  /**
   * Create a new event in a connected calendar
   */
  async createEvent(
    calendarId: string,
    event: Omit<CalendarEvent, "id" | "calendarId">
  ): Promise<CalendarEvent> {
    // This would be implemented to create an event via the API
    // For now, return a mock created event
    return {
      id: `event-${Date.now()}`,
      ...event,
      calendarId,
    };
  }

  /**
   * Disconnect a calendar
   */
  async disconnectCalendar(calendarId: string): Promise<void> {
    // This would be implemented to disconnect a calendar via the API
    console.log(`Disconnecting calendar ${calendarId}...`);
  }
}
