"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { Logo } from "../shared/logo";
import { Button } from "../ui/button";

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border pt-20 pb-10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <Logo />
            </Link>
            <p className="text-muted-foreground text-sm max-w-xs mb-8">
              The modern HR Operating System. Empowering teams with intuitive
              payroll and workforce management tools.
            </p>
            <div className="my-2 flex flex-wrap items-center gap-2">
              <Button size="sm" className="bg-black" asChild>
                <a
                  href="https://github.com/faidancode/go-hris"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <img
                    src="/github-white.svg"
                    alt="GitHub"
                    width={20}
                    height={20}
                  />
                  Backend (Go)
                </a>
              </Button>

              <Button size="sm" className="bg-black" asChild>
                <a
                  href="https://github.com/faidancode/next-go-hris"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <img
                    src="/github-white.svg"
                    alt="GitHub"
                    width={20}
                    height={20}
                  />
                  Frontend (Next.js)
                </a>
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-display font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link
                  href="#features"
                  className="hover:text-primary transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-display font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} GoHRIS Technologies Inc. All rights
            reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in
            Southeast Asia
          </div>
        </div>
      </div>
    </footer>
  );
}
