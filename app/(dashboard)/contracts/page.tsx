import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileCheck, Clock, DollarSign } from "lucide-react";

export default function ContractsPage() {
  return (
    <div className="container px-4 md:px-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
        <p className="text-muted-foreground">
          Manage your active contracts and track milestones
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>E-commerce Website Development</CardTitle>
            <Badge variant="secondary">In Progress</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileCheck className="h-5 w-5 text-green-500" />
                  <span>Contract Value: $5,000</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Due: Apr 30, 2024</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>60%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full">
                  <div className="h-full w-[60%] bg-primary rounded-full" />
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold">Current Milestone</h4>
                <div className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Frontend Development</p>
                      <p className="text-sm text-muted-foreground">
                        Build user interface components
                      </p>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <DollarSign className="h-4 w-4" />
                      Request Payment
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}