"use client"

import { StoreProvider } from "@/lib/store"

export function Providers({ children }) {
  return <StoreProvider>{children}</StoreProvider>
}
