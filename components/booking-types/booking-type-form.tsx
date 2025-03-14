"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { BookingType } from "@/types/booking-type";
import {
  createBookingType,
  updateBookingType,
  isSlugAvailable,
} from "@/lib/booking-types";
import { toast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "URL is required")
    .regex(
      /^[a-z0-9-]+$/,
      "URL can only contain lowercase letters, numbers, and hyphens"
    ),
  description: z.string().optional(),
  duration: z.coerce.number().min(5, "Duration must be at least 5 minutes"),
  location: z.string().optional(),
  active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface BookingTypeFormProps {
  bookingType?: BookingType | null;
}

export function BookingTypeForm({ bookingType }: BookingTypeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: bookingType?.name || "",
      slug: bookingType?.slug || "",
      description: bookingType?.description || "",
      duration: bookingType?.duration || 30,
      location: bookingType?.location || "",
      active: bookingType?.active ?? true,
    },
  });

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  };

  // Watch the name field to auto-generate slug
  const watchName = form.watch("name");
  const watchSlug = form.watch("slug");

  // Auto-generate slug when name changes and slug is empty or hasn't been manually edited
  useEffect(() => {
    if (
      watchName &&
      (!watchSlug || watchSlug === generateSlug(form.getValues("name")))
    ) {
      form.setValue("slug", generateSlug(watchName), { shouldValidate: true });
    }
  }, [watchName, form, watchSlug]);

  // Check slug availability
  const checkSlugAvailability = async (slug: string) => {
    if (!slug) return;

    setIsCheckingSlug(true);
    try {
      const available = await isSlugAvailable(slug, bookingType?.id);
      if (!available) {
        form.setError("slug", {
          type: "manual",
          message: "This URL is already taken. Please choose another one.",
        });
      } else {
        form.clearErrors("slug");
      }
    } catch (error) {
      console.error("Failed to check slug availability:", error);
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Debounce slug check to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      if (watchSlug && form.getFieldState("slug").isDirty) {
        checkSlugAvailability(watchSlug);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [watchSlug, form]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Final check for slug availability
      if (!bookingType) {
        const available = await isSlugAvailable(data.slug);
        if (!available) {
          form.setError("slug", {
            type: "manual",
            message: "This URL is already taken. Please choose another one.",
          });
          setIsSubmitting(false);
          return;
        }
      } else {
        const available = await isSlugAvailable(data.slug, bookingType.id);
        if (!available) {
          form.setError("slug", {
            type: "manual",
            message: "This URL is already taken. Please choose another one.",
          });
          setIsSubmitting(false);
          return;
        }
      }

      if (bookingType) {
        await updateBookingType(bookingType.id, data);
        toast({
          title: "Booking type updated",
          description: "Your booking type has been updated successfully.",
        });
      } else {
        const newBookingType = await createBookingType(data);
        toast({
          title: "Booking type created",
          description: "Your new booking type has been created successfully.",
        });
        router.push(`/dashboard/booking-types/${newBookingType.id}`);
      }
    } catch (error) {
      console.error("Failed to save booking type:", error);
      toast({
        title: "Error",
        description: "Failed to save booking type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Set up the basic details for your booking type.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 30 Minute Meeting" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is the name that will be displayed to your clients.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <span className="text-sm text-muted-foreground mr-2">
                        tidycal.com/
                      </span>
                      <div className="relative w-full">
                        <Input placeholder="your-meeting-name" {...field} />
                        {isCheckingSlug && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    This is the URL that will be used for your booking page.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe what this meeting is about"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This description will be shown to your clients when booking.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Meeting Details</CardTitle>
            <CardDescription>
              Configure the details of your meeting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(Number.parseInt(value))
                      }
                      defaultValue={field.value.toString()}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 minutes</SelectItem>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="45">45 minutes</SelectItem>
                        <SelectItem value="60">60 minutes</SelectItem>
                        <SelectItem value="90">90 minutes</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    How long each meeting will last.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Zoom, Google Meet, Phone Call"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Where the meeting will take place.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Availability</CardTitle>
            <CardDescription>
              Control whether this booking type is active.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      When active, people can book this meeting type.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between border-t px-6 py-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
