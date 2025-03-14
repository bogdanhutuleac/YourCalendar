"use client";

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

  const calendarService = new CalendarService();

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
        const start = startOfWeek(currentDate);
        const end = endOfWeek(currentDate);
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
  }, [selectedCalendar, currentDate]);

  const handlePrevious = () => {
    if (viewType === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else if (viewType === "day") {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const handleNext = () => {
    if (viewType === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else if (viewType === "day") {
      setCurrentDate(addDays(currentDate, 1));
    }
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

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="grid grid-cols-7 gap-4">
        {weekDays.map((day, index) => (
          <div key={`header-${index}`} className="text-center p-2">
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

        {weekDays.map((day, dayIndex) => (
          <div
            key={`day-${dayIndex}`}
            className="min-h-[200px] border rounded-md p-2"
          >
            {events
              .filter((event) => isSameDay(event.startTime, day))
              .map((event, eventIndex) => (
                <Card
                  key={`event-${eventIndex}`}
                  className="mb-2 bg-primary/10 hover:bg-primary/20 cursor-pointer"
                >
                  <CardContent className="p-2">
                    <div className="text-sm font-medium">{event.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {format(event.startTime, "h:mm a")} -{" "}
                      {format(event.endTime, "h:mm a")}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        ))}
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
                <Button variant="outline" size="icon" onClick={handlePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="font-medium">
                  {format(currentDate, "MMMM d, yyyy")}
                </div>
                <Button variant="outline" size="icon" onClick={handleNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewType === "day" ? "default" : "outline"}
                onClick={() => setViewType("day")}
                className="text-sm"
              >
                Day
              </Button>
              <Button
                variant={viewType === "week" ? "default" : "outline"}
                onClick={() => setViewType("week")}
                className="text-sm"
              >
                Week
              </Button>
              <Button
                variant={viewType === "month" ? "default" : "outline"}
                onClick={() => setViewType("month")}
                className="text-sm"
              >
                Month
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p>Loading events...</p>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              {viewType === "week" && renderWeekView()}
            </div>
          )}
        </>
      )}
    </div>
  );
}
