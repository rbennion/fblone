"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { supabase, isSupabaseConfigured } from "./supabase"

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [clients, setClients] = useState([])
  const [estimates, setEstimates] = useState([])
  const [proposals, setProposals] = useState([])
  const [invoices, setInvoices] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  // Fetch all data on mount
  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured) {
        setError("Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.")
        setIsLoaded(true)
        return
      }

      try {
        const [clientsRes, estimatesRes, proposalsRes, invoicesRes] = await Promise.all([
          supabase.from("clients").select("*").order("created_at", { ascending: false }),
          supabase.from("estimates").select("*").order("created_at", { ascending: false }),
          supabase.from("proposals").select("*").order("created_at", { ascending: false }),
          supabase.from("invoices").select("*").order("created_at", { ascending: false }),
        ])

        if (clientsRes.error) throw clientsRes.error
        if (estimatesRes.error) throw estimatesRes.error
        if (proposalsRes.error) throw proposalsRes.error
        if (invoicesRes.error) throw invoicesRes.error

        setClients(transformFromDb(clientsRes.data))
        setEstimates(transformFromDb(estimatesRes.data))
        setProposals(transformFromDb(proposalsRes.data))
        setInvoices(transformFromDb(invoicesRes.data))
      } catch (err) {
        console.error("Failed to fetch data:", err)
        setError(err.message)
      } finally {
        setIsLoaded(true)
      }
    }

    fetchData()
  }, [])

  // Transform database snake_case to camelCase
  function transformFromDb(rows) {
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      company: row.company,
      address: row.address,
      notes: row.notes,
      title: row.title,
      description: row.description,
      terms: row.terms,
      number: row.number,
      clientId: row.client_id,
      status: row.status,
      validUntil: row.valid_until,
      dueDate: row.due_date,
      paidAt: row.paid_at,
      items: row.items || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }))
  }

  // Transform camelCase to snake_case for database
  function transformToDb(data) {
    const result = {}
    if (data.name !== undefined) result.name = data.name
    if (data.email !== undefined) result.email = data.email
    if (data.phone !== undefined) result.phone = data.phone
    if (data.company !== undefined) result.company = data.company
    if (data.address !== undefined) result.address = data.address
    if (data.notes !== undefined) result.notes = data.notes
    if (data.title !== undefined) result.title = data.title
    if (data.description !== undefined) result.description = data.description
    if (data.terms !== undefined) result.terms = data.terms
    if (data.clientId !== undefined) result.client_id = data.clientId
    if (data.status !== undefined) result.status = data.status
    if (data.validUntil !== undefined) result.valid_until = data.validUntil
    if (data.dueDate !== undefined) result.due_date = data.dueDate
    if (data.paidAt !== undefined) result.paid_at = data.paidAt
    if (data.items !== undefined) result.items = data.items
    return result
  }

  // Client operations
  const addClient = useCallback(async (client) => {
    const { data, error } = await supabase
      .from("clients")
      .insert(transformToDb(client))
      .select()
      .single()

    if (error) {
      console.error("Failed to add client:", error)
      throw error
    }

    const newClient = transformFromDb([data])[0]
    setClients((prev) => [newClient, ...prev])
    return newClient
  }, [])

  const updateClient = useCallback(async (id, updates) => {
    const { error } = await supabase
      .from("clients")
      .update(transformToDb(updates))
      .eq("id", id)

    if (error) {
      console.error("Failed to update client:", error)
      throw error
    }

    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
    )
  }, [])

  const deleteClient = useCallback(async (id) => {
    const { error } = await supabase.from("clients").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete client:", error)
      throw error
    }

    setClients((prev) => prev.filter((c) => c.id !== id))
  }, [])

  const getClient = useCallback((id) => clients.find((c) => c.id === id), [clients])

  // Estimate operations
  const addEstimate = useCallback(async (estimate) => {
    // Get next number
    const { data: numberData } = await supabase.rpc("get_next_number", {
      counter_id: "estimate",
      prefix: "EST",
    })

    const { data, error } = await supabase
      .from("estimates")
      .insert({
        ...transformToDb(estimate),
        number: numberData || `EST-${Date.now()}`,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to add estimate:", error)
      throw error
    }

    const newEstimate = transformFromDb([data])[0]
    setEstimates((prev) => [newEstimate, ...prev])
    return newEstimate
  }, [])

  const updateEstimate = useCallback(async (id, updates) => {
    const { error } = await supabase
      .from("estimates")
      .update(transformToDb(updates))
      .eq("id", id)

    if (error) {
      console.error("Failed to update estimate:", error)
      throw error
    }

    setEstimates((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    )
  }, [])

  const deleteEstimate = useCallback(async (id) => {
    const { error } = await supabase.from("estimates").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete estimate:", error)
      throw error
    }

    setEstimates((prev) => prev.filter((e) => e.id !== id))
  }, [])

  const getEstimate = useCallback((id) => estimates.find((e) => e.id === id), [estimates])

  // Proposal operations
  const addProposal = useCallback(async (proposal) => {
    const { data: numberData } = await supabase.rpc("get_next_number", {
      counter_id: "proposal",
      prefix: "PROP",
    })

    const { data, error } = await supabase
      .from("proposals")
      .insert({
        ...transformToDb(proposal),
        number: numberData || `PROP-${Date.now()}`,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to add proposal:", error)
      throw error
    }

    const newProposal = transformFromDb([data])[0]
    setProposals((prev) => [newProposal, ...prev])
    return newProposal
  }, [])

  const updateProposal = useCallback(async (id, updates) => {
    const { error } = await supabase
      .from("proposals")
      .update(transformToDb(updates))
      .eq("id", id)

    if (error) {
      console.error("Failed to update proposal:", error)
      throw error
    }

    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    )
  }, [])

  const deleteProposal = useCallback(async (id) => {
    const { error } = await supabase.from("proposals").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete proposal:", error)
      throw error
    }

    setProposals((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const getProposal = useCallback((id) => proposals.find((p) => p.id === id), [proposals])

  // Invoice operations
  const addInvoice = useCallback(async (invoice) => {
    const { data: numberData } = await supabase.rpc("get_next_number", {
      counter_id: "invoice",
      prefix: "INV",
    })

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        ...transformToDb(invoice),
        number: numberData || `INV-${Date.now()}`,
        status: "draft",
      })
      .select()
      .single()

    if (error) {
      console.error("Failed to add invoice:", error)
      throw error
    }

    const newInvoice = transformFromDb([data])[0]
    setInvoices((prev) => [newInvoice, ...prev])
    return newInvoice
  }, [])

  const updateInvoice = useCallback(async (id, updates) => {
    const { error } = await supabase
      .from("invoices")
      .update(transformToDb(updates))
      .eq("id", id)

    if (error) {
      console.error("Failed to update invoice:", error)
      throw error
    }

    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates } : i))
    )
  }, [])

  const deleteInvoice = useCallback(async (id) => {
    const { error } = await supabase.from("invoices").delete().eq("id", id)

    if (error) {
      console.error("Failed to delete invoice:", error)
      throw error
    }

    setInvoices((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const getInvoice = useCallback((id) => invoices.find((i) => i.id === id), [invoices])

  // Convert estimate to invoice
  const convertEstimateToInvoice = useCallback(async (estimateId) => {
    const estimate = getEstimate(estimateId)
    if (!estimate) return null

    const invoice = await addInvoice({
      clientId: estimate.clientId,
      items: estimate.items,
      notes: estimate.notes,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })

    await updateEstimate(estimateId, { status: "accepted" })
    return invoice
  }, [getEstimate, addInvoice, updateEstimate])

  // Convert proposal to estimate
  const convertProposalToEstimate = useCallback(async (proposalId) => {
    const proposal = getProposal(proposalId)
    if (!proposal) return null

    const estimate = await addEstimate({
      clientId: proposal.clientId,
      items: proposal.items || [],
      notes: proposal.notes,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    })

    await updateProposal(proposalId, { status: "accepted" })
    return estimate
  }, [getProposal, addEstimate, updateProposal])

  const value = {
    clients,
    estimates,
    proposals,
    invoices,
    isLoaded,
    error,
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
