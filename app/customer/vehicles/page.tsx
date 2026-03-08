import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, Calendar, Gauge } from 'lucide-react'

async function getCustomerVehicles(userId: string) {
  const supabase = await createClient()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', userId)
    .single()

  if (!customer) return []

  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vehicles:', error)
    return []
  }

  return data || []
}

export default async function CustomerVehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const vehicles = user ? await getCustomerVehicles(user.id) : []

  return (
    <>
      <DashboardHeader
        title="My Vehicles"
        description="View your registered vehicles"
      />

      <main className="flex-1 space-y-6 p-6">
        {vehicles.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle: any) => (
              <Card key={vehicle.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Car className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {vehicle.make} {vehicle.model}
                        </CardTitle>
                        <Badge variant="outline" className="font-mono">
                          {vehicle.license_plate}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Year: {vehicle.year}
                  </div>
                  {vehicle.mileage && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Gauge className="h-4 w-4" />
                      Mileage: {vehicle.mileage.toLocaleString()} mi
                    </div>
                  )}
                  {vehicle.color && (
                    <div className="flex items-center gap-2 text-sm">
                      <div
                        className="h-4 w-4 rounded-full border"
                        style={{ backgroundColor: vehicle.color.toLowerCase() }}
                      />
                      {vehicle.color}
                    </div>
                  )}
                  {vehicle.vin && (
                    <div className="text-xs text-muted-foreground">
                      VIN: {vehicle.vin}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Car className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Vehicles Found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                You don&apos;t have any vehicles registered yet.
              </p>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  )
}
