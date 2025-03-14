import { google } from "googleapis";
import { CalendarEvent, ConnectedCalendar } from "@/lib/calendar-service";

// Create a new OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Generate an authentication URL
export function getAuthUrl() {
  const scopes = [
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ];

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
    prompt: "consent",
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });
}

// Exchange authorization code for tokens
export async function getTokens(code: string) {
  const { tokens } = await oauth2Client.getToken({
    code,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
  });
  return tokens;
}

// Set credentials for the OAuth2 client
export function setCredentials(tokens: any) {
  oauth2Client.setCredentials(tokens);
  return oauth2Client;
}

// Get user information
export async function getUserInfo(tokens: any) {
  const oauth2 = google.oauth2({
    auth: setCredentials(tokens),
    version: "v2",
  });

  const { data } = await oauth2.userinfo.get();
  return data;
}

// Get list of user's calendars
export async function getCalendars(tokens: any): Promise<ConnectedCalendar[]> {
  const calendar = google.calendar({
    version: "v3",
    auth: setCredentials(tokens),
  });

  const { data } = await calendar.calendarList.list();

  return (data.items || []).map((item: any) => ({
    id: item.id,
    provider: "google" as const,
    name: item.summary,
    email: item.id.includes("@") ? item.id : "",
    primary: item.primary || false,
  }));
}

// Get events from a calendar
export async function getEvents(
  tokens: any,
  calendarId: string,
  timeMin: Date,
  timeMax: Date
): Promise<CalendarEvent[]> {
  const calendar = google.calendar({
    version: "v3",
    auth: setCredentials(tokens),
  });

  const { data } = await calendar.events.list({
    calendarId,
    timeMin: timeMin.toISOString(),
    timeMax: timeMax.toISOString(),
    singleEvents: true,
    orderBy: "startTime",
  });

  return (data.items || []).map((item: any) => ({
    id: item.id,
    title: item.summary,
    description: item.description,
    startTime: new Date(item.start.dateTime || `${item.start.date}T00:00:00`),
    endTime: new Date(item.end.dateTime || `${item.end.date}T23:59:59`),
    location: item.location,
    calendarId,
    attendees: item.attendees?.map((attendee: any) => attendee.email) || [],
  }));
}

// Create a new event
export async function createEvent(
  tokens: any,
  calendarId: string,
  event: Omit<CalendarEvent, "id" | "calendarId">
) {
  const calendar = google.calendar({
    version: "v3",
    auth: setCredentials(tokens),
  });

  const { data } = await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: event.title,
      description: event.description,
      location: event.location,
      start: {
        dateTime: event.startTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: event.endTime.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      attendees: event.attendees?.map((email) => ({ email })),
    },
  });

  return data;
}
