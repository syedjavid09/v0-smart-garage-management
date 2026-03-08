-- Seed data for Smart Garage Management System

-- Insert sample services
INSERT INTO public.services (name, description, base_price, estimated_hours, category, is_active) VALUES
  ('Oil Change', 'Complete oil change with filter replacement', 49.99, 0.5, 'Maintenance', true),
  ('Brake Inspection', 'Full brake system inspection and report', 29.99, 0.5, 'Inspection', true),
  ('Brake Pad Replacement', 'Replace front or rear brake pads', 149.99, 1.5, 'Brakes', true),
  ('Tire Rotation', 'Rotate all four tires for even wear', 39.99, 0.5, 'Tires', true),
  ('Wheel Alignment', 'Four-wheel alignment service', 89.99, 1.0, 'Tires', true),
  ('Engine Diagnostic', 'Computer diagnostic scan and analysis', 79.99, 1.0, 'Diagnostics', true),
  ('AC Service', 'Air conditioning inspection and recharge', 129.99, 1.5, 'Climate Control', true),
  ('Battery Replacement', 'Battery testing and replacement', 159.99, 0.5, 'Electrical', true),
  ('Transmission Fluid Change', 'Complete transmission fluid flush', 149.99, 1.0, 'Maintenance', true),
  ('Full Vehicle Inspection', 'Comprehensive 50-point inspection', 99.99, 2.0, 'Inspection', true),
  ('Spark Plug Replacement', 'Replace all spark plugs', 119.99, 1.5, 'Engine', true),
  ('Coolant Flush', 'Complete cooling system flush', 89.99, 1.0, 'Maintenance', true),
  ('Timing Belt Replacement', 'Replace timing belt and tensioner', 499.99, 4.0, 'Engine', true),
  ('Suspension Repair', 'Shock and strut replacement', 349.99, 3.0, 'Suspension', true),
  ('Exhaust Repair', 'Exhaust system inspection and repair', 199.99, 2.0, 'Exhaust', true)
ON CONFLICT DO NOTHING;

-- Insert sample inventory items
INSERT INTO public.inventory (part_number, name, description, category, quantity, min_quantity, unit_price, supplier, location) VALUES
  ('OIL-5W30-5L', 'Motor Oil 5W-30 5L', 'Synthetic motor oil 5W-30 5 liter', 'Oils', 50, 10, 34.99, 'AutoParts Co', 'Shelf A1'),
  ('OIL-10W40-5L', 'Motor Oil 10W-40 5L', 'Synthetic motor oil 10W-40 5 liter', 'Oils', 45, 10, 32.99, 'AutoParts Co', 'Shelf A1'),
  ('FLT-OIL-001', 'Oil Filter Universal', 'Universal fit oil filter', 'Filters', 100, 20, 8.99, 'FilterPro', 'Shelf A2'),
  ('FLT-AIR-001', 'Air Filter Standard', 'Standard air filter', 'Filters', 75, 15, 14.99, 'FilterPro', 'Shelf A2'),
  ('FLT-FUEL-001', 'Fuel Filter', 'Universal fuel filter', 'Filters', 40, 10, 19.99, 'FilterPro', 'Shelf A3'),
  ('BRK-PAD-FR', 'Brake Pads Front', 'Front brake pad set', 'Brakes', 30, 8, 49.99, 'BrakeMaster', 'Shelf B1'),
  ('BRK-PAD-RR', 'Brake Pads Rear', 'Rear brake pad set', 'Brakes', 25, 8, 44.99, 'BrakeMaster', 'Shelf B1'),
  ('BRK-ROT-FR', 'Brake Rotor Front', 'Front brake rotor', 'Brakes', 20, 5, 79.99, 'BrakeMaster', 'Shelf B2'),
  ('BRK-FLD-1L', 'Brake Fluid DOT4 1L', 'DOT4 brake fluid 1 liter', 'Fluids', 60, 15, 12.99, 'FluidTech', 'Shelf C1'),
  ('CLT-ANT-4L', 'Coolant Antifreeze 4L', 'Universal coolant/antifreeze', 'Fluids', 40, 10, 24.99, 'FluidTech', 'Shelf C1'),
  ('SPK-PLG-IR', 'Spark Plug Iridium', 'Iridium spark plug', 'Ignition', 80, 20, 9.99, 'SparkTech', 'Shelf D1'),
  ('BAT-12V-60', 'Battery 12V 60Ah', 'Car battery 12V 60Ah', 'Electrical', 15, 5, 129.99, 'PowerCell', 'Shelf E1'),
  ('WPR-BLD-22', 'Wiper Blade 22"', 'Wiper blade 22 inch', 'Wipers', 50, 15, 14.99, 'WiperWorld', 'Shelf F1'),
  ('BLT-SRP-001', 'Serpentine Belt', 'Universal serpentine belt', 'Belts', 25, 8, 29.99, 'BeltCo', 'Shelf G1'),
  ('BLT-TMG-001', 'Timing Belt Kit', 'Timing belt with tensioner', 'Belts', 10, 3, 149.99, 'BeltCo', 'Shelf G2')
ON CONFLICT DO NOTHING;
