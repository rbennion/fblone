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
import { Pencil, Trash2, ArrowRight, Send } from "lucide-react"

const statusColors = {
  draft: "secondary",
  sent: "warning",
  accepted: "success",
  declined: "destructive",
}

export default function EstimatesPage() {
  const {
    estimates,
    clients,
    addEstimate,
    updateEstimate,
    deleteEstimate,
    convertEstimateToInvoice,
    getClient,
  } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEstimate, setEditingEstimate] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: "",
    validUntil: "",
    items: [],
    notes: "",
  })

  const resetForm = () => {
    setFormData({
      clientId: "",
      validUntil: "",
      items: [],
      notes: "",
    })
    setEditingEstimate(null)
  }

  const handleOpenDialog = (estimate = null) => {
    if (estimate) {
      setEditingEstimate(estimate)
      setFormData({
        clientId: estimate.clientId || "",
        validUntil: estimate.validUntil || "",
        items: estimate.items || [],
        notes: estimate.notes || "",
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
      if (editingEstimate) {
        await updateEstimate(editingEstimate.id, formData)
      } else {
        await addEstimate(formData)
      }
      handleCloseDialog()
    } catch (err) {
      console.error("Failed to save estimate:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this estimate?")) {
      try {
        await deleteEstimate(id)
      } catch (err) {
        console.error("Failed to delete estimate:", err)
      }
    }
  }

  const handleSend = async (id) => {
    try {
      await updateEstimate(id, { status: "sent" })
    } catch (err) {
      console.error("Failed to send estimate:", err)
    }
  }

  const handleConvertToInvoice = async (id) => {
    if (confirm("Convert this estimate to an invoice?")) {
      try {
        await convertEstimateToInvoice(id)
      } catch (err) {
        console.error("Failed to convert estimate:", err)
      }
    }
  }

  const getTotal = (items) => {
    return items?.reduce((sum, item) => sum + item.quantity * item.rate, 0) || 0
  }

  return (
    <div>
      <Header
        title="Estimates"
        description="Create and manage estimates"
        action={{ label: "New Estimate", onClick: () => handleOpenDialog() }}
      />
      <div className="p-6">
        {estimates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No estimates yet</p>
            <Button onClick={() => handleOpenDialog()}>Create your first estimate</Button>
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
                  <TableHead>Valid Until</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estimates.map((estimate) => {
                  const client = getClient(estimate.clientId)
                  return (
                    <TableRow key={estimate.id}>
                      <TableCell className="font-medium">{estimate.number}</TableCell>
                      <TableCell>{client?.name || "—"}</TableCell>
                      <TableCell>{formatCurrency(getTotal(estimate.items))}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[estimate.status]}>
                          {estimate.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {estimate.validUntil ? formatDate(estimate.validUntil) : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {estimate.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSend(estimate.id)}
                              title="Send"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {estimate.status === "sent" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleConvertToInvoice(estimate.id)}
                              title="Convert to Invoice"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(estimate)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(estimate.id)}
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
              {editingEstimate ? "Edit Estimate" : "New Estimate"}
            </DialogTitle>
            <DialogDescription>
              {editingEstimate
                ? "Update the estimate details"
                : "Create a new estimate for a client"}
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
                  <Label htmlFor="validUntil">Valid Until</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) =>
                      setFormData({ ...formData, validUntil: e.target.value })
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
                  placeholder="Additional notes or terms..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.clientId || isSubmitting}>
                {isSubmitting ? "Saving..." : editingEstimate ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
