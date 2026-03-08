import { createClient } from '@/lib/supabase/server'
import { DashboardHeader } from '@/components/dashboard-header'
import { InvoicesTable } from '@/components/invoices/invoices-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

async function getInvoices() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      customer:customers(id, name, email),
      job_card:job_cards(id, job_number)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return data || []
}

export default async function InvoicesPage() {
  const invoices = await getInvoices()

  const pendingTotal = invoices
    .filter((inv: any) => inv.payment_status === 'pending')
    .reduce((sum: number, inv: any) => sum + (inv.total || 0), 0)

  return (
    <>
      <DashboardHeader
        title="Invoices"
        description="Manage billing and payments"
      />

      <main className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              {invoices.length} invoices total
              {pendingTotal > 0 && (
                <span className="ml-2 text-yellow-600">
                  (${pendingTotal.toLocaleString()} pending)
                </span>
              )}
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              New Invoice
            </Link>
          </Button>
        </div>

        <InvoicesTable invoices={invoices} />
      </main>
    </>
  )
}
