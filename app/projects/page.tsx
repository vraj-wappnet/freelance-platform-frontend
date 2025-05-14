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
import { Edit, Trash2, Plus } from "lucide-react";

// Project interface (matches API response)
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
    email: string;
    role: string;
    profilePicture: string | null;
    bio: string | null;
    location: string | null;
    phone: string | null;
    website: string | null;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

interface MessageResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

interface User {
  id: string;
  user_id: string;
  role: "admin" | "client";
}

export default function ProjectsPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user) as User | null;
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
    skills: "",
    attachments: "",
    status: "open" as Project["status"],
  });
  const [formError, setFormError] = useState<string | null>(null);

  // UUID validation regex
  const isValidUuid = (id: string) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      console.log("User:", user); // Debug user object
    }
  }, [user, router]);

  // Fetch projects based on user role
  useEffect(() => {
    const fetchProjects = async () => {
      if (!user?.id || !user?.role) {
        setError("User data is missing");
        return;
      }
      if (user.role === "client" && !isValidUuid(user.id)) {
        setError("Invalid user ID format");
        return;
      }
      setIsLoading(true);
      try {
        let response;
        if (user.role === "admin") {
          response = await ApiService.get<Project[]>("/projects");
          console.log("Admin projects response:", response.data);
          setProjects(Array.isArray(response.data) ? response.data : []);
        } else if (user.role === "client") {
          response = await ApiService.get<Project | Project[]>(`/projects/user/${user.id}`);
          console.log("Client projects response:", response.data);
          setProjects(
            Array.isArray(response.data)
              ? response.data
              : response.data
              ? [response.data]
              : []
          );
        }
        setError(null);
      } catch (err: any) {
        console.error("Fetch projects error:", err, "Response:", err.response?.data);
        const message = err.response?.data?.message;
        setError(
          Array.isArray(message)
            ? message.join(", ")
            : message || `Failed to fetch projects for ${user.role}`
        );
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
      title: project.title || "",
      description: project.description || "",
      budget: project.budget?.toString() || "",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
      skills: project.skills?.join(", ") || "",
      attachments: project.attachments || "",
      status: project.status || "open",
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  // Open create modal
  const handleOpenCreateModal = () => {
    setFormData({
      title: "",
      description: "",
      budget: "",
      deadline: "",
      skills: "",
      attachments: "",
      status: "open",
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle status selection
  const handleStatusChange = (value: Project["status"]) => {
    setFormData({ ...formData, status: value });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) return "Title is required";
    if (!formData.description.trim()) return "Description is required";
    if (!formData.budget || isNaN(parseFloat(formData.budget))) return "Valid budget is required";
    if (!formData.deadline) return "Deadline is required";
    return null;
  };

  // Create project
  const handleCreate = async () => {
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline,
        skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        attachments: formData.attachments || "",
      };
      console.log("Create project payload:", payload);
      const response = await ApiService.post<Project, typeof payload>("/projects", payload);
      console.log("Create project response:", response.data);
      setProjects([...projects, response.data]);
      setIsCreateModalOpen(false);
      setFormError(null);
    } catch (err: any) {
      console.error("Create project error:", err, "Response:", err.response?.data);
      const message = err.response?.data?.message;
      setFormError(
        Array.isArray(message) ? message.join(", ") : message || "Failed to create project"
      );
    }
  };

  // Update project
  const handleUpdate = async () => {
    if (!selectedProject?.id) return;
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline,
        skills: formData.skills ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean) : [],
        attachments: formData.attachments || "",
        status: formData.status,
      };
      console.log("Update project payload:", payload);
      const response = await ApiService.patch<Project, typeof payload>(
        `/projects/${selectedProject.id}`,
        payload
      );
      console.log("Update project response:", response.data);
      setProjects(
        projects.map((p) => (p.id === selectedProject.id ? response.data : p))
      );
      setIsEditModalOpen(false);
      setSelectedProject(null);
      setFormError(null);
    } catch (err: any) {
      console.error("Update project error:", err, "Response:", err.response?.data);
      const message = err.response?.data?.message;
      setFormError(
        Array.isArray(message) ? message.join(", ") : message || "Failed to update project"
      );
    }
  };

  // Delete project
  const handleDelete = async (project: Project) => {
    if (!project.id) return;
    if (!window.confirm(`Are you sure you want to delete ${project.title}?`)) return;
    try {
      await ApiService.delete<MessageResponse>(`/projects/${project.id}`);
      setProjects(projects.filter((p) => p.id !== project.id));
      setError(null);
    } catch (err: any) {
      console.error("Delete project error:", err, "Response:", err.response?.data);
      const message = err.response?.data?.message;
      setError(
        Array.isArray(message) ? message.join(", ") : message || "Failed to delete project"
      );
    }
  };

  // View project details
  const handleViewDetails = (projectId: string) => {
    if (projectId) {
      router.push(`/projects/${projectId}`);
    }
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";
  const isClient = user.role === "client";

  return (
    <DashboardLayout userRole={user.role}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
          {isClient && (
            <Button
              variant="default"
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleOpenCreateModal}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          )}
        </div>

        {isLoading && <p>Loading projects...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && projects.length === 0 && (
          <p>{isClient ? "You have no projects yet." : "No projects found."}</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
              <h2 className="text-xl font-semibold mb-2">{project.title || "Untitled"}</h2>
              <p className="text-gray-600 mb-2 line-clamp-2">{project.description || "No description"}</p>
              <p className="text-sm text-gray-500 mb-1">
                Client: {project.client ? `${project.client.firstName} ${project.client.lastName}` : "Unknown"}
              </p>
              <p className="text-sm text-gray-500 mb-1">Status: {project.status || "Unknown"}</p>
              <p className="text-sm text-gray-500 mb-1">Budget: ${project.budget || 0}</p>
              <p className="text-sm text-gray-500 mb-3">
                Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString() : "N/A"}
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {project.skills?.length ? (
                  project.skills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-block bg-gray-100 rounded-full px-3 py-1 text-sm font-semibold text-gray-700"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">No skills specified</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="flex-1 min-w-[100px]"
                  onClick={() => handleViewDetails(project.id)}
                >
                  View Details
                </Button>
                {(isAdmin || (isClient && project.client_id === user.id)) && (
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

        {/* Create Project Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
            </DialogHeader>
            {formError && <p className="text-red-500">{formError}</p>}
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Website Development"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Need a responsive website"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Need a responsive website"
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  name="budget"
                  type="number"
                  value={formData.budget}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000"
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
                  placeholder="e.g., React, Node.js, TypeScript"
                />
              </div>
              <div>
                <Label htmlFor="attachments">Attachments URL</Label>
                <Input
                  id="attachments"
                  name="attachments"
                  value={formData.attachments}
                  onChange={handleInputChange}
                  placeholder="e.g., https://example.com/attachments"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Project Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            {formError && <p className="text-red-500">{formError}</p>}
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