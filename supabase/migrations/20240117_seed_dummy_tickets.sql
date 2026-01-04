-- Seed Dummy Ticket Data for Last 90 Days (3 Months)
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    v_user_id UUID;
    v_route_r01 UUID;
    v_route_r02 UUID;
    v_date TIMESTAMP;
    v_passengers INTEGER;
    v_fare DECIMAL;
    i INTEGER;
    j INTEGER;
    k INTEGER;
    v_tickets_per_day INTEGER;
BEGIN
    -- Get a user ID (first user found, or skip if no users)
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No users found. Please create a user first.';
        RETURN;
    END IF;

    -- Get route IDs
    SELECT id INTO v_route_r01 FROM public.routes WHERE route_code = 'R01' LIMIT 1;
    SELECT id INTO v_route_r02 FROM public.routes WHERE route_code = 'R02' LIMIT 1;

    -- If routes don't exist, create them first
    IF v_route_r01 IS NULL THEN
        INSERT INTO public.routes (name, route_code, start_point, end_point, estimated_time, fare, color)
        VALUES ('Cimone - Poris Plawad', 'R01', 'Terminal Cimone', 'Stasiun Poris', 45, 12000, '#7B2CBF')
        RETURNING id INTO v_route_r01;
    END IF;

    IF v_route_r02 IS NULL THEN
        INSERT INTO public.routes (name, route_code, start_point, end_point, estimated_time, fare, color)
        VALUES ('Perumnas - Cikokol', 'R02', 'Perumnas', 'Cikokol', 30, 8000, '#2563EB')
        RETURNING id INTO v_route_r02;
    END IF;

    -- Clear existing dummy seed data to avoid duplication if user runs multiple times
    DELETE FROM public.tickets WHERE qr_code LIKE 'TGO-SEED-%' OR qr_code LIKE 'TGO-WKND-%';

    -- Insert tickets for last 90 days
    FOR i IN 0..89 LOOP
        v_date := NOW() - (i || ' days')::INTERVAL;
        
        -- Base tickets per day (2-6)
        v_tickets_per_day := 2 + (RANDOM() * 4)::INTEGER;
        
        -- Trend: Every ~30 days, slightly increase/decrease traffic to show growth
        IF i < 30 THEN
            v_tickets_per_day := v_tickets_per_day + 2; -- Recent month is busier
        ELSIF i > 60 THEN
            v_tickets_per_day := GREATEST(v_tickets_per_day - 1, 1); -- Oldest month slower
        END IF;

        FOR j IN 1..v_tickets_per_day LOOP
            -- Random passengers 1-4
            v_passengers := 1 + (RANDOM() * 3)::INTEGER;
            
            -- Route variation
            IF RANDOM() > 0.45 THEN
                v_fare := 12000 * v_passengers; -- R01
                INSERT INTO public.tickets (
                    user_id, route_id, start_point, end_point, 
                    passenger_count, total_fare, qr_code, status, travel_date, created_at
                ) VALUES (
                    v_user_id, v_route_r01, 'Terminal Cimone', 'Stasiun Poris',
                    v_passengers, v_fare, 
                    'TGO-SEED-' || i || '-' || j || '-' || (RANDOM()*1000)::INTEGER,
                    CASE WHEN i < 3 THEN 'active' ELSE 'used' END,
                    v_date,
                    v_date - ((RANDOM() * 5)::INTEGER || ' hours')::INTERVAL
                );
            ELSE
                v_fare := 8000 * v_passengers; -- R02
                INSERT INTO public.tickets (
                    user_id, route_id, start_point, end_point, 
                    passenger_count, total_fare, qr_code, status, travel_date, created_at
                ) VALUES (
                    v_user_id, v_route_r02, 'Perumnas', 'Cikokol',
                    v_passengers, v_fare, 
                    'TGO-SEED-' || i || '-' || j || '-' || (RANDOM()*1000)::INTEGER,
                    CASE WHEN i < 3 THEN 'active' ELSE 'used' END,
                    v_date,
                    v_date - ((RANDOM() * 5)::INTEGER || ' hours')::INTERVAL
                );
            END IF;
        END LOOP;
        
        -- Weekend boost (Higher traffic on Saturday and Sunday)
        IF EXTRACT(DOW FROM v_date) IN (0, 6) THEN
            FOR k IN 1..(3 + (RANDOM() * 3)::INTEGER) LOOP
                v_passengers := 2 + (RANDOM() * 2)::INTEGER;
                v_fare := 12000 * v_passengers;
                INSERT INTO public.tickets (
                    user_id, route_id, start_point, end_point, 
                    passenger_count, total_fare, qr_code, status, travel_date, created_at
                ) VALUES (
                    v_user_id, v_route_r01, 'Plaza Shinta', 'Pasar Anyar',
                    v_passengers, v_fare, 
                    'TGO-WKND-' || i || '-' || k || '-' || (RANDOM()*1000)::INTEGER,
                    'used',
                    v_date,
                    v_date - ((RANDOM() * 8)::INTEGER || ' hours')::INTERVAL
                );
            END LOOP;
        END IF;
    END LOOP;

    RAISE NOTICE 'Dummy data seeded successfully for 90 days (3 months)!';
END $$;

-- Summary of generated data
SELECT 
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as total_tickets,
    SUM(passenger_count) as total_passengers,
    SUM(total_fare) as total_revenue
FROM public.tickets
WHERE qr_code LIKE 'TGO-%'
GROUP BY 1
ORDER BY 1 DESC;
