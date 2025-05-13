"use client";

import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  CircleDollarSign,
  Briefcase,
  Users,
  Clock,
  ArrowRight,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { RootState } from "@/lib/store";
import { User, Project, Notification } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Static placeholder data for projects and notifications
  const projects: Project[] = [
    {
      id: "1",
      title: "Website Redesign",
      budget: { min: 1000, max: 2000 },
      status: "open",
    },
    {
      id: "2",
      title: "Mobile App Development",
      budget: { min: 5000, max: 8000 },
      status: "in-progress",
    },
    {
      id: "3",
      title: "Logo Creation",
      budget: { min: 500, max: 1000 },
      status: "completed",
    },
  ];

  const notifications: Notification[] = [
    {
      id: "1",
      userId: user?.id || "user1",
      message: "New project proposal received",
      createdAt: "2025-05-12T10:00:00Z",
    },
    {
      id: "2",
      userId: user?.id || "user1",
      message: "Milestone completed for Mobile App",
      createdAt: "2025-05-11T15:30:00Z",
    },
  ];

  // Chart data (static)
  const earningsData = [
    { name: "Jan", amount: 1200 },
    { name: "Feb", amount: 900 },
    { name: "Mar", amount: 1500 },
    { name: "Apr", amount: 2100 },
    { name: "May", amount: 1800 },
    { name: "Jun", amount: 2400 },
  ];

  const projectStatusData = [
    { name: "Open", value: projects.filter((p) => p.status === "open").length },
    {
      name: "In Progress",
      value: projects.filter((p) => p.status === "in-progress").length,
    },
    {
      name: "Completed",
      value: projects.filter((p) => p.status === "completed").length,
    },
  ];

  const COLORS = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
  ];

  if (!user) {
    return null; // Redirect will handle this
  }

  return (
    <DashboardLayout userRole={user.role || "client"}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user.firstName}! Here is an overview of your projects
            and activities.
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Projects
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter((p) => p.status !== "completed").length}
              </div>
              <p className="text-xs text-muted-foreground">
                +2 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12,580</div>
              <p className="text-xs text-muted-foreground">
                +18.2% from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Contracts
              </CardTitle>
              <FileCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                +1 from last month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Hired Freelancers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">
                +3 from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={earningsData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-[300px] items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={projectStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                      label={({
                        cx,
                        cy,
                        midAngle,
                        innerRadius,
                        outerRadius,
                        value,
                        index,
                      }) => {
                        const RADIAN = Math.PI / 180;
                        const radius =
                          25 + innerRadius + (outerRadius - innerRadius);
                        const x = cx + radius * Math.cos(-midAngle * RADIAN);
                        const y = cy + radius * Math.sin(-midAngle * RADIAN);
                        return (
                          <text
                            x={x}
                            y={y}
                            fill={COLORS[index % COLORS.length]}
                            textAnchor={x > cx ? "start" : "end"}
                            dominantBaseline="central"
                          >
                            {projectStatusData[index].name} ({value})
                          </text>
                        );
                      }}
                    >
                      {projectStatusData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity and projects */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Projects</CardTitle>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.slice(0, 3).map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{project.title}</div>
                      <div className="text-sm text-muted-foreground">
                        Budget: ${project.budget.min} - ${project.budget.max}
                      </div>
                    </div>
                    <Badge
                      variant={
                        project.status === "open"
                          ? "default"
                          : project.status === "in-progress"
                          ? "secondary"
                          : project.status === "completed"
                          ? "outline"
                          : "outline"
                      }
                    >
                      {project.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Milestones</CardTitle>
              <Link href="/contracts">
                <Button variant="ghost" size="sm" className="gap-1">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                      <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">Frontend Development</div>
                      <div className="text-sm text-muted-foreground">
                        E-commerce Website
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Due in 5 days
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                      <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">Database Setup</div>
                      <div className="text-sm text-muted-foreground">
                        CRM Application
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Due in 2 days
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center space-x-3">
                    <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
                      <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-1">
                      <div className="font-medium">Logo Design</div>
                      <div className="text-sm text-muted-foreground">
                        Branding Project
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">Due today</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
