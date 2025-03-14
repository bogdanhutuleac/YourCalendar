"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Clock,
  Copy,
  Edit,
  Link,
  MoreHorizontal,
  Trash,
  PlusCircle,
} from "lucide-react";
import type { BookingType } from "@/types/booking-type";
import {
  getBookingTypes,
  deleteBookingType,
  toggleBookingTypeStatus,
} from "@/lib/booking-types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

export function BookingTypesList() {
  const router = useRouter();
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingTypes = async () => {
      try {
        const data = await getBookingTypes();
        setBookingTypes(data);
      } catch (error) {
        console.error("Failed to fetch booking types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingTypes();
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/dashboard/booking-types/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBookingType(id);
      setBookingTypes(bookingTypes.filter((type) => type.id !== id));
      toast({
        title: "Booking type deleted",
        description: "The booking type has been deleted successfully.",
      });
    } catch (error) {
      console.error("Failed to delete booking type:", error);
      toast({
        title: "Error",
        description: "Failed to delete booking type. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleToggleStatus = async (id: string, active: boolean) => {
    try {
      await toggleBookingTypeStatus(id, active);
      setBookingTypes(
        bookingTypes.map((type) =>
          type.id === id ? { ...type, active } : type
        )
      );
      toast({
        title: active ? "Booking type activated" : "Booking type deactivated",
        description: `The booking type has been ${
          active ? "activated" : "deactivated"
        } successfully.`,
      });
    } catch (error) {
      console.error("Failed to toggle booking type status:", error);
      toast({
        title: "Error",
        description: "Failed to update booking type status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = (slug: string) => {
    const link = `https://tidycal.com/${slug}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied",
      description: "Booking link copied to clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50"></CardHeader>
            <CardContent className="h-32 bg-muted/30"></CardContent>
            <CardFooter className="h-12 bg-muted/20"></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (bookingTypes.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <h3 className="text-lg font-medium">No booking types found</h3>
          <p className="text-muted-foreground mt-2">
            Create your first booking type to get started.
          </p>
          <Button
            onClick={() => router.push("/dashboard/booking-types/new")}
            className="mt-4"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Booking Type
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookingTypes.map((bookingType) => (
          <Card key={bookingType.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="line-clamp-1">
                    {bookingType.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-1">
                    {bookingType.description || "No description"}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">More options</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => handleEdit(bookingType.id)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleCopyLink(bookingType.slug)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Copy Link</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => setDeleteId(bookingType.id)}
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{bookingType.duration} minutes</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {bookingType.location && (
                  <Badge variant="outline">{bookingType.location}</Badge>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between border-t bg-muted/50 px-6 py-3">
              <div className="flex items-center gap-2">
                <Switch
                  checked={bookingType.active}
                  onCheckedChange={(checked) =>
                    handleToggleStatus(bookingType.id, checked)
                  }
                  aria-label={`${
                    bookingType.active ? "Disable" : "Enable"
                  } booking type`}
                />
                <span className="text-sm font-medium">
                  {bookingType.active ? "Active" : "Inactive"}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1"
                onClick={() => handleCopyLink(bookingType.slug)}
              >
                <Link className="h-3.5 w-3.5" />
                <span className="text-xs">Share</span>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this booking type and all associated
              data. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteId) {
                  handleDelete(deleteId);
                  setDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
