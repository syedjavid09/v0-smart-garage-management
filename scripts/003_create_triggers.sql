-- Trigger functions for Smart Garage Management System

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(new.raw_user_meta_data ->> 'role', 'customer')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all relevant tables
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_vehicles_updated_at ON public.vehicles;
CREATE TRIGGER update_vehicles_updated_at
  BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_mechanics_updated_at ON public.mechanics;
CREATE TRIGGER update_mechanics_updated_at
  BEFORE UPDATE ON public.mechanics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_inventory_updated_at ON public.inventory;
CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_job_cards_updated_at ON public.job_cards;
CREATE TRIGGER update_job_cards_updated_at
  BEFORE UPDATE ON public.job_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

DROP TRIGGER IF EXISTS update_invoices_updated_at ON public.invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Auto-generate job number
CREATE OR REPLACE FUNCTION public.generate_job_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(job_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.job_cards;
  
  NEW.job_number := 'JOB' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_job_number ON public.job_cards;
CREATE TRIGGER set_job_number
  BEFORE INSERT ON public.job_cards
  FOR EACH ROW
  WHEN (NEW.job_number IS NULL OR NEW.job_number = '')
  EXECUTE FUNCTION public.generate_job_number();

-- Auto-generate invoice number
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INTEGER;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM 4) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.invoices;
  
  NEW.invoice_number := 'INV' || LPAD(next_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_invoice_number ON public.invoices;
CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION public.generate_invoice_number();

-- Update inventory quantity when parts are used
CREATE OR REPLACE FUNCTION public.update_inventory_on_part_use()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.inventory
    SET quantity = quantity - NEW.quantity
    WHERE id = NEW.inventory_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.inventory
    SET quantity = quantity + OLD.quantity
    WHERE id = OLD.inventory_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.inventory
    SET quantity = quantity + OLD.quantity - NEW.quantity
    WHERE id = NEW.inventory_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_inventory_on_job_card_parts ON public.job_card_parts;
CREATE TRIGGER update_inventory_on_job_card_parts
  AFTER INSERT OR UPDATE OR DELETE ON public.job_card_parts
  FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_part_use();
