"use client"

import { useStore } from "@/lib/store"
import { Header } from "@/components/layout/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import { Users, FileText, FileCheck, Receipt, DollarSign, Clock } from "lucide-react"

export default function DashboardPage() {
  const { clients, estimates, proposals, invoices } = useStore()

  const totalInvoiced = invoices.reduce((sum, inv) => {
    const total = inv.items?.reduce((s, i) => s + (i.quantity * i.rate), 0) || 0
    return sum + total
  }, 0)

  const paidInvoices = invoices.filter((i) => i.status === "paid")
  const totalPaid = paidInvoices.reduce((sum, inv) => {
    const total = inv.items?.reduce((s, i) => s + (i.quantity * i.rate), 0) || 0
    return sum + total
  }, 0)

  const pendingInvoices = invoices.filter((i) => i.status === "sent" || i.status === "draft")
  const totalPending = pendingInvoices.reduce((sum, inv) => {
    const total = inv.items?.reduce((s, i) => s + (i.quantity * i.rate), 0) || 0
    return sum + total
  }, 0)

  const stats = [
    { name: "Total Clients", value: clients.length, icon: Users, color: "text-blue-600" },
    { name: "Estimates", value: estimates.length, icon: FileText, color: "text-purple-600" },
    { name: "Proposals", value: proposals.length, icon: FileCheck, color: "text-orange-600" },
    { name: "Invoices", value: invoices.length, icon: Receipt, color: "text-green-600" },
  ]

  const financialStats = [
    { name: "Total Invoiced", value: formatCurrency(totalInvoiced), icon: DollarSign, color: "text-primary" },
    { name: "Total Paid", value: formatCurrency(totalPaid), icon: DollarSign, color: "text-green-600" },
    { name: "Pending Payment", value: formatCurrency(totalPending), icon: Clock, color: "text-yellow-600" },
  ]

  return (
    <div>
      <Header title="Dashboard" description="Overview of your business" />
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {financialStats.map((stat) => (
            <Card key={stat.name}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invoices yet</p>
              ) : (
                <div className="space-y-4">
                  {invoices.slice(-5).reverse().map((invoice) => {
                    const client = clients.find((c) => c.id === invoice.clientId)
                    const total = invoice.items?.reduce((s, i) => s + (i.quantity * i.rate), 0) || 0
                    return (
                      <div key={invoice.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{invoice.number}</p>
                          <p className="text-sm text-muted-foreground">{client?.name || "Unknown"}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(total)}</p>
                          <p className="text-sm text-muted-foreground capitalize">{invoice.status}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Clients</CardTitle>
            </CardHeader>
            <CardContent>
              {clients.length === 0 ? (
                <p className="text-sm text-muted-foreground">No clients yet</p>
              ) : (
                <div className="space-y-4">
                  {clients.slice(-5).reverse().map((client) => (
                    <div key={client.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{client.name}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {client.company || ""}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
