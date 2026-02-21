"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Plus,
    LayoutDashboard
} from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Logo } from "../shared/logo";

export function LandingNavbar() {
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b border-transparent",
                isScrolled
                    ? "bg-background/80 backdrop-blur-md border-border py-4"
                    : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto px-6 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 group">
                    {/* <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:rotate-12 transition-transform duration-300 shadow-xl shadow-primary/20">
                        <LayoutDashboard className="text-primary-foreground w-6 h-6" />
                    </div>
                    <span className="font-display text-2xl font-bold tracking-tight">
                        Go<span className="text-primary">HRIS</span>
                    </span> */}
                    <Logo />
                </Link>

                <div className="hidden md:flex items-center gap-8">
                    <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</Link>
                    <Link href="#solutions" className="text-sm font-medium hover:text-primary transition-colors">Solutions</Link>
                    <Link href="#pricing" className="text-sm font-medium hover:text-primary transition-colors">Pricing</Link>
                </div>

                <div className="flex items-center gap-4">
                    <Button variant="outline" asChild className="hidden sm:inline-flex rounded-full px-6">
                        <Link href="/login">Login</Link>
                    </Button>
                    <Button className="rounded-full px-6 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
                        <Link href="/register-company">Start Free Trial</Link>
                    </Button>
                </div>
            </div>
        </nav>
    );
}
