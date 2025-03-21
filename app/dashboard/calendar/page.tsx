"use client";

import React from "react";
import { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addWeeks,
  subWeeks,
  isToday,
  isSameDay,
  startOfDay,
  endOfDay,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  getDay,
  getDate,
  isSameMonth,
} from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CalendarService,
  type CalendarEvent,
  type ConnectedCalendar,
} from "@/lib/calendar-service";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<"day" | "week" | "month">("week");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [connectedCalendars, setConnectedCalendars] = useState<
    ConnectedCalendar[]
  >([]);
  const [selectedCalendar, setSelectedCalendar] =
    useState<ConnectedCalendar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  const calendarService = new CalendarService();

  useEffect(() => {
    const url = new URL(window.location.href);
    const errorParam = url.searchParams.get("error");
    const connectedParam = url.searchParams.get("connected");

    if (errorParam) {
      let errorMessage = "Failed to connect to Google Calendar.";

      switch (errorParam) {
        case "no_code":
          errorMessage = "No authorization code received from Google.";
          break;
        case "email_mismatch":
          errorMessage =
            "The Google account email does not match your login email.";
          break;
        case "token_storage":
          errorMessage = "Failed to store Google Calendar tokens.";
          break;
        case "callback_failed":
          errorMessage = "Google Calendar authentication callback failed.";
          break;
      }

      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });

      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }

    if (connectedParam === "true") {
      setConnectionSuccess(true);
      toast({
        title: "Success",
        description: "Google Calendar connected successfully!",
      });

      url.searchParams.delete("connected");
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const calendars = await calendarService.getConnectedCalendars();
        setConnectedCalendars(calendars);

        if (calendars.length > 0) {
          setSelectedCalendar(calendars[0]);
        }
      } catch (error) {
        console.error("Failed to fetch calendars:", error);
        toast({
          title: "Error",
          description: "Failed to load your calendars. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCalendars();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedCalendar) return;

      setIsLoading(true);
      try {
        // Set date range based on view type
        let start = startOfDay(currentDate); // Default to day view
        let end = endOfDay(currentDate); // Default to day view

        if (viewType === "day") {
          start = startOfDay(currentDate);
          end = endOfDay(currentDate);
        } else if (viewType === "week") {
          start = startOfWeek(currentDate);
          end = endOfWeek(currentDate);
        } else if (viewType === "month") {
          start = startOfMonth(currentDate);
          end = endOfMonth(currentDate);

          // Extend to include days from previous/next month that appear in the calendar
          start = startOfWeek(start);
          end = endOfWeek(end);
        }

        const calendarEvents = await calendarService.getEvents(
          selectedCalendar.id,
          start,
          end
        );
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        toast({
          title: "Error",
          description: "Failed to load calendar events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedCalendar, currentDate, viewType]);

  // Generate time slots for day view (from 7 AM to 8 PM)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 7; hour <= 20; hour++) {
      slots.push({
        time: new Date(currentDate).setHours(hour, 0, 0, 0),
        label: format(new Date().setHours(hour, 0, 0, 0), "h:mm a"),
      });
    }
    return slots;
  };

  const handlePrevious = () => {
    if (viewType === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (viewType === "day") {
      setCurrentDate(addDays(currentDate, -1));
    } else if (viewType === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (viewType === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (viewType === "day") {
      setCurrentDate(addDays(currentDate, 1));
    } else if (viewType === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCalendarChange = (calendarId: string) => {
    const calendar = connectedCalendars.find((cal) => cal.id === calendarId);
    if (calendar) {
      setSelectedCalendar(calendar);
    }
  };

  const handleConnectCalendar = async () => {
    try {
      await calendarService.connectCalendar("google");
      toast({
        title: "Success",
        description:
          "Calendar connected successfully. Refreshing your calendars...",
      });

      const calendars = await calendarService.getConnectedCalendars();
      setConnectedCalendars(calendars);

      if (calendars.length > 0) {
        setSelectedCalendar(calendars[0]);
      }
    } catch (error) {
      console.error("Failed to connect calendar:", error);
      toast({
        title: "Error",
        description: "Failed to connect calendar. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDayClick = (day: Date) => {
    setCurrentDate(day);
    setViewType("day");
  };

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="flex flex-col">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">
            {format(weekStart, "MMMM d")} -{" "}
            {format(addDays(weekStart, 6), "MMMM d, yyyy")}
          </h2>
        </div>
        <div className="grid grid-cols-7 gap-4">
          {weekDays.map((day, index) => (
            <div
              key={`header-${index}`}
              className="text-center p-2 cursor-pointer hover:bg-gray-50 rounded-md"
              onClick={() => handleDayClick(day)}
            >
              <div className="font-medium">{format(day, "EEE")}</div>
              <div
                className={`text-sm rounded-full w-8 h-8 flex items-center justify-center mx-auto ${
                  isToday(day) ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                {format(day, "d")}
              </div>
            </div>
          ))}

          {weekDays.map((day, dayIndex) => {
            const dayEvents = events.filter((event) =>
              isSameDay(event.startTime, day)
            );

            return (
              <div
                key={`day-${dayIndex}`}
                className="min-h-[200px] border rounded-md p-2 overflow-y-auto hover:bg-gray-50 cursor-pointer"
                onClick={() => handleDayClick(day)}
              >
                {dayEvents.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm h-full flex items-center justify-center">
                    No events
                  </div>
                ) : (
                  dayEvents.map((event, eventIndex) => (
                    <Card
                      key={`event-${eventIndex}`}
                      className="mb-2 bg-primary/10 hover:bg-primary/20 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent triggering the parent onClick
                        // You can add event details view here in the future
                      }}
                    >
                      <CardContent className="p-2">
                        <div className="text-sm font-medium">{event.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(event.startTime, "h:mm a")} -{" "}
                          {format(event.endTime, "h:mm a")}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = generateTimeSlots();
    const dayStart = startOfDay(currentDate);
    const dayEnd = endOfDay(currentDate);
    const dayEvents = events.filter(
      (event) => event.startTime >= dayStart && event.startTime <= dayEnd
    );

    return (
      <div className="flex flex-col">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </h2>
        </div>
        <div className="grid grid-cols-[100px_1fr] gap-2">
          {timeSlots.map((slot, index) => {
            const slotEvents = dayEvents.filter(
              (event) =>
                new Date(event.startTime).getHours() ===
                new Date(slot.time).getHours()
            );

            return (
              <React.Fragment key={`time-${index}`}>
                <div className="text-right pr-4 py-2 text-sm text-gray-500">
                  {slot.label}
                </div>
                <div className="border rounded-md min-h-[60px] relative">
                  {slotEvents.map((event, eventIndex) => (
                    <Card
                      key={`event-${eventIndex}`}
                      className="mb-1 bg-primary/10 hover:bg-primary/20 cursor-pointer absolute inset-x-0 mx-1"
                      style={{
                        top: `${
                          (new Date(event.startTime).getMinutes() / 60) * 100
                        }%`,
                        height: `${
                          ((new Date(event.endTime).getTime() -
                            new Date(event.startTime).getTime()) /
                            (1000 * 60 * 60)) *
                          100
                        }%`,
                        minHeight: "20px",
                      }}
                    >
                      <CardContent className="p-2">
                        <div className="text-sm font-medium truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(event.startTime, "h:mm a")} -{" "}
                          {format(event.endTime, "h:mm a")}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // Group days into weeks
    const weeks: Date[][] = [];
    let week: Date[] = [];

    days.forEach((day) => {
      week.push(day);
      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    });

    return (
      <div className="flex flex-col">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center font-medium py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-2">
          {weeks.map((week, weekIndex) => (
            <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1">
              {week.map((day, dayIndex) => {
                const dayEvents = events.filter((event) =>
                  isSameDay(event.startTime, day)
                );

                return (
                  <div
                    key={`day-${dayIndex}`}
                    className={`min-h-[100px] border rounded-md p-1 ${
                      !isSameMonth(day, monthStart)
                        ? "bg-gray-50 text-gray-400"
                        : ""
                    } ${
                      isToday(day) ? "border-primary" : ""
                    } hover:bg-gray-50 cursor-pointer`}
                    onClick={() => handleDayClick(day)}
                  >
                    <div
                      className={`text-right text-sm mb-1 ${
                        isToday(day)
                          ? "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center ml-auto"
                          : ""
                      }`}
                    >
                      {getDate(day)}
                    </div>
                    <div className="overflow-y-auto max-h-[80px]">
                      {dayEvents.slice(0, 3).map((event, eventIndex) => (
                        <div
                          key={`event-${eventIndex}`}
                          className="text-xs bg-primary/10 p-1 mb-1 rounded truncate"
                        >
                          {format(event.startTime, "h:mm a")} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <Button onClick={handleConnectCalendar}>
          <Plus className="h-4 w-4 mr-2" />
          Connect Calendar
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {connectionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">
            Google Calendar connected successfully! Your calendars and events
            should now be visible.
          </span>
        </div>
      )}

      {isLoading && connectedCalendars.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">
              Loading your calendars...
            </h2>
          </div>
        </div>
      ) : connectedCalendars.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="mt-4 text-lg font-medium">No calendars connected</h2>
            <p className="mt-2 text-muted-foreground">
              Connect a calendar to view and manage your events.
            </p>
            <Button className="mt-4" onClick={handleConnectCalendar}>
              <Plus className="h-4 w-4 mr-2" />
              Connect Calendar
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Select
                value={selectedCalendar?.id}
                onValueChange={handleCalendarChange}
              >
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select a calendar" />
                </SelectTrigger>
                <SelectContent>
                  {connectedCalendars.map((calendar) => (
                    <SelectItem key={calendar.id} value={calendar.id}>
                      {calendar.name} ({calendar.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePrevious}
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={handleToday}
                  className="flex items-center"
                >
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Today
                </Button>
                <div className="font-medium min-w-[150px] text-center">
                  {format(currentDate, "MMMM d, yyyy")}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNext}
                  aria-label="Next"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewType === "day" ? "default" : "outline"}
                onClick={() => setViewType("day")}
              >
                Day
              </Button>
              <Button
                variant={viewType === "week" ? "default" : "outline"}
                onClick={() => setViewType("week")}
              >
                Week
              </Button>
              <Button
                variant={viewType === "month" ? "default" : "outline"}
                onClick={() => setViewType("month")}
              >
                Month
              </Button>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              {viewType === "week" && renderWeekView()}
              {viewType === "day" && renderDayView()}
              {viewType === "month" && renderMonthView()}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
