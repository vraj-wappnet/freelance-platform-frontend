import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { Briefcase, Users, FileCheck, DollarSign } from "lucide-react";

export function HeroSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center space-y-10 text-center">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
              Connect <span className="text-primary">Talent</span> With
              <span className="text-primary"> Opportunity</span>
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              The premier platform for freelancers and clients to collaborate on projects with our secure, multi-stage contract system.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button asChild size="lg" className="gap-1">
              <Link href="/register?type=client">
                <Briefcase className="mr-2 h-4 w-4" />
                Hire Talent
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-1">
              <Link href="/register?type=freelancer">
                <FileCheck className="mr-2 h-4 w-4" />
                Find Work
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Post Projects</h3>
              <p className="text-center text-sm text-muted-foreground">
                Create detailed project listings to attract the perfect talent for your needs.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Find Talent</h3>
              <p className="text-center text-sm text-muted-foreground">
                Browse qualified freelancers with verified skills and experience.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Secure Contracts</h3>
              <p className="text-center text-sm text-muted-foreground">
                Work confidently with our multi-stage contract system with milestone tracking.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 border rounded-lg p-4">
              <div className="rounded-full bg-primary/10 p-2">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Easy Payments</h3>
              <p className="text-center text-sm text-muted-foreground">
                Manage project finances with secure milestone-based payments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}