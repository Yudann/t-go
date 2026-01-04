-- Comprehensive Schema Fix for T-GO
-- Run this in Supabase SQL Editor

-- 1. Ensure routes table exists
CREATE TABLE IF NOT EXISTS public.routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    route_code VARCHAR(50) NOT NULL,
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    estimated_time INTEGER, -- in minutes
    fare DECIMAL(10,2) NOT NULL,
    color VARCHAR(20) DEFAULT '#7B2CBF',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Ensure tickets table exists with correct structure
CREATE TABLE IF NOT EXISTS public.tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    route_id UUID, -- Relation to routes
    start_point VARCHAR(255) NOT NULL,
    end_point VARCHAR(255) NOT NULL,
    passenger_count INTEGER DEFAULT 1,
    total_fare DECIMAL(10,2) NOT NULL,
    qr_code VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, used, expired
    payment_status VARCHAR(20) DEFAULT 'pending',
    travel_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fix Relations (Foreign Keys)

-- Tickets -> Routes
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tickets_route_id_fkey'
    ) THEN 
        ALTER TABLE public.tickets
        ADD CONSTRAINT tickets_route_id_fkey
        FOREIGN KEY (route_id)
        REFERENCES public.routes(id);
    END IF;
END $$;

-- Tickets -> Users (Profiles)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'tickets_user_id_fkey'
    ) THEN 
        ALTER TABLE public.tickets
        ADD CONSTRAINT tickets_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id); -- Or public.profiles(user_id) if preferred
    END IF;
END $$;

-- 4. Sample Data (Optional: Insert some routes if empty)
INSERT INTO public.routes (name, route_code, start_point, end_point, estimated_time, fare, color)
SELECT 'Cimone - Poris Plawad', 'R01', 'Terminal Cimone', 'Stasiun Poris', 45, 12000, '#7B2CBF'
WHERE NOT EXISTS (SELECT 1 FROM public.routes WHERE route_code = 'R01');

INSERT INTO public.routes (name, route_code, start_point, end_point, estimated_time, fare, color)
SELECT 'Perumnas - Cikokol', 'R02', 'Perumnas', 'Cikokol', 30, 8000, '#2563EB'
WHERE NOT EXISTS (SELECT 1 FROM public.routes WHERE route_code = 'R02');

-- 5. Enable RLS
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 6. Policies
-- Routes: Everyone can read
CREATE POLICY "Public routes access" ON public.routes FOR SELECT USING (true);

-- Tickets: Users can read/create their own
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
