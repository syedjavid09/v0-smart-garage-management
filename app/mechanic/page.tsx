import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { StatCard } from '@/components/stat-card'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ClipboardList, Clock, CheckCircle, Wrench, ArrowRight } from 'lucide-react'
import Link from 'next/link'

async function getMechanicDashboard(userId: string) {
  const supabase = await createClient()

  // Get mechanic record
  const { data: mechanic } = await supabase
    .from('mechanics')
    .select('id')
    .eq('profile_id', userId)
    .single()

  if (!mechanic) return null

  const [
    { count: assignedCount },
    { count: inProgressCount },
    { count: completedTodayCount },
    { data: myJobs },
  ] = await Promise.all([
    supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .eq('mechanic_id', mechanic.id)
      .eq('status', 'pending'),
    supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .eq('mechanic_id', mechanic.id)
      .eq('status', 'in_progress'),
    supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .eq('mechanic_id', mechanic.id)
      .eq('status', 'completed')
      .gte('actual_completion', new Date().toISOString().split('T')[0]),
    supabase
      .from('job_cards')
      .select(`
        *,
        customer:customers(name),
        vehicle:vehicles(make, model, license_plate, year)
      `)
      .eq('mechanic_id', mechanic.id)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  return {
    assignedJobs: assignedCount || 0,
    inProgressJobs: inProgressCount || 0,
    completedToday: completedTodayCount || 0,
    myJobs: myJobs || [],
  }
}

export default async function MechanicDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const stats = user ? await getMechanicDashboard(user.id) : null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!stats) {
    return (
      <>
        <DashboardHeader
          title="Mechanic Dashboard"
          description="Your mechanic profile is not set up yet."
        />
        <main className="flex-1 p-6">
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Profile Not Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Please contact an administrator to set up your mechanic profile.
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
        title="Mechanic Dashboard"
        description="Your assigned jobs and work overview"
      />

      <main className="flex-1 space-y-6 p-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Assigned Jobs"
            value={stats.assignedJobs}
            icon={ClipboardList}
            description="waiting to start"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgressJobs}
            icon={Clock}
            description="currently working"
          />
          <StatCard
            title="Completed Today"
            value={stats.completedToday}
            icon={CheckCircle}
            description="finished jobs"
          />
        </div>

        {/* My Jobs */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>My Jobs</CardTitle>
              <CardDescription>Jobs assigned to you</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/mechanic/jobs">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.myJobs.length > 0 ? (
                stats.myJobs.map((job: any) => (
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
                        {job.vehicle?.year} {job.vehicle?.make} {job.vehicle?.model} - {job.vehicle?.license_plate}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {job.customer?.name}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/mechanic/jobs/${job.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CheckCircle className="mx-auto mb-2 h-8 w-8 opacity-50" />
                  No jobs assigned yet. Check back later!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}
