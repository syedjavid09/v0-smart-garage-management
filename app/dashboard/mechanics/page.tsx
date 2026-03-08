import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Plus, Phone, Mail, Wrench } from 'lucide-react'
import Link from 'next/link'

async function getMechanics() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('mechanics')
    .select(`
      *,
      profile:profiles(id, full_name, email, phone, avatar_url),
      active_jobs:job_cards(count)
    `)
    .eq('job_cards.status', 'in_progress')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching mechanics:', error)
    return []
  }

  return data || []
}

export default async function MechanicsPage() {
  const mechanics = await getMechanics()

  return (
    <>
      <DashboardHeader
        title="Mechanics"
        description="Manage your team of mechanics"
      />

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {mechanics.length} mechanics registered
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/mechanics/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Mechanic
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mechanics.length > 0 ? (
            mechanics.map((mechanic: any) => (
              <Card key={mechanic.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={mechanic.profile?.avatar_url} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {mechanic.profile?.full_name
                            ?.split(' ')
                            .map((n: string) => n[0])
                            .join('')
                            .toUpperCase() || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">
                          {mechanic.profile?.full_name || 'Unknown'}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {mechanic.specialization || 'General Mechanic'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={mechanic.is_available ? 'default' : 'secondary'}>
                      {mechanic.is_available ? 'Available' : 'Busy'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {mechanic.profile?.email}
                  </div>
                  {mechanic.profile?.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {mechanic.profile?.phone}
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        ${mechanic.hourly_rate}/hr
                      </span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/mechanics/${mechanic.id}`}>
                        View Profile
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No mechanics registered</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Add your first mechanic to start assigning jobs.
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/mechanics/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Mechanic
                </Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
