import {
  clockInAttendance,
  clockOutAttendance,
  getAttendances,
  type ClockInPayload,
  type ClockOutPayload,
} from "@/lib/api/attendance";
import { getErrorMessage, getReadableErrorCode } from "@/lib/api/errors";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useAttendances = (
  page: number,
  pageSize: number,
  search: string,
  sort: string,
  employeeId?: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["attendances", page, pageSize, search, sort, employeeId],
    queryFn: () => getAttendances(page, pageSize, search, sort, employeeId),
    staleTime: 30_000,
    enabled,
  });
};

export const useClockInAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ClockInPayload) => clockInAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      toast.success("Clock in recorded.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to clock in.");
      toast.error(code, { description: message });
    },
  });
};

export const useClockOutAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ClockOutPayload) => clockOutAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendances"] });
      toast.success("Clock out recorded.");
    },
    onError: (error) => {
      const code = getReadableErrorCode(error);
      const message = getErrorMessage(error, "Failed to clock out.");
      toast.error(code, { description: message });
    },
  });
};
