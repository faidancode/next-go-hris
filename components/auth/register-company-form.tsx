"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    registerCompanySchema,
    type RegisterCompanyFormValues
} from "@/lib/validations/company-schema";
import { registerCompany } from "@/lib/api/company";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert } from "@/components/shared/alert";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Building2,
    User,
    Mail,
    Lock,
    ArrowRight,
    CheckCircle2,
    Loader2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function RegisterCompanyForm() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const form = useForm<RegisterCompanyFormValues>({
        resolver: zodResolver(registerCompanySchema),
        defaultValues: {
            company_name: "",
            company_email: "",
            admin_name: "",
            admin_email: "",
            password: "",
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = form;

    const onSubmit = async (values: RegisterCompanyFormValues) => {
        setIsLoading(true);
        setError(null);
        try {
            await registerCompany(values);
            toast.success("Company registered successfully!", {
                description: "You'll be redirected to login in a moment.",
            });
            setTimeout(() => {
                router.push("/login");
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to register company");
            toast.error("Registration failed", {
                description: err instanceof Error ? err.message : "Something went wrong",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4">
            <Card className="border-border/40 shadow-2xl overflow-hidden backdrop-blur-sm bg-card/95">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-linear-to-r from-primary via-amber-400 to-amber-600" />

                <CardHeader className="space-y-1 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Building2 className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-3xl font-display font-bold tracking-tight">
                            Register Your Company
                        </CardTitle>
                    </div>
                    <CardDescription className="text-base">
                        Configure your organization and set up the primary administrator account.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                        {error && <Alert variant="error">{error}</Alert>}

                        {/* Company Information Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                                <Building2 className="w-4 h-4" />
                                Company Details
                            </div>
                            <Separator className="bg-border/40" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="company_name" className="text-sm font-medium">
                                        Company Name
                                    </Label>
                                    <div className="relative">
                                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="company_name"
                                            placeholder="Acme Corp"
                                            className={cn("pl-10 h-11", errors.company_name && "border-destructive ring-destructive/20")}
                                            {...register("company_name")}
                                        />
                                    </div>
                                    {errors.company_name && (
                                        <p className="text-xs text-destructive mt-1 font-medium">
                                            {errors.company_name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="company_email" className="text-sm font-medium">
                                        Official Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="company_email"
                                            type="email"
                                            placeholder="hello@acme.com"
                                            className={cn("pl-10 h-11", errors.company_email && "border-destructive ring-destructive/20")}
                                            {...register("company_email")}
                                        />
                                    </div>
                                    {errors.company_email && (
                                        <p className="text-xs text-destructive mt-1 font-medium">
                                            {errors.company_email.message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Admin Account Section */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-sm font-semibold text-primary uppercase tracking-wider">
                                <User className="w-4 h-4" />
                                Administrator Account
                            </div>
                            <Separator className="bg-border/40" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin_name" className="text-sm font-medium">
                                        Admin Full Name
                                    </Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="admin_name"
                                            placeholder="John Doe"
                                            className={cn("pl-10 h-11", errors.admin_name && "border-destructive ring-destructive/20")}
                                            {...register("admin_name")}
                                        />
                                    </div>
                                    {errors.admin_name && (
                                        <p className="text-xs text-destructive mt-1 font-medium">
                                            {errors.admin_name.message}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="admin_email" className="text-sm font-medium">
                                        Admin Login Email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="admin_email"
                                            type="email"
                                            placeholder="john@acme.com"
                                            className={cn("pl-10 h-11", errors.admin_email && "border-destructive ring-destructive/20")}
                                            {...register("admin_email")}
                                        />
                                    </div>
                                    {errors.admin_email && (
                                        <p className="text-xs text-destructive mt-1 font-medium">
                                            {errors.admin_email.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" aria-description="text-sm font-medium">
                                    Admin Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className={cn("pl-10 h-11 font-mono", errors.password && "border-destructive ring-destructive/20")}
                                        {...register("password")}
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-xs text-destructive mt-1 font-medium">
                                        {errors.password.message}
                                    </p>
                                )}
                                <p className="text-[10px] text-muted-foreground">
                                    Must be at least 6 characters long.
                                </p>
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button
                                type="submit"
                                size="lg"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-linear-to-r from-primary to-primary/90 text-lg font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Processing Registration...
                                    </>
                                ) : (
                                    <>
                                        Complete Registration
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2 items-center justify-center pt-2">
                            <p className="text-sm text-muted-foreground">
                                By registering, you agree to our Terms of Service.
                            </p>
                            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-secondary" /> Secure Data Encryption
                                </span>
                                <span className="flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-secondary" /> No Credit Card Required
                                </span>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <p className="mt-8 text-center text-muted-foreground">
                Already have an account?{" "}
                <button
                    onClick={() => router.push("/login")}
                    className="text-primary font-semibold hover:underline"
                >
                    Sign In
                </button>
            </p>
        </div>
    );
}
