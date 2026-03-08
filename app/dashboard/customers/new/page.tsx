import { DashboardHeader } from '@/components/dashboard-header'
import { CustomerForm } from '@/components/customers/customer-form'

export default function NewCustomerPage() {
  return (
    <>
      <DashboardHeader
        title="Add Customer"
        description="Register a new customer"
      />

      <main className="flex-1 p-6">
        <CustomerForm />
      </main>
    </>
  )
}
