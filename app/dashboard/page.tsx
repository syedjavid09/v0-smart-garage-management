import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  Car,
  ClipboardList,
  DollarSign,
  Package,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import Link from 'next/link'

async function getDashboardStats() {
  const supabase = await createClient()

  const [
    { count: customersCount },
    { count: vehiclesCount },
    { count: activeJobsCount },
    { count: completedTodayCount },
    { data: pendingInvoices },
    { data: lowStockItems },
    { data: recentJobs },
  ] = await Promise.all([
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('vehicles').select('*', { count: 'exact', head: true }),
    supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']),
    supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .gte('actual_completion', new Date().toISOString().split('T')[0]),
    supabase
      .from('invoices')
      .select('total')
      .eq('payment_status', 'pending'),
    supabase
      .from('inventory')
      .select('*')
      .filter('quantity', 'lte', 'reorder_level'),
    supabase
      .from('job_cards')
      .select(`
        *,
        customer:customers(name),
        vehicle:vehicles(make, model, license_plate),
        mechanic:mechanics(profile:profiles(full_name))
      `)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const pendingTotal = pendingInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  return {
    totalCustomers: customersCount || 0,
    totalVehicles: vehiclesCount || 0,
    activeJobs: activeJobsCount || 0,
    completedToday: completedTodayCount || 0,
    pendingRevenue: pendingTotal,
    lowStockCount: lowStockItems?.length || 0,
    lowStockItems: lowStockItems || [],
    recentJobs: recentJobs || [],
  }
}

export default async function DashboardPage() {
  const stats = await getDashboardStats()

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
    }
  }

  return (
    <>
      <DashboardHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your garage."
      />

      <main className="flex-1 space-y-6 p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
            description="registered customers"
          />
          <StatCard
            title="Total Vehicles"
            value={stats.totalVehicles}
            icon={Car}
            description="in your database"
          />
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={ClipboardList}
            trend={{ value: 12, isPositive: true }}
            description="from last week"
          />
          <StatCard
            title="Pending Revenue"
            value={`$${stats.pendingRevenue.toLocaleString()}`}
            icon={DollarSign}
            description="in unpaid invoices"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              New Job Card
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/dashboard/vehicles/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Jobs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Recent Job Cards</CardTitle>
                <CardDescription>Latest jobs in your garage</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/jobs">
                  View all
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentJobs.length > 0 ? (
                  stats.recentJobs.map((job: any) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{job.job_number}</span>
                          <Badge
                            variant="secondary"
                            className={getStatusColor(job.status)}
                          >
                            {job.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {job.vehicle?.make} {job.vehicle?.model} - {job.vehicle?.license_plate}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {job.customer?.name}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(job.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    No recent jobs found. Create your first job card!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alert */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Low Stock Alerts
                </CardTitle>
                <CardDescription>Items below reorder level</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/inventory">
                  Manage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.lowStockItems.length > 0 ? (
                  stats.lowStockItems.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <span className="font-medium">{item.name}</span>
                        <p className="text-sm text-muted-foreground">
                          SKU: {item.sku}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="destructive">
                          {item.quantity} left
                        </Badge>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Reorder at: {item.reorder_level}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <Package className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    All items are well stocked!
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-2xl font-bold">{stats.completedToday}</span>
                <span className="text-sm text-muted-foreground">jobs</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-2xl font-bold">{stats.lowStockCount}</span>
                <span className="text-sm text-muted-foreground">items need reorder</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Mechanics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-2xl font-bold">4</span>
                <span className="text-sm text-muted-foreground">working today</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
