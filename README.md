# Calendar Integration for Booking App

This application provides calendar integration features that allow users to connect their external calendars (Google Calendar, Outlook, etc.), view their events, and sync booking events with their calendars.

## Features

- **Calendar Connections**: Connect to external calendar providers like Google Calendar and Microsoft Outlook
- **Calendar View**: View your calendar events in day, week, or month format
- **Booking Integration**: When a booking is created, it can be automatically added to your connected calendars
- **Availability Sync**: Your availability for booking types can be determined based on your existing calendar events

## Implementation Details

### Calendar Service

The calendar integration is implemented through the `CalendarService` class in `lib/calendar-service.ts`. This service provides methods for:

- Getting connected calendars
- Connecting new calendars via OAuth
- Fetching events from connected calendars
- Creating events in connected calendars
- Disconnecting calendars

### Integration with Booking Types

The booking type creation and editing pages include an "Integrations" tab where users can enable or disable calendar integrations for specific booking types. When a booking type has calendar integration enabled:

1. The system checks for availability based on the user's calendar events
2. When a booking is created, it automatically adds the event to the user's calendar

### Calendar Page

The application includes a dedicated calendar page at `/dashboard/calendar` where users can:

- View their calendar events
- Switch between different connected calendars
- Navigate between different time periods (day, week, month)
- Connect new calendars

## Future Enhancements

- Two-way sync with external calendars
- Calendar event editing
- Multiple calendar selection
- Color coding for different event types
- Calendar sharing options

## Getting Started

1. Navigate to the Calendar page from the sidebar
2. Click "Connect Calendar" to connect your Google Calendar or Outlook account
3. Once connected, your calendar events will be displayed
4. Go to Booking Types and enable calendar integration for your booking types

## Technical Notes

The current implementation uses mock data for demonstration purposes. In a production environment, you would need to:

1. Set up OAuth credentials for Google Calendar and Microsoft Graph API
2. Implement proper token storage and refresh mechanisms
3. Replace the mock API calls with actual API requests to the calendar providers
4. Add proper error handling and rate limiting
