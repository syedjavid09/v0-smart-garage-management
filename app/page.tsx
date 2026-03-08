import Link from 'next/link'
import { Wrench, Car, ClipboardList, Package, Users, FileText, ArrowRight, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const features = [
  {
    icon: Users,
    title: 'Customer Management',
    description: 'Maintain a complete database of your customers with contact information, service history, and notes.',
  },
  {
    icon: Car,
    title: 'Vehicle Tracking',
    description: 'Keep detailed records of every vehicle including make, model, VIN, and service history.',
  },
  {
    icon: ClipboardList,
    title: 'Job Cards',
    description: 'Create and manage service orders with detailed work descriptions, parts used, and labor tracking.',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Track parts and supplies with real-time stock levels and automatic low-stock alerts.',
  },
  {
    icon: Wrench,
    title: 'Mechanic Portal',
    description: 'Dedicated interface for mechanics to view assigned jobs and update work status.',
  },
  {
    icon: FileText,
    title: 'Billing & Invoices',
    description: 'Generate professional invoices and track payments with multiple payment status options.',
  },
]

const benefits = [
  'Streamline your garage operations',
  'Reduce paperwork and manual tracking',
  'Improve customer communication',
  'Track inventory automatically',
  'Generate professional invoices',
  'Access from anywhere',
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">GaragePro</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container flex flex-col items-center gap-8 py-20 text-center md:py-32">
        <div className="flex max-w-3xl flex-col items-center gap-6">
          <div className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Smart Garage Management
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Manage Your Auto Repair Shop with Confidence
          </h1>
          <p className="max-w-2xl text-balance text-lg text-muted-foreground">
            GaragePro is a comprehensive garage management system that helps you track customers, 
            vehicles, jobs, inventory, and billing all in one place.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/auth/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything You Need
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Powerful features designed specifically for auto repair shops
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="relative overflow-hidden">
              <CardHeader>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t bg-muted/50 py-20">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Why Choose GaragePro?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Built by garage owners, for garage owners. We understand the challenges 
                of running an auto repair business.
              </p>
              <ul className="mt-8 space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-accent" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border bg-card p-8 shadow-lg">
              <div className="mb-6 text-center">
                <h3 className="text-2xl font-bold">Get Started Today</h3>
                <p className="mt-2 text-muted-foreground">
                  Create your account and start managing your garage
                </p>
              </div>
              <div className="space-y-4">
                <Button className="w-full" size="lg" asChild>
                  <Link href="/auth/sign-up">
                    Create Free Account
                  </Link>
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link href="/auth/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <div className="rounded-2xl bg-primary p-8 text-center text-primary-foreground md:p-12">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to Transform Your Garage?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg opacity-90">
            Join hundreds of auto repair shops that trust GaragePro to manage their daily operations.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/sign-up">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            <span className="font-semibold">GaragePro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} GaragePro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
