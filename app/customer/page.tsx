import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Car, ClipboardList, FileText, DollarSign, ArrowRight, Clock } from 'lucide-react'
import Link from 'next/link'

async function getCustomerDashboard(userId: string) {
  const supabase = await createClient()

  // Get customer record
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', userId)
    .single()

  if (!customer) return null

  const [
    { count: vehicleCount },
    { count: activeJobsCount },
    { data: pendingInvoices },
    { data: recentJobs },
  ] = await Promise.all([
    supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customer.id),
    supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customer.id)
      .in('status', ['pending', 'in_progress']),
    supabase
      .from('invoices')
      .select('total')
      .eq('customer_id', customer.id)
      .eq('payment_status', 'pending'),
    supabase
      .from('job_cards')
      .select(`
        *,
        vehicle:vehicles(make, model, license_plate, year)
      `)
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const pendingTotal = pendingInvoices?.reduce((sum, inv) => sum + (inv.total || 0), 0) || 0

  return {
    vehicleCount: vehicleCount || 0,
    activeJobs: activeJobsCount || 0,
    pendingAmount: pendingTotal,
    recentJobs: recentJobs || [],
  }
}

export default async function CustomerDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const stats = user ? await getCustomerDashboard(user.id) : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!stats) {
    return (
      <>
        <DashboardHeader
          title="Customer Dashboard"
          description="Welcome to GaragePro"
        />
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Welcome to GaragePro!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your customer profile is being set up. Please contact support if you need assistance.
              </p>
            </CardContent>
          </Card>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader
        title="Customer Dashboard"
        description="View your vehicles and service history"
      />

      <main className="flex-1 space-y-6 p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="My Vehicles"
            value={stats.vehicleCount}
            icon={Car}
            description="registered vehicles"
          />
          <StatCard
            title="Active Jobs"
            value={stats.activeJobs}
            icon={ClipboardList}
            description="in progress"
          />
          <StatCard
            title="Pending Payments"
            value={`$${stats.pendingAmount.toLocaleString()}`}
            icon={DollarSign}
            description="unpaid invoices"
          />
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/customer/vehicles">
              <Car className="mr-2 h-4 w-4" />
              View My Vehicles
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/customer/invoices">
              <FileText className="mr-2 h-4 w-4" />
              View Invoices
            </Link>
          </Button>
        </div>

        {/* Recent Service History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Service History</CardTitle>
              <CardDescription>Your latest service records</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/customer/history">
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
                        {job.vehicle?.year} {job.vehicle?.make} {job.vehicle?.model}
                      </p>
                      {job.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {job.description}
                        </p>
                      )}
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
                  No service history yet. Your service records will appear here.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
