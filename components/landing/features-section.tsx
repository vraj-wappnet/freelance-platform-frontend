import React from "react";
import Image from "next/image";
import { CheckCircle2, Shield, Clock, BarChart4 } from "lucide-react";

export function FeaturesSection() {
  return (
    <section className="py-12 bg-accent/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              Why Choose ConnectLance
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              A Better Way to Collaborate
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our platform provides powerful tools for both clients and freelancers.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:gap-12">
          <div className="space-y-8">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Structured Contracts</h3>
              </div>
              <p className="text-muted-foreground">
                Our multi-stage contract system ensures clarity and protection for both parties, from proposal to final payment.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Secure Payments</h3>
              </div>
              <p className="text-muted-foreground">
                Milestone-based payments are held in escrow until work is approved, protecting both clients and freelancers.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Project Timeline Tracking</h3>
              </div>
              <p className="text-muted-foreground">
                Keep projects on schedule with our intuitive milestone tracker and deadline management system.
              </p>
            </div>
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2">
                <BarChart4 className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">Performance Analytics</h3>
              </div>
              <p className="text-muted-foreground">
                Track your success with detailed analytics on project completion, client satisfaction, and earnings.
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[450px] w-full overflow-hidden rounded-xl">
              <Image 
                src="https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Freelancers collaborating" 
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}