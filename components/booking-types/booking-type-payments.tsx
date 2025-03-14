"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { BookingType } from "@/types/booking-type";
import { toast } from "@/hooks/use-toast";

interface BookingTypePaymentsProps {
  bookingType?: BookingType | null;
}

export function BookingTypePayments({ bookingType }: BookingTypePaymentsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enablePayments, setEnablePayments] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("stripe");
  const [price, setPrice] = useState("0");
  const [currency, setCurrency] = useState("USD");

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      // Here you would implement the API call to save the payment settings
      // For now, we'll just simulate a successful save
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: "Payment settings updated",
        description: "Your payment settings have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving payment settings:", error);
      toast({
        title: "Error saving payment settings",
        description:
          "There was a problem saving your payment settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Settings</CardTitle>
        <CardDescription>
          Configure payment options for this booking type.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="enable-payments" className="font-medium">
              Enable Payments
            </Label>
            <Switch
              id="enable-payments"
              checked={enablePayments}
              onCheckedChange={setEnablePayments}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Require payment when someone books this event type.
          </p>
        </div>

        {enablePayments && (
          <>
            <Separator />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Payment Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
}
