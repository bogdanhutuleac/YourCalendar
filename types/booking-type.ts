export interface BookingType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  duration: number;
  location?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
