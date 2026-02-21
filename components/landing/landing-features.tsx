"use client";

import {
    Users,
    Clock,
    CreditCard,
    ShieldCheck,
    BarChart3,
    Smartphone,
    Zap,
    Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Smart Payroll",
        description: "Automated tax calculations and direct deposits in just a few clicks.",
        icon: CreditCard,
        className: "md:col-span-2 md:row-span-1 bg-primary/5",
        iconColor: "text-primary"
    },
    {
        title: "Attendance tracking",
        description: "Real-time clock-in/out with GPS fencing and biometric sync.",
        icon: Clock,
        className: "md:col-span-1 md:row-span-2 bg-blue-500/5",
        iconColor: "text-blue-500"
    },
    {
        title: "Employee Portal",
        description: "Personalized dashboards for your entire workforce.",
        icon: Users,
        className: "md:col-span-1 md:row-span-1 bg-indigo-500/5",
        iconColor: "text-indigo-500"
    },
    {
        title: "Enterprise Security",
        description: "Bank-grade encryption and granular access control for all data.",
        icon: ShieldCheck,
        className: "md:col-span-1 md:row-span-1 bg-emerald-500/5",
        iconColor: "text-emerald-500"
    },
    {
        title: "Advanced Analytics",
        description: "Deep insights into company performance and employee turnover.",
        icon: BarChart3,
        className: "md:col-span-2 md:row-span-1 bg-amber-500/5",
        iconColor: "text-amber-500"
    }
];

export function LandingFeatures() {
    return (
        <section id="features" className="py-24 relative overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center text-center mb-16">
                    <h2 className="font-display text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Built for the modern workforce
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        GoHRIS is equipped with everything you need to manage your team effectively,
                        from hire to retire.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={feature.title}
                            className={cn(
                                "group relative p-8 rounded-3xl border border-border/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1",
                                feature.className
                            )}
                        >
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />

                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6",
                                feature.iconColor,
                                "bg-white dark:bg-slate-900 shadow-sm border border-border/50"
                            )}>
                                <feature.icon className="w-6 h-6" />
                            </div>

                            <h3 className="font-display text-xl font-bold mb-3 tracking-tight">{feature.title}</h3>
                            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>

                            <div className="mt-8 flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                Learn more
                                <Zap className="w-4 h-4 ml-2 fill-primary" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Mini Features */}
                <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="flex flex-col items-center text-center gap-4">
                        <Globe className="w-8 h-8 text-muted-foreground/40" />
                        <p className="font-semibold">Global Compliance</p>
                    </div>
                    <div className="flex flex-col items-center text-center gap-4">
                        <Smartphone className="w-8 h-8 text-muted-foreground/40" />
                        <p className="font-semibold">Mobile App</p>
                    </div>
                    <div className="flex flex-col items-center text-center gap-4">
                        <Zap className="w-8 h-8 text-muted-foreground/40" />
                        <p className="font-semibold">Zero Config</p>
                    </div>
                    <div className="flex flex-col items-center text-center gap-4">
                        <Users className="w-8 h-8 text-muted-foreground/40" />
                        <p className="font-semibold">Team Insights</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
