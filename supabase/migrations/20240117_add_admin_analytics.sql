-- Admin Analytics RPC Function with Dynamic Aggregation
-- Run this in Supabase SQL Editor

--------------------------------------------------------------
-- RPC Function: get_admin_analytics
-- Returns aggregated stats for admin dashboard with trends
-- Aggregates data based on time range (Hour for 24h, Day for 7d/30d, Month for Year)
--------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_admin_analytics(p_time_range VARCHAR DEFAULT '7d')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    -- Current period stats
    v_total_revenue DECIMAL;
    v_total_tickets INTEGER;
    v_total_passengers INTEGER;
    -- Previous period stats (for comparison)
    v_prev_revenue DECIMAL;
    v_prev_tickets INTEGER;
    v_prev_passengers INTEGER;
    -- Trend percentages
    v_revenue_trend DECIMAL;
    v_tickets_trend DECIMAL;
    v_passengers_trend DECIMAL;
    -- Other data
    v_revenue_data JSONB;
    v_top_routes JSONB;
    v_interval INTERVAL;
    v_date_format TEXT;
    v_trunc_unit TEXT;
BEGIN
    -- Set interval and aggregation unit based on time range
    CASE p_time_range
        WHEN '24h' THEN 
            v_interval := INTERVAL '24 hours';
            v_trunc_unit := 'hour';
            v_date_format := 'HH24:00';
        WHEN '7d' THEN 
            v_interval := INTERVAL '7 days';
            v_trunc_unit := 'day';
            v_date_format := 'Dy';
        WHEN '30d' THEN 
            v_interval := INTERVAL '30 days';
            v_trunc_unit := 'day';
            v_date_format := 'DD Mon';
        WHEN 'year' THEN 
            v_interval := INTERVAL '1 year';
            v_trunc_unit := 'month';
            v_date_format := 'Mon YYYY';
        ELSE 
            v_interval := INTERVAL '7 days';
            v_trunc_unit := 'day';
            v_date_format := 'Dy';
    END CASE;

    -- =====================================================
    -- CURRENT PERIOD STATS (Total sums over the interval)
    -- =====================================================
    
    SELECT COALESCE(SUM(total_fare), 0), COUNT(*), COALESCE(SUM(passenger_count), 0)
    INTO v_total_revenue, v_total_tickets, v_total_passengers
    FROM public.tickets
    WHERE status != 'cancelled'
    AND created_at >= NOW() - v_interval;

    -- =====================================================
    -- PREVIOUS PERIOD STATS (for trend comparison)
    -- =====================================================
    
    SELECT COALESCE(SUM(total_fare), 0), COUNT(*), COALESCE(SUM(passenger_count), 0)
    INTO v_prev_revenue, v_prev_tickets, v_prev_passengers
    FROM public.tickets
    WHERE status != 'cancelled'
    AND created_at >= NOW() - (v_interval * 2)
    AND created_at < NOW() - v_interval;

    -- =====================================================
    -- CALCULATE TREND PERCENTAGES
    -- =====================================================
    
    -- Revenue trend
    IF v_prev_revenue > 0 THEN
        v_revenue_trend := ROUND(((v_total_revenue - v_prev_revenue) / v_prev_revenue * 100)::NUMERIC, 1);
    ELSE
        v_revenue_trend := CASE WHEN v_total_revenue > 0 THEN 100 ELSE 0 END;
    END IF;

    -- Tickets trend
    IF v_prev_tickets > 0 THEN
        v_tickets_trend := ROUND(((v_total_tickets - v_prev_tickets)::DECIMAL / v_prev_tickets * 100)::NUMERIC, 1);
    ELSE
        v_tickets_trend := CASE WHEN v_total_tickets > 0 THEN 100 ELSE 0 END;
    END IF;

    -- Passengers trend
    IF v_prev_passengers > 0 THEN
        v_passengers_trend := ROUND(((v_total_passengers - v_prev_passengers)::DECIMAL / v_prev_passengers * 100)::NUMERIC, 1);
    ELSE
        v_passengers_trend := CASE WHEN v_total_passengers > 0 THEN 100 ELSE 0 END;
    END IF;

    -- =====================================================
    -- REVENUE DATA FOR CHART (Aggregated by trunc_unit)
    -- =====================================================
    
    SELECT COALESCE(jsonb_agg(agg_data ORDER BY period_date), '[]'::jsonb)
    INTO v_revenue_data
    FROM (
        SELECT 
            TO_CHAR(DATE_TRUNC(v_trunc_unit, created_at), v_date_format) as day,
            DATE_TRUNC(v_trunc_unit, created_at) as period_date,
            COALESCE(SUM(total_fare), 0) as value
        FROM public.tickets
        WHERE created_at >= NOW() - v_interval
        AND status != 'cancelled'
        GROUP BY 1, 2
        ORDER BY 2
    ) agg_data;

    -- =====================================================
    -- TOP ROUTES
    -- =====================================================
    
    SELECT COALESCE(jsonb_agg(route_data), '[]'::jsonb)
    INTO v_top_routes
    FROM (
        SELECT 
            r.route_code,
            r.name,
            COALESCE(SUM(t.passenger_count), 0) as passengers
        FROM public.routes r
        LEFT JOIN public.tickets t ON t.route_id = r.id 
            AND t.status != 'cancelled'
            AND t.created_at >= NOW() - v_interval
        GROUP BY r.id, r.route_code, r.name
        ORDER BY passengers DESC
        LIMIT 5
    ) route_data;

    -- =====================================================
    -- RETURN RESULTS
    -- =====================================================
    
    RETURN jsonb_build_object(
        'stats', jsonb_build_object(
            'totalRevenue', v_total_revenue,
            'totalTickets', v_total_tickets,
            'totalPassengers', v_total_passengers,
            'occupancy', ROUND((v_total_passengers::DECIMAL / GREATEST(v_total_tickets * 10, 1)) * 100),
            'revenueTrend', v_revenue_trend,
            'ticketsTrend', v_tickets_trend,
            'passengersTrend', v_passengers_trend
        ),
        'revenueData', v_revenue_data,
        'topRoutes', v_top_routes
    );
END;
$$;
