import { createLeave, getLeaves, updateLeave, type CreateLeavePayload, type UpdateLeavePayload } from "@/lib/api/leave";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLeaves = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["leaves", page, pageSize, search, sort],
    queryFn: () => getLeaves(page, pageSize, search, sort),
    staleTime: 60_000,
    enabled,
  });
};

export const useCreateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateLeavePayload) => createLeave(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
      toast.success("Leave request submitted.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to create leave.");
      toast.error(code, { description: message });
    },
  });
};

export const useUpdateLeave = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateLeavePayload;
    }) => updateLeave(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves"] });
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to update leave.");
      toast.error(code, { description: message });
    },
  });
};

