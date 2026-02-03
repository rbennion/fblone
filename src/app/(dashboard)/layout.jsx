"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useStore } from "@/lib/store"

export default function DashboardLayout({ children }) {
  const { isLoaded } = useStore()

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
