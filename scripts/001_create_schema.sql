-- Smart Garage Management System Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'mechanic', 'customer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  address TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  license_plate TEXT NOT NULL,
  vin TEXT,
  color TEXT,
  vehicle_type TEXT NOT NULL DEFAULT 'car' CHECK (vehicle_type IN ('car', 'bike', 'truck', 'other')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Services catalog table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  estimated_hours DECIMAL(4,2),
  category TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mechanics (staff) table
CREATE TABLE IF NOT EXISTS public.mechanics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  specialization TEXT,
  hourly_rate DECIMAL(10,2) DEFAULT 0,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'busy', 'off-duty')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory/Spare parts table
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  part_number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 5,
  unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  supplier TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Cards table
CREATE TABLE IF NOT EXISTS public.job_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_number TEXT NOT NULL UNIQUE,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  mechanic_id UUID REFERENCES public.mechanics(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed', 'cancelled', 'on-hold')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  description TEXT,
  diagnosis TEXT,
  estimated_completion TIMESTAMPTZ,
  actual_completion TIMESTAMPTZ,
  labor_hours DECIMAL(6,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  parts_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Card Services (many-to-many)
CREATE TABLE IF NOT EXISTS public.job_card_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_id UUID NOT NULL REFERENCES public.job_cards(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Job Card Parts (parts used in job)
CREATE TABLE IF NOT EXISTS public.job_card_parts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_card_id UUID NOT NULL REFERENCES public.job_cards(id) ON DELETE CASCADE,
  inventory_id UUID NOT NULL REFERENCES public.inventory(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT NOT NULL UNIQUE,
  job_card_id UUID NOT NULL REFERENCES public.job_cards(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax_rate DECIMAL(4,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_date TIMESTAMPTZ,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_vehicles_customer ON public.vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_vehicle ON public.job_cards(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_customer ON public.job_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_mechanic ON public.job_cards(mechanic_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_status ON public.job_cards(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON public.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_job_card ON public.invoices(job_card_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_inventory_part_number ON public.inventory(part_number);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_card_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_card_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
