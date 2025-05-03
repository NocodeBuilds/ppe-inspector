
import { ColumnDef } from "@tanstack/react-table"
import { PPEItem, PPEStatus } from "@/types/ppe"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

// Helper function to determine badge variant based on PPE status
const getStatusVariant = (status: PPEStatus) => {
  switch (status) {
    case "active":
      return "success"
    case "expired":
      return "destructive"
    case "flagged":
      return "warning"
    case "due":
      return "warning"
    case "inspected":
      return "default"
    case "out-of-service":
      return "secondary"
    case "maintenance":
      return "secondary"
    default:
      return "default"
  }
}

export const columns: ColumnDef<PPEItem>[] = [
  {
    accessorKey: "serial_number",
    header: "Serial Number",
    cell: ({ row }) => <div className="font-medium">{row.original.serial_number}</div>,
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <div>{row.original.type}</div>,
  },
  {
    accessorKey: "brand",
    header: "Brand",
    cell: ({ row }) => <div>{row.original.brand || "N/A"}</div>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <Badge variant={getStatusVariant(status)}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    accessorKey: "next_inspection",
    header: "Next Inspection",
    cell: ({ row }) => {
      const date = row.original.next_inspection
      if (!date) return <div>N/A</div>
      return <div>{format(new Date(date), "MMM d, yyyy")}</div>
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const ppe = row.original
      
      return (
        <div className="text-right">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Eye className="h-4 w-4" />
            <span className="sr-only">View Details</span>
          </Button>
        </div>
      )
    },
  },
]
