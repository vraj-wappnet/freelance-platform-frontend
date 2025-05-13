"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RootState } from "@/lib/store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ApiService from "@/lib/api.service";
import { Edit, Trash2 } from "lucide-react"; // Import icons

// Project interface (unchanged from previous response)
export interface Project {
  id: string;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  status: "open" | "in-progress" | "completed" | "cancelled";
  skills: string[];
  attachments: string;
  client_id: string;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    user_id: string;
    firstName: string;
    lastName: string;
  };
}

interface MessageResponse {
  message: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    client_id: "",
    status: "",
    budget: "",
    deadline: "",
    skills: "",
    attachments: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await ApiService.get<Project[]>("/projects");
        setProjects(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch projects");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchProjects();
    }
  }, [user]);

  // Open edit modal
  const handleEdit = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      client_id: project.client_id,
      status: project.status,
      budget: project.budget.toString(),
      deadline: project.deadline.split("T")[0],
      skills: project.skills.join(", "),
      attachments: project.attachments,
    });
    setIsEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle status selection
  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
  };

  // Update project
  const handleUpdate = async () => {
    if (!selectedProject) return;
    try {
      const response = await ApiService.patch<Project, typeof formData>(
        `/projects/${selectedProject.id}`,
        {
          ...formData,
          budget: parseFloat(formData.budget),
          skills: formData.skills.split(",").map((s) => s.trim()),
        }
      );
      setProjects(
        projects.map((p) => (p.id === selectedProject.id ? response.data : p))
      );
      setIsEditModalOpen(false);
      setSelectedProject(null);
    } catch (err: any) {
      setError(err.message || "Failed to update project");
    }
  };

  // Delete project
  const handleDelete = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete ${project.title}?`)) return;
    try {
      await ApiService.delete<MessageResponse>(`/projects/${project.id}`);
      setProjects(projects.filter((p) => p.id !== project.id));
    } catch (err: any) {
      setError(err.message || "Failed to delete project");
    }
  };

  // View project details
  const handleViewDetails = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  if (!user) {
    return null; // Redirect will handle this
  }

  const isAdmin = user.role === "admin";

  return (
    <DashboardLayout userRole={user.role}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Projects</h1>

        {isLoading && <p>Loading projects...</p>}
        {error && <p className="text-red-500">{error}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{project.title}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">{project.description}</p>
              <p className="text-sm text-gray-500 mb-1">
                Client: {project.client.firstName} {project.client.lastName}
              </p>
              <p className="text-sm text-gray-500 mb-1">Status: {project.status}</p>
              <p className="text-sm text-gray-500 mb-1">Budget: ${project.budget}</p>
              <p className="text-sm text-gray-500 mb-3">
                Deadline: {new Date(project.deadline).toLocaleDateString()}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {project.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="flex-1 min-w-[100px]"
                  onClick={() => handleViewDetails(project.id)}
                >
                  View Details
                </Button>
                {isAdmin && (
                  <>
                    <Button
                      variant="default"
                      className="flex-1 min-w-[100px] bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleEdit(project)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 min-w-[100px] bg-red-600 hover:bg-red-700"
                      onClick={() => handleDelete(project)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal (unchanged) */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="client_id">Client ID</Label>
                <Input
                  id="client_id"
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  name="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  name="skills"
                  value={formData.skills}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="attachments">Attachments URL</Label>
                <Input
                  id="attachments"
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleUpdate}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}