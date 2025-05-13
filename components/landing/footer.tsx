import React from "react";
import Link from "next/link";
import { BriefcaseBusiness, Facebook, Twitter, Instagram, Linkedin, Youtube } from "lucide-react";

const footerLinks = [
  {
    title: "For Clients",
    links: [
      { title: "How to Hire", href: "/how-to-hire" },
      { title: "Payment Protection", href: "/payment-protection" },
      { title: "Enterprise Solutions", href: "/enterprise" },
      { title: "Success Stories", href: "/success-stories" },
    ],
  },
  {
    title: "For Freelancers",
    links: [
      { title: "Create Profile", href: "/register?type=freelancer" },
      { title: "Skill Assessments", href: "/skills" },
      { title: "Community", href: "/community" },
      { title: "Resources", href: "/resources" },
    ],
  },
  {
    title: "Resources",
    links: [
      { title: "Blog", href: "/blog" },
      { title: "Contract Templates", href: "/templates" },
      { title: "Pricing Calculator", href: "/calculator" },
      { title: "FAQ", href: "/faq" },
      { title: "Help Center", href: "/help" },
    ],
  },
  {
    title: "Company",
    links: [
      { title: "About Us", href: "/about" },
      { title: "Careers", href: "/careers" },
      { title: "Press", href: "/press" },
      { title: "Contact Us", href: "/contact" },
      { title: "Trust & Safety", href: "/trust" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-muted">
      <div className="container px-4 pt-12 pb-8 md:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2">
              <BriefcaseBusiness className="h-6 w-6 text-primary" />
              <div className="font-bold text-xl">ConnectLance</div>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Connecting talented freelancers with clients worldwide through our secure, transparent platform.
            </p>
            <div className="mt-6 flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Link>
            </div>
          </div>
          
          {footerLinks.map((column, i) => (
            <div key={i}>
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link, j) => (
                  <li key={j}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ConnectLance. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">
                Cookie Policy
              </Link>
              <Link href="/sitemap" className="text-sm text-muted-foreground hover:text-foreground">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}