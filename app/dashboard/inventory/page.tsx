import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { InventoryTable } from '@/components/inventory/inventory-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getInventory() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('inventory')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching inventory:', error)
    return []
  }

  return data || []
}

export default async function InventoryPage() {
  const inventory = await getInventory()

  const lowStockCount = inventory.filter(
    (item) => item.quantity <= item.reorder_level
  ).length

  return (
    <>
      <DashboardHeader
        title="Inventory"
        description="Manage parts and supplies"
      />

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {inventory.length} items total
              {lowStockCount > 0 && (
                <span className="ml-2 text-yellow-600">
                  ({lowStockCount} low stock)
                </span>
              )}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/inventory/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Link>
          </Button>
        </div>

        <InventoryTable items={inventory} />
      </main>
    </>
  )
}
