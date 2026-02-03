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

export default function ProposalsPage() {
  const {
    proposals,
    clients,
    addProposal,
    updateProposal,
    deleteProposal,
    convertProposalToEstimate,
    getClient,
  } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProposal, setEditingProposal] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    clientId: "",
    title: "",
    description: "",
    items: [],
    notes: "",
    validUntil: "",
  })

  const resetForm = () => {
    setFormData({
      clientId: "",
      title: "",
      description: "",
      items: [],
      notes: "",
      validUntil: "",
    })
    setEditingProposal(null)
  }

  const handleOpenDialog = (proposal = null) => {
    if (proposal) {
      setEditingProposal(proposal)
      setFormData({
        clientId: proposal.clientId || "",
        title: proposal.title || "",
        description: proposal.description || "",
        items: proposal.items || [],
        notes: proposal.notes || "",
        validUntil: proposal.validUntil || "",
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
      if (editingProposal) {
        await updateProposal(editingProposal.id, formData)
      } else {
        await addProposal(formData)
      }
      handleCloseDialog()
    } catch (err) {
      console.error("Failed to save proposal:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this proposal?")) {
      try {
        await deleteProposal(id)
      } catch (err) {
        console.error("Failed to delete proposal:", err)
      }
    }
  }

  const handleSend = async (id) => {
    try {
      await updateProposal(id, { status: "sent" })
    } catch (err) {
      console.error("Failed to send proposal:", err)
    }
  }

  const handleConvertToEstimate = async (id) => {
    if (confirm("Convert this proposal to an estimate?")) {
      try {
        await convertProposalToEstimate(id)
      } catch (err) {
        console.error("Failed to convert proposal:", err)
      }
    }
  }

  const getTotal = (items) => {
    return items?.reduce((sum, item) => sum + item.quantity * item.rate, 0) || 0
  }

  return (
    <div>
      <Header
        title="Proposals"
        description="Create and manage proposals"
        action={{ label: "New Proposal", onClick: () => handleOpenDialog() }}
      />
      <div className="p-6">
        {proposals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No proposals yet</p>
            <Button onClick={() => handleOpenDialog()}>Create your first proposal</Button>
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Number</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[150px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proposals.map((proposal) => {
                  const client = getClient(proposal.clientId)
                  return (
                    <TableRow key={proposal.id}>
                      <TableCell className="font-medium">{proposal.number}</TableCell>
                      <TableCell>{proposal.title || "—"}</TableCell>
                      <TableCell>{client?.name || "—"}</TableCell>
                      <TableCell>{formatCurrency(getTotal(proposal.items))}</TableCell>
                      <TableCell>
                        <Badge variant={statusColors[proposal.status]}>
                          {proposal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(proposal.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {proposal.status === "draft" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSend(proposal.id)}
                              title="Send"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          {proposal.status === "sent" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleConvertToEstimate(proposal.id)}
                              title="Convert to Estimate"
                            >
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDialog(proposal)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(proposal.id)}
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
              {editingProposal ? "Edit Proposal" : "New Proposal"}
            </DialogTitle>
            <DialogDescription>
              {editingProposal
                ? "Update the proposal details"
                : "Create a new proposal for a client"}
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
                <Label htmlFor="title">Proposal Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Website Redesign Proposal"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe the project scope, objectives, and deliverables..."
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Pricing (Line Items)</Label>
                <LineItems
                  items={formData.items}
                  onChange={(items) => setFormData({ ...formData, items })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Terms & Conditions</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  placeholder="Payment terms, timeline, or other conditions..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={!formData.clientId || !formData.title || isSubmitting}>
                {isSubmitting ? "Saving..." : editingProposal ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
