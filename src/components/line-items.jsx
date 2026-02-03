"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { formatCurrency } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

export function LineItems({ items, onChange }) {
  const addItem = () => {
    onChange([...items, { description: "", quantity: 1, rate: 0 }])
  }

  const updateItem = (index, field, value) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    onChange(newItems)
  }

  const removeItem = (index) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.rate, 0)

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {items.length > 0 && (
          <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
            <div className="col-span-5">Description</div>
            <div className="col-span-2">Qty</div>
            <div className="col-span-2">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-1"></div>
          </div>
        )}
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5">
              <Input
                placeholder="Item description"
                value={item.description}
                onChange={(e) => updateItem(index, "description", e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={item.rate}
                onChange={(e) => updateItem(index, "rate", Number(e.target.value))}
              />
            </div>
            <div className="col-span-2 text-right font-medium">
              {formatCurrency(item.quantity * item.rate)}
            </div>
            <div className="col-span-1 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4 mr-2" />
        Add Line Item
      </Button>
      {items.length > 0 && (
        <div className="flex justify-end pt-4 border-t">
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{formatCurrency(total)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
