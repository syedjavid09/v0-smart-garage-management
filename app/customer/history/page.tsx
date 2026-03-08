import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ClipboardList, Clock, Car } from 'lucide-react'

async function getServiceHistory(userId: string) {
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', userId)
    .single()

  if (!customer) return []

  const { data, error } = await supabase
    .from('job_cards')
    .select(`
      *,
      vehicle:vehicles(make, model, license_plate, year),
      mechanic:mechanics(profile:profiles(full_name))
    `)
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching service history:', error)
    return []
  }

  return data || []
}

const statusConfig = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  },
}

export default async function CustomerHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const jobs = user ? await getServiceHistory(user.id) : []

  return (
    <>
      <DashboardHeader
        title="Service History"
        description="View your complete service records"
      />

      <main className="flex-1 space-y-6 p-6">
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job: any) => (
              <Card key={job.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <ClipboardList className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{job.job_number}</CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Car className="h-3 w-3" />
                          {job.vehicle?.year} {job.vehicle?.make} {job.vehicle?.model}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className={statusConfig[job.status as keyof typeof statusConfig]?.className}
                    >
                      {statusConfig[job.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {job.description && (
                    <p className="text-sm">{job.description}</p>
                  )}
                  {job.diagnosis && (
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs font-medium text-muted-foreground mb-1">Diagnosis</p>
                      <p className="text-sm">{job.diagnosis}</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </div>
                    {job.mechanic?.profile?.full_name && (
                      <div className="text-sm text-muted-foreground">
                        Mechanic: {job.mechanic.profile.full_name}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Service History</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your service records will appear here once you have had work done.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
