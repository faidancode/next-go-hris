import { RegisterCompanyForm } from "@/components/auth/register-company-form";
import { Suspense } from "react";
import { ShieldCheck } from "lucide-react";
import { Logo } from "@/components/shared/logo";

export const metadata = {
    title: "Register Company | GoHRIS",
    description: "Start your company's journey with GoHRIS. Automate your HR and payroll processes today.",
};

export default function RegisterCompanyPage() {
    return (
        <div className="relative min-h-screen w-full flex flex-col items-center justify-center py-12 px-6 overflow-hidden">
            {/* Dynamic Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[100px] animate-pulse delay-1000" />
                <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-size-[32px_32px]" />
            </div>

            <div className="w-full flex flex-col items-center">
                {/* Branding */}
                <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Logo size="lg" />
                </div>

                {/* Main Content */}
                <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                    <Suspense fallback={
                        <div className="flex flex-col items-center justify-center p-12 space-y-4">
                            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                            <p className="text-muted-foreground font-medium">Preparing registration form...</p>
                        </div>
                    }>
                        <RegisterCompanyForm />
                    </Suspense>
                </div>
            </div>

            {/* Footer Branding */}
            <footer className="mt-12 text-center text-sm text-muted-foreground/60">
                <p>© {new Date().getFullYear()} GoHRIS Technologies Inc.</p>
            </footer>
        </div>
    );
}
