"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Eye, Pencil, Trash2, X } from "lucide-react";

import Link from "next/link";

interface DataTableRowActions {
  menu: string;
  id: string;
  entityName: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onApprove?: (id: string) => void;
  showDelete?: boolean;
  showEdit?: boolean;
  showView?: boolean;
  showApproval?: boolean;
}

export function DataTableRowActions({
  menu,
  id,
  entityName,
  onDelete,
  onEdit,
  onApprove,
  showDelete = true,
  showEdit = true,
  showView = true,
  showApproval = false,
}: DataTableRowActions) {
  return (
    <div className="flex gap-2">
      {/* View Button */}
      {showView && (
        <Link href={`/${menu}/${id}`}>
          <Button variant="outline" size="sm" className="text-blue-700">
            <Eye size={14} />
          </Button>
        </Link>
      )}

      {/* Edit Button */}
      {showEdit && (
        onEdit ? (
          <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
            <Pencil size={14} />
          </Button>
        ) : (
          <Link href={`/${menu}/${id}`}>
            <Button variant="outline" size="sm">
              <Pencil size={14} />
            </Button>
          </Link>
        )
      )}

      {/* Approval Button (Opsional) */}
      {showApproval && onApprove && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="bg-green-600 text-white"
            >
              <CheckCircle size={14} className="text-white" />
              Approve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex gap-1 mb-2">
                <AlertCircle className="text-green-500" />
                <AlertDialogTitle className="font-semibold text-green-600">
                  Confirmation
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="mt-2">
                Are you sure you want to approve{" "}
                <span className="font-bold text-black">{entityName}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <X className="mr-2" size={16} />
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-500 hover:bg-green-600"
                onClick={() => onApprove(id)}
              >
                <CheckCircle className="mr-2" size={16} />
                Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Button (Opsional) */}
      {showDelete && onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600">
              <Trash2 size={14} />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex gap-1 mb-2">
                <AlertCircle className="text-red-500" />
                <AlertDialogTitle className="font-semibold text-red-600">
                  Confirmation
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="mt-2">
                Are you sure you want to delete{" "}
                <span className="font-bold text-black">{entityName}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <X className="mr-2" size={16} />
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => onDelete(id)}
              >
                <Trash2 className="mr-2" size={16} />
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
