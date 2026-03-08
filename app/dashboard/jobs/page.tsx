import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { JobsTable } from '@/components/jobs/jobs-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getJobCards() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('job_cards')
    .select(`
      *,
      customer:customers(id, name, phone),
      vehicle:vehicles(id, make, model, license_plate, year),
      mechanic:mechanics(
        id,
        profile:profiles(full_name)
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching job cards:', error)
    return []
  }

  return data || []
}

export default async function JobsPage() {
  const jobs = await getJobCards()

  return (
    <>
      <DashboardHeader
        title="Job Cards"
        description="Manage service orders and repairs"
      />

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {jobs.length} job cards total
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/jobs/new">
              <Plus className="mr-2 h-4 w-4" />
              New Job Card
            </Link>
          </Button>
        </div>

        <JobsTable jobs={jobs} />
      </main>
    </>
  )
}
