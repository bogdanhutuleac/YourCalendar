"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { BookingType } from "@/types/booking-type";
import { toast } from "@/hooks/use-toast";
import { Calendar, Mail, Video } from "lucide-react";
import {
  CalendarService,
  type ConnectedCalendar,
} from "@/lib/calendar-service";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  connected: boolean;
  enabled: boolean;
}

interface BookingTypeIntegrationsProps {
  bookingType?: BookingType | null;
}

export function BookingTypeIntegrations({
  bookingType,
}: BookingTypeIntegrationsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [connectedCalendars, setConnectedCalendars] = useState<
    ConnectedCalendar[]
  >([]);
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "google-calendar",
      name: "Google Calendar",
      description: "Automatically add events to your Google Calendar",
      icon: Calendar,
      connected: false,
      enabled: false,
    },
    {
      id: "outlook",
      name: "Microsoft Outlook",
      description: "Sync with your Outlook calendar",
      icon: Calendar,
      connected: false,
      enabled: false,
    },
    {
      id: "zoom",
      name: "Zoom",
      description: "Automatically create Zoom meetings for your bookings",
      icon: Video,
      connected: true,
      enabled: true,
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Add contacts to your Mailchimp lists",
      icon: Mail,
      connected: false,
      enabled: false,
    },
  ]);

  const calendarService = new CalendarService();

  useEffect(() => {
    const fetchCalendars = async () => {
      try {
        const calendars = await calendarService.getConnectedCalendars();
        setConnectedCalendars(calendars);

        // Update integrations based on connected calendars
        setIntegrations((prev) =>
          prev.map((integration) => {
            if (integration.id === "google-calendar") {
              const googleCalendar = calendars.find(
                (cal) => cal.provider === "google"
              );
              return {
                ...integration,
                connected: !!googleCalendar,
                enabled: !!googleCalendar,
              };
            } else if (integration.id === "outlook") {
              const outlookCalendar = calendars.find(
                (cal) => cal.provider === "outlook"
              );
              return {
                ...integration,
                connected: !!outlookCalendar,
                enabled: !!outlookCalendar,
              };
            }
            return integration;
          })
        );
      } catch (error) {
        console.error("Failed to fetch calendars:", error);
      }
    };

    fetchCalendars();
  }, []);

  const toggleIntegration = (id: string) => {
    setIntegrations(
      integrations.map((integration) =>
        integration.id === id
          ? { ...integration, enabled: !integration.enabled }
          : integration
      )
    );
  };

  const connectIntegration = async (id: string) => {
    if (id === "google-calendar") {
      try {
        await calendarService.connectCalendar("google");
      } catch (error) {
        console.error("Failed to connect Google Calendar:", error);
        toast({
          title: "Connection failed",
          description:
            "Failed to connect to Google Calendar. Please try again.",
          variant: "destructive",
        });
      }
    } else if (id === "outlook") {
      toast({
        title: "Connect integration",
        description: `This would open the OAuth flow for Microsoft Outlook.`,
      });
    } else {
      toast({
        title: "Connect integration",
        description: `This would open the OAuth flow for ${id}.`,
      });
    }
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // In a real implementation, you would save which calendars are enabled
      // for this booking type to your database

      toast({
        title: "Integrations updated",
        description:
          "Your integration settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Failed to save integrations:", error);
      toast({
        title: "Error",
        description: "Failed to save integration settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect and manage integrations for this booking type.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {integrations.map((integration) => (
            <div
              key={integration.id}
              className="flex items-center justify-between space-x-4 rounded-lg border p-4"
            >
              <div className="flex items-start gap-4">
                <div className="rounded-md bg-primary/10 p-2">
                  <integration.icon className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">{integration.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {integration.description}
                  </p>
                  {integration.connected &&
                    (integration.id === "google-calendar" ||
                      integration.id === "outlook") && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-green-600">
                          Connected to{" "}
                          {connectedCalendars.find(
                            (cal) =>
                              (cal.provider === "google" &&
                                integration.id === "google-calendar") ||
                              (cal.provider === "outlook" &&
                                integration.id === "outlook")
                          )?.name || "calendar"}
                        </p>
                      </div>
                    )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                {integration.connected ? (
                  <Switch
                    id={`integration-${integration.id}`}
                    checked={integration.enabled}
                    onCheckedChange={() => toggleIntegration(integration.id)}
                  />
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => connectIntegration(integration.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
