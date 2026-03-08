'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { useAuth } from '@/lib/auth-context'

interface JobFormProps {
  customers: { id: string; name: string }[]
  vehicles: { id: string; make: string; model: string; license_plate: string; year: number; customer_id: string }[]
  mechanics: { id: string; profile: { full_name: string }; is_available: boolean }[]
  services: { id: string; name: string; base_price: number; estimated_hours: number }[]
  job?: any
}

export function JobForm({ customers, vehicles, mechanics, services, job }: JobFormProps) {
  const [loading, setLoading] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState(job?.customer_id || '')
  const [selectedVehicleId, setSelectedVehicleId] = useState(job?.vehicle_id || '')
  const [selectedMechanicId, setSelectedMechanicId] = useState(job?.mechanic_id || '')
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [description, setDescription] = useState(job?.description || '')
  const [laborHours, setLaborHours] = useState(job?.labor_hours || 0)
  const [laborRate, setLaborRate] = useState(job?.labor_rate || 75)
  
  const router = useRouter()
  const supabase = createClient()
  const { user } = useAuth()
  const isEditing = !!job

  // Filter vehicles based on selected customer
  const customerVehicles = selectedCustomerId
    ? vehicles.filter((v) => v.customer_id === selectedCustomerId)
    : vehicles

  // Auto-select customer when vehicle is selected
  useEffect(() => {
    if (selectedVehicleId) {
      const vehicle = vehicles.find((v) => v.id === selectedVehicleId)
      if (vehicle && vehicle.customer_id !== selectedCustomerId) {
        setSelectedCustomerId(vehicle.customer_id)
      }
    }
  }, [selectedVehicleId, vehicles, selectedCustomerId])

  const handleAddService = (serviceId: string) => {
    if (!selectedServices.includes(serviceId)) {
      setSelectedServices([...selectedServices, serviceId])
    }
  }

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter((id) => id !== serviceId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCustomerId || !selectedVehicleId) {
      toast.error('Please select a customer and vehicle')
      return
    }

    setLoading(true)

    try {
      const jobData = {
        customer_id: selectedCustomerId,
        vehicle_id: selectedVehicleId,
        mechanic_id: selectedMechanicId || null,
        description,
        labor_hours: laborHours,
        labor_rate: laborRate,
        status: 'pending',
        created_by: user?.id,
      }

      if (isEditing) {
        const { error } = await supabase
          .from('job_cards')
          .update(jobData)
          .eq('id', job.id)

        if (error) throw error
        toast.success('Job card updated successfully')
      } else {
        const { data: newJob, error } = await supabase
          .from('job_cards')
          .insert([jobData])
          .select()
          .single()

        if (error) throw error

        // Add selected services
        if (selectedServices.length > 0) {
          const serviceEntries = selectedServices.map((serviceId) => {
            const service = services.find((s) => s.id === serviceId)
            return {
              job_card_id: newJob.id,
              service_id: serviceId,
              quantity: 1,
              unit_price: service?.base_price || 0,
              discount: 0,
            }
          })

          const { error: servicesError } = await supabase
            .from('job_card_services')
            .insert(serviceEntries)

          if (servicesError) {
            console.error('Error adding services:', servicesError)
          }
        }

        toast.success('Job card created successfully')
      }

      router.push('/dashboard/jobs')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer & Vehicle</CardTitle>
            <CardDescription>
              Select the customer and their vehicle
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Select
                value={selectedCustomerId}
                onValueChange={setSelectedCustomerId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle *</Label>
              <Select
                value={selectedVehicleId}
                onValueChange={setSelectedVehicleId}
                disabled={loading || !selectedCustomerId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={selectedCustomerId ? 'Select vehicle' : 'Select customer first'} />
                </SelectTrigger>
                <SelectContent>
                  {customerVehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.license_plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mechanic">Assign Mechanic</Label>
              <Select
                value={selectedMechanicId}
                onValueChange={setSelectedMechanicId}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select mechanic (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {mechanics.map((mechanic) => (
                    <SelectItem key={mechanic.id} value={mechanic.id}>
                      {mechanic.profile?.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              Describe the work to be done
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue or work required..."
                rows={4}
                disabled={loading}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="laborHours">Estimated Labor Hours</Label>
                <Input
                  id="laborHours"
                  type="number"
                  step="0.5"
                  min="0"
                  value={laborHours}
                  onChange={(e) => setLaborHours(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
                <Input
                  id="laborRate"
                  type="number"
                  min="0"
                  value={laborRate}
                  onChange={(e) => setLaborRate(Number(e.target.value))}
                  disabled={loading}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>
              Select services to include in this job
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((serviceId) => {
                const service = services.find((s) => s.id === serviceId)
                return (
                  <Badge key={serviceId} variant="secondary" className="gap-1 pr-1">
                    {service?.name} - ${service?.base_price}
                    <button
                      type="button"
                      onClick={() => handleRemoveService(serviceId)}
                      className="ml-1 rounded-full p-0.5 hover:bg-muted"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )
              })}
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {services
                .filter((s) => !selectedServices.includes(s.id))
                .map((service) => (
                  <Button
                    key={service.id}
                    type="button"
                    variant="outline"
                    className="justify-start"
                    onClick={() => handleAddService(service.id)}
                    disabled={loading}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {service.name} - ${service.base_price}
                  </Button>
                ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : isEditing ? (
                'Update Job Card'
              ) : (
                'Create Job Card'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </form>
  )
}
