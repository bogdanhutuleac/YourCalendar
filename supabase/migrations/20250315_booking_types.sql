-- Create booking_types table
CREATE TABLE IF NOT EXISTS public.booking_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL,
    location TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS booking_types_user_id_idx ON public.booking_types(user_id);

-- Create unique index on user_id and slug to ensure unique slugs per user
CREATE UNIQUE INDEX IF NOT EXISTS booking_types_user_id_slug_idx ON public.booking_types(user_id, slug);

-- Enable Row Level Security
ALTER TABLE public.booking_types ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to select their own booking types
CREATE POLICY select_own_booking_types ON public.booking_types
    FOR SELECT USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own booking types
CREATE POLICY insert_own_booking_types ON public.booking_types
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own booking types
CREATE POLICY update_own_booking_types ON public.booking_types
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policy to allow users to delete their own booking types
CREATE POLICY delete_own_booking_types ON public.booking_types
    FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.booking_types
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at(); 