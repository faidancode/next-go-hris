"use client";

import { Alert } from "@/components/shared/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { usePayrollSheet } from "@/hooks/use-payroll-sheet";
import { useCreatePayroll, usePayrollBreakdown } from "@/hooks/use-payroll";
import { useEmployees } from "@/hooks/use-employee";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { payrollSchema, PayrollFormValues } from "@/lib/validations/payroll-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const formatDate = (date: string | Date | undefined) => {
    if (!date) return "";
    return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(new Date(date));
};

export default function PayrollSheet() {
    const { open, mode, selectedId, selectedPayroll, close } = usePayrollSheet();
    const breakdownQuery = usePayrollBreakdown(selectedId || "", open && mode === "view");
    const createMutation = useCreatePayroll();
    const employeesQuery = useEmployees(1, 1000, "", "full_name:asc", open && mode === "create");

    const form = useForm<PayrollFormValues>({
        resolver: zodResolver(payrollSchema),
        defaultValues: {
            employee_id: "",
            period_start: new Date().toISOString().split("T")[0],
            period_end: new Date().toISOString().split("T")[0],
            base_salary: 0,
            allowance: 0,
            overtime_hours: 0,
            overtime_rate: 0,
            deduction: 0,
            allowance_items: [],
            deduction_items: [],
        },
    });

    const onSubmit = async (values: PayrollFormValues) => {
        try {
            await createMutation.mutateAsync(values);
            close();
        } catch (err) {
            console.error(err);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Sheet open={open} onOpenChange={(state) => !state && close()}>
            <SheetContent className="w-full sm:max-w-2xl p-0">
                <SheetHeader className="p-6 border-b">
                    <SheetTitle>
                        {mode === "create" ? "Generate Payroll" : "Payroll Details"}
                    </SheetTitle>
                </SheetHeader>

                <div className="h-[calc(100vh-80px)] overflow-y-auto p-6">
                    {mode === "create" ? (
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Employee</Label>
                                <Controller
                                    control={form.control}
                                    name="employee_id"
                                    render={({ field }) => (
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select employee" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {(employeesQuery.data?.data ?? []).map((emp) => (
                                                    <SelectItem key={emp.id} value={emp.id}>
                                                        {emp.full_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Period Start</Label>
                                    <Input type="date" {...form.register("period_start")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Period End</Label>
                                    <Input type="date" {...form.register("period_end")} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Base Salary</Label>
                                <Controller
                                    control={form.control}
                                    name="base_salary"
                                    render={({ field }) => (
                                        <Input
                                            type="number"
                                            value={field.value}
                                            onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                                        />
                                    )}
                                />
                            </div>

                            <div className="pt-4 flex gap-2">
                                <Button variant="outline" type="button" onClick={close} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={createMutation.isPending} className="flex-1">
                                    {createMutation.isPending ? "Generating..." : "Generate"}
                                </Button>
                            </div>
                        </form>

                    ) : (
                        <div className="space-y-6">
                            {breakdownQuery.isLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-20 w-full" />
                                    <Skeleton className="h-40 w-full" />
                                    <Skeleton className="h-40 w-full" />
                                </div>
                            ) : breakdownQuery.data ? (
                                <>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                                Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-end">
                                                <div>
                                                    <p className="text-2xl font-bold">
                                                        {formatCurrency(breakdownQuery.data.net_salary)}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground capitalize">
                                                        Status: {breakdownQuery.data.status}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-medium">
                                                        {selectedPayroll?.employee_name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(breakdownQuery.data.period_start)} - {formatDate(breakdownQuery.data.period_end)}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-sm">Earnings</h3>
                                        <div className="space-y-2 border rounded-lg p-4 bg-muted/30">
                                            <div className="flex justify-between text-sm">
                                                <span>Base Salary</span>
                                                <span>{formatCurrency(breakdownQuery.data.base_salary.amount)}</span>
                                            </div>
                                            {breakdownQuery.data.allowances.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span>{item.label}</span>
                                                    <span>{formatCurrency(item.amount)}</span>
                                                </div>
                                            ))}
                                            <div className="flex justify-between text-sm font-medium pt-2 border-t">
                                                <span>Total Allowance</span>
                                                <span>{formatCurrency(breakdownQuery.data.allowance_total)}</span>
                                            </div>
                                        </div>

                                        <h3 className="font-semibold text-sm">Deductions</h3>
                                        <div className="space-y-2 border rounded-lg p-4 bg-muted/30 text-red-600">
                                            {breakdownQuery.data.deductions.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span>{item.label}</span>
                                                    <span>({formatCurrency(item.amount)})</span>
                                                </div>
                                            ))}
                                            {breakdownQuery.data.deductions.length === 0 && (
                                                <div className="text-sm text-muted-foreground italic">No deductions</div>
                                            )}
                                            <div className="flex justify-between text-sm font-medium pt-2 border-t text-red-700">
                                                <span>Total Deduction</span>
                                                <span>({formatCurrency(breakdownQuery.data.deduction_total)})</span>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    Failed to load breakdown.
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </SheetContent>
        </Sheet>
    );
}
