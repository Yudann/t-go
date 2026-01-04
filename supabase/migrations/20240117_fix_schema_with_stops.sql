-- Comprehensive Schema Fix for T-GO (Updated with Route Stops)
-- Run this in Supabase SQL Editor

--------------------------------------------------------------
-- 1. Ensure routes table exists
--------------------------------------------------------------
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

--------------------------------------------------------------
-- 2. Ensure route_stops table exists (This was missing!)
--------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL,
    stop_name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    stop_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (route_id) REFERENCES public.routes(id) ON DELETE CASCADE
);

--------------------------------------------------------------
-- 3. Ensure tickets table exists with correct structure
--------------------------------------------------------------
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

--------------------------------------------------------------
-- 4. Fix Relations (Foreign Keys) if missing
--------------------------------------------------------------

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
        REFERENCES auth.users(id); 
    END IF;
END $$;

--------------------------------------------------------------
-- 5. Enable RLS and Create Policies
--------------------------------------------------------------
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.route_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- Routes: Public access
DROP POLICY IF EXISTS "Public routes access" ON public.routes;
CREATE POLICY "Public routes access" ON public.routes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public route stops access" ON public.route_stops;
CREATE POLICY "Public route stops access" ON public.route_stops FOR SELECT USING (true);

-- Tickets: Users can read/create their own
DROP POLICY IF EXISTS "Users can view own tickets" ON public.tickets;
CREATE POLICY "Users can view own tickets" ON public.tickets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own tickets" ON public.tickets;
CREATE POLICY "Users can create own tickets" ON public.tickets FOR INSERT WITH CHECK (auth.uid() = user_id);

--------------------------------------------------------------
-- 6. Sample Data Generation (Routes & Stops)
--------------------------------------------------------------
-- Create R01 Route
INSERT INTO public.routes (name, route_code, start_point, end_point, estimated_time, fare, color)
SELECT 'Cimone - Poris Plawad', 'R01', 'Terminal Cimone', 'Stasiun Poris', 45, 12000, '#7B2CBF'
WHERE NOT EXISTS (SELECT 1 FROM public.routes WHERE route_code = 'R01');

-- Create R02 Route
INSERT INTO public.routes (name, route_code, start_point, end_point, estimated_time, fare, color)
SELECT 'Perumnas - Cikokol', 'R02', 'Perumnas', 'Cikokol', 30, 8000, '#2563EB'
WHERE NOT EXISTS (SELECT 1 FROM public.routes WHERE route_code = 'R02');

-- Seed stops for R01 (Only if R01 exists and has no stops)
DO $$
DECLARE
    r01_id UUID;
BEGIN
    SELECT id INTO r01_id FROM public.routes WHERE route_code = 'R01' LIMIT 1;
    
    IF r01_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.route_stops WHERE route_id = r01_id) THEN
        INSERT INTO public.route_stops (route_id, stop_name, stop_order, latitude, longitude) VALUES
        (r01_id, 'Terminal Cimone', 1, -6.1872, 106.6083),
        (r01_id, 'Plaza Shinta', 2, -6.1950, 106.6150),
        (r01_id, 'Pasar Anyar', 3, -6.1780, 106.6300),
        (r01_id, 'Stasiun Poris', 4, -6.1680, 106.6600);
    END IF;
END $$;
