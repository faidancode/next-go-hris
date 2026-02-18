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
import { Input } from "@/components/ui/input";
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Pencil,
  Send,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import Link from "next/link";

interface DataTableRowActions {
  menu: string;
  id: string;
  entityName: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onSubmit?: (id: string) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  showDelete?: boolean;
  showEdit?: boolean;
  showView?: boolean;
  showSubmission?: boolean;
  showApproval?: boolean;
  showRejection?: boolean;
}

export function DataTableRowActions({
  menu,
  id,
  entityName,
  onDelete,
  onEdit,
  onSubmit,
  onApprove,
  onReject,
  showDelete = true,
  showEdit = true,
  showView = true,
  showSubmission = false,
  showApproval = false,
  showRejection = false,
}: DataTableRowActions) {
  const [rejectionReason, setRejectionReason] = useState("");

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
      {showEdit &&
        (onEdit ? (
          <Button variant="outline" size="sm" onClick={() => onEdit(id)}>
            <Pencil size={14} />
          </Button>
        ) : (
          <Link href={`/${menu}/${id}`}>
            <Button variant="outline" size="sm">
              <Pencil size={14} />
            </Button>
          </Link>
        ))}

      {/* Submission Button (Opsional) */}
      {showSubmission && onSubmit && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" className="bg-green-600 text-white">
              <Send size={14} className="text-white" />
              Submit
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex gap-1 mb-2">
                <AlertCircle className="text-blue-500" />
                <AlertDialogTitle className="font-semibold text-blue-600">
                  Confirmation
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="mt-2">
                Are you sure you want to submit{" "}
                <span className="font-bold text-black">{entityName}</span>?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                <X className="mr-2" size={16} />
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-green-600 hover:bg-green-700"
                onClick={() => onSubmit(id)}
              >
                <Send className="mr-2" size={16} />
                Submit
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Approval Button (Opsional) */}
      {showApproval && onApprove && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="sm" className="bg-green-600 text-white">
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

      {/* Rejection Button (Opsional) */}
      {showRejection && onReject && (
        <AlertDialog
          onOpenChange={(open) => {
            if (!open) setRejectionReason("");
          }}
        >
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-red-600">
              <XCircle size={14} />
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex gap-1 mb-2">
                <AlertCircle className="text-red-500" />
                <AlertDialogTitle className="font-semibold text-red-600">
                  Rejection Confirmation
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="mt-2">
                Reject{" "}
                <span className="font-bold text-black">{entityName}</span> with
                reason.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <Input
              placeholder="Rejection reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
            />

            <AlertDialogFooter>
              <AlertDialogCancel>
                <X className="mr-2" size={16} />
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={(event) => {
                  const reason = rejectionReason.trim();
                  if (!reason) {
                    event.preventDefault();
                    return;
                  }
                  onReject(id, reason);
                  setRejectionReason("");
                }}
              >
                <XCircle className="mr-2" size={16} />
                Reject
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
