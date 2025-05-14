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
import { Plus, Edit, Trash2, Eye } from "lucide-react";

// Contract interface
export interface Contract {
  id: string;
  amount: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  clientAccepted: boolean;
  freelancerAccepted: boolean;
  project_id: string;
  freelancer_id: string;
  client_id: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
  };
  freelancer: {
    id: string;
    user_id: string;
    firstName: string;
    lastName: string;
  };
  client: {
    id: string;
    user_id: string;
    firstName: string;
    lastName: string;
  };
}

// Project interface (minimal for dropdown)
export interface Project {
  id: string;
  title: string;
  status?: string;
}

// Freelancer interface (minimal for dropdown)
export interface Freelancer {
  id: string;
  user_id: string;
  firstName: string;
  lastName: string;
}

interface MessageResponse {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

interface User {
  id: string;
  user_id: string;
  role: "admin" | "client" | "freelancer";
}

export default function ContractsPage() {
  const router = useRouter();
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [freelancers, setFreelancers] = useState<Freelancer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(
    null
  );
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    startDate: "",
    endDate: "",
    project_id: "",
    freelancer_id: "",
    freelancerAccepted: "No",
  });
  const [formError, setFormError] = useState<string | null>(null);

  const isValidUuid = (id: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  useEffect(() => {
    if (!user) {
      router.push("/login");
    } else {
      console.log("User:", user);
    }
  }, [user, router]);

  useEffect(() => {
    const fetchContracts = async () => {
      if (!user?.id || !user?.role) {
        setError("User data is missing");
        return;
      }
      if (
        (user.role === "freelancer" || user.role === "client") &&
        !isValidUuid(user.id)
      ) {
        setError("Invalid user ID format");
        return;
      }
      setIsLoading(true);
      try {
        let response;
        if (user.role === "admin") {
          response = await ApiService.get<Contract[]>("/contracts");
          console.log("Admin contracts response:", response.data);
          setContracts(Array.isArray(response.data) ? response.data : []);
        } else if (user.role === "freelancer" || user.role === "client") {
          response = await ApiService.get<Contract[]>("/contracts/user");
          console.log("User contracts response:", response.data);
          setContracts(Array.isArray(response.data) ? response.data : []);
        }
        setError(null);
      } catch (err: any) {
        console.error(
          "Fetch contracts error:",
          err,
          "Response:",
          err.response?.data
        );
        const message = err.response?.data?.message;
        setError(
          Array.isArray(message)
            ? message.join(", ")
            : message || `Failed to fetch contracts for ${user.role}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchProjects = async () => {
      if (user?.role !== "client") return;
      try {
        const response = await ApiService.get<Project[]>("/projects");
        console.log("Projects response:", response.data);
        const openProjects = Array.isArray(response.data)
          ? response.data.filter((p) => p.status === "open")
          : [];
        setProjects(openProjects);
      } catch (err: any) {
        console.error(
          "Fetch projects error:",
          err,
          "Response:",
          err.response?.data
        );
        setError("Failed to fetch projects for contracts");
      }
    };

    const fetchFreelancers = async () => {
      if (user?.role !== "client") return;
      try {
        const response = await ApiService.get<Freelancer[]>(
          "/users/freelancers"
        );
        console.log("Freelancers response:", response.data);
        setFreelancers(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        console.error(
          "Fetch freelancers error:",
          err,
          "Response:",
          err.response?.data
        );
        setError("Failed to fetch freelancers for contracts");
      }
    };

    if (user) {
      fetchContracts();
      fetchProjects();
      fetchFreelancers();
    }
  }, [user]);

  const handleOpenCreateModal = () => {
    setFormData({
      amount: "",
      description: "",
      startDate: "",
      endDate: "",
      project_id: "",
      freelancer_id: "",
      freelancerAccepted: "No",
    });
    setFormError(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setFormData({
      amount: contract.amount || "",
      description: contract.description || "",
      startDate: contract.startDate || "",
      endDate: contract.endDate || "",
      project_id: contract.project_id || "",
      freelancer_id: contract.freelancer_id || "",
      freelancerAccepted: contract.freelancerAccepted ? "Yes" : "No",
    });
    setFormError(null);
    setIsEditModalOpen(true);
  };

  const handleView = (contract: Contract) => {
    setSelectedContract(contract);
    setIsViewModalOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProjectChange = (value: string) => {
    setFormData({ ...formData, project_id: value });
  };

  const handleFreelancerChange = (value: string) => {
    setFormData({ ...formData, freelancer_id: value });
  };

  const handleFreelancerAcceptedChange = (value: string) => {
    setFormData({ ...formData, freelancerAccepted: value });
  };

  const handleAcceptChange = async (contract: Contract, value: string) => {
    if (!contract.id || !user) return;
    if (
      user.role === "freelancer" &&
      (!contract.freelancer?.user_id ||
        contract.freelancer.user_id !== user.user_id)
    ) {
      setError("You are not authorized to update this contract");
      return;
    }

    try {
      const payload = {
        freelancerAccepted: value === "Yes",
      };
      console.log("Update accept status payload:", payload);
      const response = await ApiService.patch<Contract, typeof payload>(
        `/contracts/${contract.id}`,
        payload
      );
      console.log("Update accept status response:", response.data);
      setContracts(
        contracts.map((c) => (c.id === contract.id ? response.data : c))
      );
      setError(null);
    } catch (err: any) {
      console.error(
        "Update accept status error:",
        err,
        "Full response:",
        err.response
      );
      const message =
        err.response?.data?.message || err.response?.data?.error || err.message;
      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to update accept status"
      );
    }
  };

  const validateForm = (isUpdate: boolean = false) => {
    if (!isUpdate && (!formData.amount || isNaN(parseFloat(formData.amount))))
      return "Valid amount is required";
    if (!isUpdate && !formData.description.trim())
      return "Description is required";
    if (!isUpdate && !formData.startDate) return "Start date is required";
    if (!isUpdate && !formData.endDate) return "End date is required";
    if (!isUpdate && !formData.project_id)
      return "Project selection is required";
    if (!isUpdate && !formData.freelancer_id)
      return "Freelancer selection is required";
    return null;
  };

  

  const handleUpdate = async () => {
    if (!selectedContract?.id) return;
    const validationError = validateForm(true);
    if (validationError && user?.role !== "freelancer") {
      setFormError(validationError);
      return;
    }

    if (
      user?.role === "freelancer" &&
      (!selectedContract.freelancer?.user_id ||
        selectedContract.freelancer.user_id !== user.user_id)
    ) {
      setFormError("You are not authorized to update this contract");
      return;
    }

    try {
      let payload: {
        amount?: number;
        description?: string;
        startDate?: string;
        endDate?: string;
        freelancerAccepted?: boolean;
      } = {};

      if (user?.role === "freelancer") {
        payload = {
          freelancerAccepted: formData.freelancerAccepted === "Yes",
        };
      } else {
        payload = {
          amount: parseFloat(formData.amount),
          description: formData.description,
          startDate: formData.startDate,
          endDate: formData.endDate,
        };
      }

      console.log("Update contract payload:", payload);
      const response = await ApiService.patch<Contract, typeof payload>(
        `/contracts/${selectedContract.id}`,
        payload
      );
      console.log("Update contract response:", response.data);
      setContracts(
        contracts.map((c) => (c.id === selectedContract.id ? response.data : c))
      );
      setIsEditModalOpen(false);
      setSelectedContract(null);
      setFormError(null);
    } catch (err: any) {
      console.error(
        "Update contract error:",
        err,
        "Full response:",
        err.response
      );
      const message =
        err.response?.data?.message || err.response?.data?.error || err.message;
      setFormError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to update contract"
      );
    }
  };

  const handleDelete = async (contract: Contract) => {
    if (!contract.id) return;
    if (
      !window.confirm(
        `Are you sure you want to delete this contract for ${contract.project?.title}?`
      )
    )
      return;
    try {
      await ApiService.delete<MessageResponse>(`/contracts/${contract.id}`);
      setContracts(contracts.filter((c) => c.id !== contract.id));
      setError(null);
    } catch (err: any) {
      console.error(
        "Delete contract error:",
        err,
        "Response:",
        err.response?.data
      );
      const message = err.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to delete contract"
      );
    }
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";
  const isClient = user.role === "client";
  const isFreelancer = user.role === "freelancer";

  return (
    <DashboardLayout userRole={user.role}>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Contracts</h1>
       
        </div>

        {isLoading && <p>Loading contracts...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && contracts.length === 0 && (
          <p>
            {isFreelancer || isClient
              ? "You have no contracts yet."
              : "No contracts found."}
          </p>
        )}

        {contracts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                    Project
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                    Freelancer
                  </th>
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                    Amount
                  </th>
                  {isFreelancer && (
                    <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                      Freelancer Accepted
                    </th>
                  )}
                  <th className="border border-gray-200 px-4 py-2 text-left text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {contracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2 text-sm">
                      {contract.project?.title || "Unknown Project"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm">
                      {contract.freelancer
                        ? `${contract.freelancer.firstName} ${contract.freelancer.lastName}`
                        : "Unknown"}
                    </td>
                    <td className="border border-gray-200 px-4 py-2 text-sm">
                      ${contract.amount || "0.00"}
                    </td>
                    {isFreelancer && (
                      <td className="border border-gray-200 px-4 py-2 text-sm">
                        {contract.freelancer?.user_id === user.user_id ? (
                          <Select
                            value={contract.freelancerAccepted ? "Yes" : "No"}
                            onValueChange={(value) =>
                              handleAcceptChange(contract, value)
                            }
                          >
                            <SelectTrigger className="w-[100px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Yes">Yes</SelectItem>
                              <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span>
                            {contract.freelancerAccepted ? "Yes" : "No"}
                          </span>
                        )}
                      </td>
                    )}
                    <td className="border border-gray-200 px-4 py-2 text-sm">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleView(contract)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        {(isAdmin ||
                          (isClient && contract.client_id === user.id) ||
                          (isFreelancer &&
                            contract.freelancer_id === user.id)) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(contract)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Update
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(contract)}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent>
            
            {formError && <p className="text-red-500">{formError}</p>}
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="e.g., 1000.00"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Development of a responsive website..."
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="project_id">Project</Label>
                <Select
                  value={formData.project_id}
                  onValueChange={handleProjectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="freelancer_id">Freelancer</Label>
                <Select
                  value={formData.freelancer_id}
                  onValueChange={handleFreelancerChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a freelancer" />
                  </SelectTrigger>
                  <SelectContent>
                    {freelancers.map((freelancer) => (
                      <SelectItem key={freelancer.id} value={freelancer.id}>
                        {freelancer.firstName} {freelancer.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Contract</DialogTitle>
            </DialogHeader>
            {formError && <p className="text-red-500">{formError}</p>}
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  disabled={isFreelancer}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  disabled={isFreelancer}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  disabled={isFreelancer}
                />
              </div>
              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  disabled={isFreelancer}
                />
              </div>
              <div>
                <Label htmlFor="project_id">Project</Label>
                <Input
                  id="project_id"
                  value={selectedContract?.project?.title || "Unknown Project"}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="freelancer_id">Freelancer</Label>
                <Input
                  id="freelancer_id"
                  value={
                    selectedContract?.freelancer
                      ? `${selectedContract.freelancer.firstName} ${selectedContract.freelancer.lastName}`
                      : "Unknown Freelancer"
                  }
                  disabled
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

        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-2xl p-4 sm:p-6">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl font-bold">
                Contract Details
              </DialogTitle>
            </DialogHeader>
            {selectedContract && (
              <div className="max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Contract ID
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600 break-all">
                      {selectedContract.id}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Project
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.project?.title || "Unknown Project"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Freelancer
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.freelancer
                        ? `${selectedContract.freelancer.firstName} ${selectedContract.freelancer.lastName} (${selectedContract.freelancer.user_id})`
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Client
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.client
                        ? `${selectedContract.client.firstName} ${selectedContract.client.lastName} (${selectedContract.client.user_id})`
                        : "Unknown"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Amount
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      ${selectedContract.amount || "0.00"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Description
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.description || "No description"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Status
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.status || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Client Accepted
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.clientAccepted ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Freelancer Accepted
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.freelancerAccepted ? "Yes" : "No"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Start Date
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.startDate
                        ? new Date(
                            selectedContract.startDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      End Date
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.endDate
                        ? new Date(
                            selectedContract.endDate
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Created At
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.createdAt
                        ? new Date(selectedContract.createdAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="font-semibold text-sm sm:text-base">
                      Updated At
                    </Label>
                    <p className="text-sm sm:text-base text-gray-600">
                      {selectedContract.updatedAt
                        ? new Date(selectedContract.updatedAt).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="mt-4 sm:mt-6">
              <Button
                variant="outline"
                className="w-full sm:w-auto px-4 py-2 text-sm sm:text-base"
                onClick={() => setIsViewModalOpen(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
