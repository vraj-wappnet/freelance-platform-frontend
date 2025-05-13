import React from "react";
import { ClipboardList, Users, FileCheck, CreditCard } from "lucide-react";

const steps = [
  {
    title: "Post a Project",
    description: "Create a detailed project listing with requirements, budget, and timeline.",
    icon: <ClipboardList className="h-8 w-8" />,
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400",
  },
  {
    title: "Review Proposals",
    description: "Receive bids from qualified freelancers and select the best fit for your project.",
    icon: <Users className="h-8 w-8" />,
    color: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400",
  },
  {
    title: "Contract & Milestones",
    description: "Set up a secure contract with clear milestones and deliverables.",
    icon: <FileCheck className="h-8 w-8" />,
    color: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400",
  },
  {
    title: "Payment & Review",
    description: "Release payments for completed milestones and provide feedback.",
    icon: <CreditCard className="h-8 w-8" />,
    color: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
              How It Works
            </h2>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
              Our platform streamlines the freelance process from start to finish.
            </p>
          </div>
        </div>
        
        <div className="relative mt-16">
          {/* Process line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-border md:block" />
          
          <div className="grid gap-12 md:grid-cols-2">
            {steps.map((step, i) => (
              <div key={i} className={`relative ${i % 2 === 0 ? "md:text-right md:pr-12" : "md:pl-12 md:translate-y-24"}`}>
                {/* Circle on the timeline */}
                <div className="absolute top-6 hidden h-6 w-6 rounded-full border-4 border-background bg-primary md:block"
                     style={{ right: i % 2 === 0 ? "-15px" : "auto", left: i % 2 === 1 ? "-15px" : "auto" }} />
                
                <div className="rounded-xl border p-6">
                  <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full ${step.color}`}>
                    {step.icon}
                  </div>
                  <h3 className="mb-2 text-2xl font-bold">Step {i + 1}: {step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}