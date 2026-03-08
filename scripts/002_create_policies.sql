-- Row Level Security Policies for Smart Garage Management System

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (
    SELECT role FROM public.profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin can update all profiles" ON public.profiles
  FOR UPDATE USING (public.get_user_role() = 'admin');

-- Customers policies
CREATE POLICY "Admin and mechanic can view customers" ON public.customers
  FOR SELECT USING (public.get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "Admin can manage customers" ON public.customers
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Customers can view own record" ON public.customers
  FOR SELECT USING (profile_id = auth.uid());

-- Vehicles policies
CREATE POLICY "Admin and mechanic can view vehicles" ON public.vehicles
  FOR SELECT USING (public.get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "Admin can manage vehicles" ON public.vehicles
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Customers can view own vehicles" ON public.vehicles
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())
  );

-- Services policies (everyone can view, admin can manage)
CREATE POLICY "Everyone can view services" ON public.services
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage services" ON public.services
  FOR ALL USING (public.get_user_role() = 'admin');

-- Mechanics policies
CREATE POLICY "Admin and mechanic can view mechanics" ON public.mechanics
  FOR SELECT USING (public.get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "Admin can manage mechanics" ON public.mechanics
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Mechanics can update own record" ON public.mechanics
  FOR UPDATE USING (profile_id = auth.uid());

-- Inventory policies
CREATE POLICY "Admin and mechanic can view inventory" ON public.inventory
  FOR SELECT USING (public.get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "Admin can manage inventory" ON public.inventory
  FOR ALL USING (public.get_user_role() = 'admin');

-- Job Cards policies
CREATE POLICY "Admin and mechanic can view job cards" ON public.job_cards
  FOR SELECT USING (public.get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "Admin can manage job cards" ON public.job_cards
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Mechanic can update assigned job cards" ON public.job_cards
  FOR UPDATE USING (
    public.get_user_role() = 'mechanic' AND 
    mechanic_id IN (SELECT id FROM public.mechanics WHERE profile_id = auth.uid())
  );

CREATE POLICY "Customers can view own job cards" ON public.job_cards
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())
  );

-- Job Card Services policies
CREATE POLICY "Admin and mechanic can view job card services" ON public.job_card_services
  FOR SELECT USING (public.get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "Admin can manage job card services" ON public.job_card_services
  FOR ALL USING (public.get_user_role() = 'admin');

-- Job Card Parts policies
CREATE POLICY "Admin and mechanic can view job card parts" ON public.job_card_parts
  FOR SELECT USING (public.get_user_role() IN ('admin', 'mechanic'));

CREATE POLICY "Admin can manage job card parts" ON public.job_card_parts
  FOR ALL USING (public.get_user_role() = 'admin');

-- Invoices policies
CREATE POLICY "Admin can view all invoices" ON public.invoices
  FOR SELECT USING (public.get_user_role() = 'admin');

CREATE POLICY "Admin can manage invoices" ON public.invoices
  FOR ALL USING (public.get_user_role() = 'admin');

CREATE POLICY "Customers can view own invoices" ON public.invoices
  FOR SELECT USING (
    customer_id IN (SELECT id FROM public.customers WHERE profile_id = auth.uid())
  );

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);
