-- Fix Ticket Relations and Schema

-- 1. Add Foreign Key from tickets.user_id to profiles.user_id
-- This allows Supabase to join tickets and profiles tables (e.g. profiles:user_id)
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'tickets_user_id_fkey' 
        AND table_name = 'tickets'
    ) THEN 
        ALTER TABLE public.tickets
        ADD CONSTRAINT tickets_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES public.profiles(user_id);
    END IF; 
END $$;

-- 2. Ensure payment_status column exists in tickets table
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tickets' 
        AND column_name = 'payment_status'
    ) THEN 
        ALTER TABLE public.tickets 
        ADD COLUMN payment_status VARCHAR(20) DEFAULT 'pending'; 
    END IF; 
END $$;

-- 3. Ensure payments table exists (if it was missing from the user's schema)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID REFERENCES public.tickets(id),
  user_id UUID REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50),
  payment_status VARCHAR(20) DEFAULT 'pending',
  transaction_id VARCHAR(100),
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS for payments if it was just created
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 5. Re-apply policies for payments (safe to run even if they exist, will just fail silently or we can check)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can view own payments') THEN
        CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'payments' AND policyname = 'Users can insert own payments') THEN
        CREATE POLICY "Users can insert own payments" ON public.payments FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;
