"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function Header({ title, description, action }) {
  return (
    <div className="flex items-center justify-between border-b bg-background px-6 py-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}
