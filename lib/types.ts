export type UserRole = 'admin' | 'mechanic' | 'customer'

export type JobStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'overdue'

export interface Profile {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  profile_id: string | null
  name: string
  email: string
  phone: string
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
  profile?: Profile
  vehicles?: Vehicle[]
}

export interface Vehicle {
  id: string
  customer_id: string
  make: string
  model: string
  year: number
  license_plate: string
  vin: string | null
  color: string | null
  mileage: number | null
  notes: string | null
  created_at: string
  updated_at: string
  customer?: Customer
}

export interface Service {
  id: string
  name: string
  description: string | null
  base_price: number
  estimated_hours: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Mechanic {
  id: string
  profile_id: string
  specialization: string | null
  hourly_rate: number
  is_available: boolean
  created_at: string
  updated_at: string
  profile?: Profile
}

export interface InventoryItem {
  id: string
  name: string
  sku: string
  description: string | null
  quantity: number
  unit_price: number
  cost_price: number
  reorder_level: number
  supplier: string | null
  created_at: string
  updated_at: string
}

export interface JobCard {
  id: string
  job_number: string
  vehicle_id: string
  customer_id: string
  mechanic_id: string | null
  status: JobStatus
  description: string | null
  diagnosis: string | null
  estimated_completion: string | null
  actual_completion: string | null
  labor_hours: number
  labor_rate: number
  notes: string | null
  created_by: string
  created_at: string
  updated_at: string
  vehicle?: Vehicle
  customer?: Customer
  mechanic?: Mechanic
  services?: JobCardService[]
  parts?: JobCardPart[]
}

export interface JobCardService {
  id: string
  job_card_id: string
  service_id: string
  quantity: number
  unit_price: number
  discount: number
  notes: string | null
  created_at: string
  service?: Service
}

export interface JobCardPart {
  id: string
  job_card_id: string
  inventory_id: string
  quantity: number
  unit_price: number
  discount: number
  created_at: string
  inventory?: InventoryItem
}

export interface Invoice {
  id: string
  invoice_number: string
  job_card_id: string
  customer_id: string
  subtotal: number
  tax_rate: number
  tax_amount: number
  discount: number
  total: number
  payment_status: PaymentStatus
  payment_method: string | null
  paid_amount: number
  due_date: string | null
  paid_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  job_card?: JobCard
  customer?: Customer
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: string
  is_read: boolean
  link: string | null
  created_at: string
}

export interface DashboardStats {
  totalCustomers: number
  totalVehicles: number
  activeJobs: number
  completedJobsToday: number
  pendingInvoices: number
  totalRevenue: number
  lowStockItems: number
}
