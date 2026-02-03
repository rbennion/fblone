"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { useStore } from "@/lib/store"

export default function DashboardLayout({ children }) {
  const { isLoaded, error } = useStore()

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">Configuration Error</h1>
          <p className="text-muted-foreground">{error}</p>
          <div className="text-left bg-muted p-4 rounded-lg text-sm">
            <p className="font-medium mb-2">To fix this:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Create a Supabase project at supabase.com</li>
              <li>Copy your project URL and anon key</li>
              <li>Create a <code className="bg-background px-1 rounded">.env.local</code> file with:</li>
            </ol>
            <pre className="mt-2 bg-background p-2 rounded text-xs overflow-x-auto">
{`NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key`}
            </pre>
            <p className="mt-2">Then run the SQL schema from <code className="bg-background px-1 rounded">supabase/schema.sql</code></p>
          </div>
        </div>
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
