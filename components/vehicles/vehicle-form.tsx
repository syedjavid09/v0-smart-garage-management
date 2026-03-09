'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
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
import { toast } from 'sonner'
import type { Vehicle } from '@/lib/types'

interface VehicleFormProps {
  vehicle?: Vehicle
  customers: { id: string; name: string }[]
  defaultCustomerId?: string
}

export function VehicleForm({ vehicle, customers, defaultCustomerId }: VehicleFormProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer_id: vehicle?.customer_id || defaultCustomerId || '',
    make: vehicle?.make || '',
    model: vehicle?.model || '',
    year: vehicle?.year || new Date().getFullYear(),
    license_plate: vehicle?.license_plate || '',
    vin: vehicle?.vin || '',
    color: vehicle?.color || '',
    mileage: vehicle?.mileage || '',
    notes: vehicle?.notes || '',
  })
  const router = useRouter()
  const supabase = createClient()
  const isEditing = !!vehicle

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : null) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEditing) {
        const { error } = await supabase
          .from('vehicles')
          .update(formData)
          .eq('id', vehicle.id)

        if (error) throw error
        toast.success('Vehicle updated successfully')
      } else {
        const { error } = await supabase.from('vehicles').insert([formData])

        if (error) throw error
        toast.success('Vehicle created successfully')
      }

      router.push('/dashboard/vehicles')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i)

  return (
    <form onSubmit={handleSubmit}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Vehicle' : 'Vehicle Information'}</CardTitle>
          <CardDescription>
            {isEditing
              ? 'Update vehicle details below'
              : 'Enter the vehicle details below'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_id">Owner *</Label>
            <Select
              value={formData.customer_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, customer_id: value }))
              }
              disabled={loading}
              required
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="make">Make *</Label>
              <Input
                id="make"
                name="make"
                value={formData.make}
                onChange={handleChange}
                placeholder="Toyota"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Camry"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Select
                value={String(formData.year)}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, year: Number(value) }))
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="license_plate">License Plate *</Label>
              <Input
                id="license_plate"
                name="license_plate"
                value={formData.license_plate}
                onChange={handleChange}
                placeholder="ABC-1234"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                placeholder="Silver"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                name="vin"
                value={formData.vin}
                onChange={handleChange}
                placeholder="1HGBH41JXMN109186"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mileage">Mileage</Label>
              <Input
                id="mileage"
                name="mileage"
                type="number"
                value={formData.mileage || ''}
                onChange={handleChange}
                placeholder="50000"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Additional notes about the vehicle..."
              rows={3}
              disabled={loading}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
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
              'Update Vehicle'
            ) : (
              'Create Vehicle'
            )}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
