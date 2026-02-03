"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { generateId } from "./utils"

const StoreContext = createContext(null)

const STORAGE_KEY = "freshbooks-clone-data"

const defaultData = {
  clients: [],
  estimates: [],
  proposals: [],
  invoices: [],
}

export function StoreProvider({ children }) {
  const [data, setData] = useState(defaultData)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setData(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to parse stored data", e)
      }
    }
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    }
  }, [data, isLoaded])

  // Client operations
  const addClient = (client) => {
    const newClient = { ...client, id: generateId(), createdAt: new Date().toISOString() }
    setData((prev) => ({ ...prev, clients: [...prev.clients, newClient] }))
    return newClient
  }

  const updateClient = (id, updates) => {
    setData((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }))
  }

  const deleteClient = (id) => {
    setData((prev) => ({ ...prev, clients: prev.clients.filter((c) => c.id !== id) }))
  }

  const getClient = (id) => data.clients.find((c) => c.id === id)

  // Estimate operations
  const addEstimate = (estimate) => {
    const number = `EST-${String(data.estimates.length + 1).padStart(4, "0")}`
    const newEstimate = { ...estimate, id: generateId(), number, createdAt: new Date().toISOString(), status: "draft" }
    setData((prev) => ({ ...prev, estimates: [...prev.estimates, newEstimate] }))
    return newEstimate
  }

  const updateEstimate = (id, updates) => {
    setData((prev) => ({
      ...prev,
      estimates: prev.estimates.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    }))
  }

  const deleteEstimate = (id) => {
    setData((prev) => ({ ...prev, estimates: prev.estimates.filter((e) => e.id !== id) }))
  }

  const getEstimate = (id) => data.estimates.find((e) => e.id === id)

  // Proposal operations
  const addProposal = (proposal) => {
    const number = `PROP-${String(data.proposals.length + 1).padStart(4, "0")}`
    const newProposal = { ...proposal, id: generateId(), number, createdAt: new Date().toISOString(), status: "draft" }
    setData((prev) => ({ ...prev, proposals: [...prev.proposals, newProposal] }))
    return newProposal
  }

  const updateProposal = (id, updates) => {
    setData((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  }

  const deleteProposal = (id) => {
    setData((prev) => ({ ...prev, proposals: prev.proposals.filter((p) => p.id !== id) }))
  }

  const getProposal = (id) => data.proposals.find((p) => p.id === id)

  // Invoice operations
  const addInvoice = (invoice) => {
    const number = `INV-${String(data.invoices.length + 1).padStart(4, "0")}`
    const newInvoice = { ...invoice, id: generateId(), number, createdAt: new Date().toISOString(), status: "draft" }
    setData((prev) => ({ ...prev, invoices: [...prev.invoices, newInvoice] }))
    return newInvoice
  }

  const updateInvoice = (id, updates) => {
    setData((prev) => ({
      ...prev,
      invoices: prev.invoices.map((i) => (i.id === id ? { ...i, ...updates } : i)),
    }))
  }

  const deleteInvoice = (id) => {
    setData((prev) => ({ ...prev, invoices: prev.invoices.filter((i) => i.id !== id) }))
  }

  const getInvoice = (id) => data.invoices.find((i) => i.id === id)

  // Convert estimate to invoice
  const convertEstimateToInvoice = (estimateId) => {
    const estimate = getEstimate(estimateId)
    if (!estimate) return null

    const invoice = addInvoice({
      clientId: estimate.clientId,
      items: estimate.items,
      notes: estimate.notes,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })

    updateEstimate(estimateId, { status: "accepted", convertedToInvoice: invoice.id })
    return invoice
  }

  // Convert proposal to estimate
  const convertProposalToEstimate = (proposalId) => {
    const proposal = getProposal(proposalId)
    if (!proposal) return null

    const estimate = addEstimate({
      clientId: proposal.clientId,
      items: proposal.items || [],
      notes: proposal.notes,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })

    updateProposal(proposalId, { status: "accepted", convertedToEstimate: estimate.id })
    return estimate
  }

  const value = {
    ...data,
    isLoaded,
    addClient,
    updateClient,
    deleteClient,
    getClient,
    addEstimate,
    updateEstimate,
    deleteEstimate,
    getEstimate,
    addProposal,
    updateProposal,
    deleteProposal,
    getProposal,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoice,
    convertEstimateToInvoice,
    convertProposalToEstimate,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}
