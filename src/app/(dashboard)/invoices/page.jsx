"use client"

import { useState } from "react"
import { useStore } from "@/lib/store"
import { Header } from "@/components/layout/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { LineItems } from "@/components/line-items"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { formatDate, formatCurrency } from "@/lib/utils"
import { Pencil, Trash2, Send, CheckCircle, XCircle } from "lucide-react"

const statusColors = {
  draft: "secondary",
  sent: "warning",
  paid: "success",
  overdue: "destructive",
  cancelled: "outline",
}

export default function InvoicesPage() {
  const {
    invoices,
    clients,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getClient,
  } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: "",
    dueDate: "",
    items: [],
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      clientId: "",
      dueDate: "",
      items: [],
      notes: "",
    })
    setEditingInvoice(null)
  }

  const handleOpenDialog = (invoice = null) => {
    if (invoice) {
      setEditingInvoice(invoice)
      setFormData({
        clientId: invoice.clientId || "",
        dueDate: invoice.dueDate || "",
        items: invoice.items || [],
        notes: invoice.notes || "",
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingInvoice) {
        await updateInvoice(editingInvoice.id, formData)
      } else {
        await addInvoice(formData)
      }
      handleCloseDialog()
    } catch (err) {
      console.error("Failed to save invoice:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      try {
        await deleteInvoice(id)
      } catch (err) {
        console.error("Failed to delete invoice:", err)
      }
    }
  }

  const handleSend = async (id) => {
    try {
      await updateInvoice(id, { status: "sent" })
    } catch (err) {
      console.error("Failed to send invoice:", err)
    }
  }

  const handleMarkPaid = async (id) => {
    try {
      await updateInvoice(id, { status: "paid", paidAt: new Date().toISOString() })
    } catch (err) {
      console.error("Failed to mark invoice as paid:", err)
    }
  }

  const handleCancel = async (id) => {
    if (confirm("Cancel this invoice?")) {
      try {
        await updateInvoice(id, { status: "cancelled" })
      } catch (err) {
        console.error("Failed to cancel invoice:", err)
      }
    }
  }

  const getTotal = (items) => {
    return items?.reduce((sum, item) => sum + item.quantity * item.rate, 0) || 0
  }

  return (
    <div>
      <Header
        title="Invoices"
        description="Create and manage invoices"
        action={{ label: "New Invoice", onClick: () => handleOpenDialog() }}
      />
      <div className="p-6">
        {invoices.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No invoices yet</p>
            <Button onClick={() => handleOpenDialog()}>Create your first invoice</Button>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => {
                  const client = getClient(invoice.clientId)
                  return (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{client?.name || "—"}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(getTotal(invoice.items))}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[invoice.status]}>
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invoice.dueDate ? formatDate(invoice.dueDate) : "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invoice.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {invoice.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSend(invoice.id)}
                              title="Send Invoice"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {invoice.status === "sent" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleMarkPaid(invoice.id)}
                                title="Mark as Paid"
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCancel(invoice.id)}
                                title="Cancel Invoice"
                              >
                                <XCircle className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(invoice)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(invoice.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingInvoice ? "Edit Invoice" : "New Invoice"}
            </DialogTitle>
            <DialogDescription>
              {editingInvoice
                ? "Update the invoice details"
                : "Create a new invoice for a client"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select
                    value={formData.clientId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, clientId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Line Items</Label>
                <LineItems
                  items={formData.items}
                  onChange={(items) => setFormData({ ...formData, items })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Payment instructions or additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.clientId || isSubmitting}>
                {isSubmitting ? "Saving..." : editingInvoice ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
