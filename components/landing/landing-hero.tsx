"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Play, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export function LandingHero() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-500/10 rounded-full blur-[100px] animate-pulse delay-700" />
                <div className="absolute inset-0 bg-grid-black/[0.02] dark:bg-grid-white/[0.02] bg-size-[32px_32px]" />
            </div>

            <div className="container mx-auto px-6">
                <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                    {/* Badge */}
                    <div className="my-6 flex flex-wrap items-center justify-center gap-4">
                        <Button
                            size="sm"
                            asChild
                        >
                            <a
                                href="https://github.com/faidancode/go-hris"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                <img src="/github-white.svg" alt="GitHub" width={20} height={20} />
                                Backend (Go)
                            </a>
                        </Button>

                        <Button
                            size="sm"
                            asChild
                        >
                            <a
                                href="https://github.com/faidancode/next-go-hris"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2"
                            >
                                <img src="/github-white.svg" alt="GitHub" width={20} height={20} />
                                Frontend (Next.js)
                            </a>
                        </Button>
                    </div>


                    <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-8 leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                        Automate Your HR <br />
                        <span className="text-secondary  bg-clip-text bg-linear-to-r from-primary via-amber-400 to-amber-600">
                            Without the Chaos.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        GoHRIS empowers your people and simplifies your processes.
                        The most intuitive platform for modern payroll, attendance, and employee experience.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                        <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-2xl shadow-primary/30 group">
                            <Link href="/auth/register" className="flex items-center gap-2">
                                Start Free Trial
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                        <Button variant="outline" size="lg" className="h-14 px-8 rounded-full text-lg shadow-2xl shadow-primary/30 group border-secondary text-secondary">
                            <Link href="/auth/login" className="flex items-center gap-2">
                                Login
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </Button>
                    </div>


                    {/* Social Proof Mini
                    <div className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                        {[
                            "Instant Payroll Setup",
                            "Biometric Integration",
                            "AI-Powered Insights"
                        ].map((text) => (
                            <div key={text} className="flex items-center gap-2 text-sm font-medium text-muted-foreground/80">
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                                {text}
                            </div>
                        ))}
                    </div> */}
                </div>

                {/* Hero Visual Block */}
                <div className="mt-20 relative animate-in fade-in zoom-in-95 duration-1000 delay-1000">
                    <div className="absolute inset-0 bg-primary/20 blur-[100px] -z-10 scale-90 opacity-50" />
                    <div className="rounded-2xl border border-border bg-card/50 backdrop-blur-xl shadow-3xl p-2 md:p-4 overflow-hidden group">
                        <div className="aspect-video bg-muted rounded-xl relative overflow-hidden">
                            {/* Placeholder for dashboard mockup - visually appealing */}
                            <div className="absolute inset-0 bg-linear-to-br from-slate-900 via-slate-800 to-primary/20 flex items-center justify-center overflow-hidden">
                                <div className="grid grid-cols-4 gap-4 w-[120%] h-[120%] opacity-20 -rotate-12 translate-x-[-10%]">
                                    {Array.from({ length: 16 }).map((_, i) => (
                                        <div key={i} className="bg-white/10 rounded-lg p-4 border border-white/10 flex flex-col gap-2">
                                            <div className="w-1/2 h-4 bg-white/20 rounded" />
                                            <div className="w-full h-2 bg-white/10 rounded" />
                                            <div className="w-3/4 h-2 bg-white/10 rounded" />
                                            <div className="mt-auto h-20 bg-primary/20 rounded-md" />
                                        </div>
                                    ))}
                                </div>
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-linear-to-t from-slate-900 via-slate-900/40 to-transparent">
                                    <p className="font-display text-4xl font-bold text-white mb-2">Beautiful Dashboard</p>
                                    <p className="text-white/60">Optimized for speed and efficiency.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
