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
import { Plus, Edit, Trash2, FileText } from "lucide-react";

// Bid interface (updated to match API response)
export interface Bid {
  id: string;
  amount: string;
  deliveryTime: number;
  proposal: string;
  isShortlisted: boolean;
  freelancer_id: string;
  project_id: string;
  createdAt: string;
  updatedAt: string;
  hasContract?: boolean;
  freelancer: {
    id: string;
    user_id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "freelancer";
    profilePicture: string | null;
    bio: string;
    location: string;
    phone: string;
    website: string | null;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  project: {
    id: string;
    title: string;
    description: string;
    budget: string;
    deadline: string;
    status: string;
    skills: string[];
    attachments: string;
    createdAt: string;
    updatedAt: string;
    client: {
      id: string;
      user_id: string;
      firstName: string;
      lastName: string;
      email: string;
      role: "client";
      profilePicture: string | null;
      bio: string;
      location: string;
      phone: string;
      website: string | null;
      isActive: boolean;
      isVerified: boolean;
      createdAt: string;
      updatedAt: string;
    };
  };
}

// Contract interface
export interface Contract {
  id: string;
  amount: number;
  description: string;
  startDate: string;
  endDate: string;
  project_id: string;
  freelancer_id: string;
  client_id?: string;
  createdAt: string;
  updatedAt: string;
  project: {
    id: string;
    title: string;
  };
  freelancer: {
    id: string;
    name: string;
  };
}

// Project interface (minimal for dropdown)
export interface Project {
  id: string;
  title: string;
  status?: string;
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

export default function BidsPage() {
  const router = useRouter();
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;
  const [bids, setBids] = useState<Bid[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateBidModalOpen, setIsCreateBidModalOpen] = useState(false);
  const [isEditBidModalOpen, setIsEditBidModalOpen] = useState(false);
  const [isCreateContractModalOpen, setIsCreateContractModalOpen] =
    useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [bidFormData, setBidFormData] = useState({
    amount: "",
    deliveryTime: "",
    proposal: "",
    project_id: "",
  });
  const [contractFormData, setContractFormData] = useState({
    amount: "",
    description: "",
    startDate: "",
    endDate: "",
    project_id: "",
    freelancer_id: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // UUID validation regex
  const isValidUuid = (id: string) => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Fetch bids and contracts based on user role
  useEffect(() => {
    const fetchBidsWithContracts = async () => {
      if (!user?.id || !user?.role || !user?.user_id) {
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
          response = await ApiService.get<Bid[]>("/bids");
          const bidsWithContractStatus = await Promise.all(
            response.data.map(async (bid) => {
              try {
                const contractResponse = await ApiService.get<Contract[]>(
                  `/contracts?project_id=${bid.project_id}&freelancer_id=${bid.freelancer_id}`
                );
                return {
                  ...bid,
                  hasContract: contractResponse.data.length > 0,
                };
              } catch {
                return { ...bid, hasContract: false };
              }
            })
          );
          setBids(bidsWithContractStatus);
        } else if (user.role === "freelancer" || user.role === "client") {
          response = await ApiService.get<Bid[]>("/bids/user");
          const bidsWithContractStatus = await Promise.all(
            response.data.map(async (bid) => {
              try {
                const contractResponse = await ApiService.get<Contract[]>(
                  `/contracts?project_id=${bid.project_id}&freelancer_id=${bid.freelancer_id}`
                );
                return {
                  ...bid,
                  hasContract: contractResponse.data.length > 0,
                };
              } catch {
                return { ...bid, hasContract: false };
              }
            })
          );
          setBids(bidsWithContractStatus);
        }
        setError(null);
      } catch (err: any) {
        console.error(
          "Fetch bids error:",
          err,
          "Response:",
          err.response?.data
        );
        const message = err.response?.data?.message;
        setError(
          Array.isArray(message)
            ? message.join(", ")
            : message || `Failed to fetch bids for ${user.role}`
        );
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFreelancerProjects = async () => {
      if (user?.role !== "freelancer") return;
      try {
        const response = await ApiService.get<Project[]>("/projects");
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
        setError("Failed to fetch projects for bidding");
      }
    };

    if (user) {
      fetchBidsWithContracts();
      fetchFreelancerProjects();
    }
  }, [user]);

  // Open create bid modal
  const handleOpenCreateBidModal = () => {
    setBidFormData({
      amount: "",
      deliveryTime: "",
      proposal: "",
      project_id: "",
    });
    setFormError(null);
    setIsCreateBidModalOpen(true);
  };

  // Open edit bid modal
  const handleEditBid = (bid: Bid) => {
    setSelectedBid(bid);
    setBidFormData({
      amount: bid.amount.toString() || "",
      deliveryTime: bid.deliveryTime.toString() || "",
      proposal: bid.proposal || "",
      project_id: bid.project_id || "",
    });
    setFormError(null);
    setIsEditBidModalOpen(true);
  };

  // Open create contract modal
  const handleOpenCreateContractModal = (bid: Bid) => {
    setSelectedBid(bid);
    setContractFormData({
      amount: bid.amount.toString() || "",
      description: "",
      startDate: "",
      endDate: "",
      project_id: bid.project_id || "",
      freelancer_id: bid.freelancer_id || "",
    });
    setFormError(null);
    setIsCreateContractModalOpen(true);
  };

  // Handle bid form input changes
  const handleBidInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setBidFormData({ ...bidFormData, [e.target.name]: e.target.value });
  };

  // Handle contract form input changes
  const handleContractInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContractFormData({
      ...contractFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle bid project selection
  const handleBidProjectChange = (value: string) => {
    setBidFormData({ ...bidFormData, project_id: value });
  };

  // Validate bid form
  const validateBidForm = (isUpdate: boolean = false) => {
    if (!bidFormData.amount || isNaN(parseFloat(bidFormData.amount)))
      return "Valid amount is required";
    if (!bidFormData.deliveryTime || isNaN(parseInt(bidFormData.deliveryTime)))
      return "Valid delivery time (days) is required";
    if (!bidFormData.proposal.trim()) return "Proposal is required";
    if (!isUpdate && !bidFormData.project_id)
      return "Project selection is required";
    return null;
  };

  // Validate contract form
  const validateContractForm = () => {
    if (!contractFormData.amount || isNaN(parseFloat(contractFormData.amount)))
      return "Valid amount is required";
    if (!contractFormData.description.trim()) return "Description is required";
    if (!contractFormData.startDate) return "Start date is required";
    if (!contractFormData.endDate) return "End date is required";
    if (!contractFormData.project_id) return "Project ID is required";
    if (!contractFormData.freelancer_id) return "Freelancer ID is required";
    return null;
  };

  // Create bid
  const handleCreateBid = async () => {
    const validationError = validateBidForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const payload = {
        amount: parseFloat(bidFormData.amount),
        deliveryTime: parseInt(bidFormData.deliveryTime),
        proposal: bidFormData.proposal,
        project_id: bidFormData.project_id,
      };
      const response = await ApiService.post<Bid, typeof payload>(
        "/bids",
        payload
      );
      setBids([...bids, { ...response.data, hasContract: false }]);
      setIsCreateBidModalOpen(false);
      setFormError(null);
    } catch (err: any) {
      console.error("Create bid error:", err, "Response:", err.response?.data);
      const message = err.response?.data?.message;
      setFormError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to create bid"
      );
    }
  };

  // Update bid
  const handleUpdateBid = async () => {
    if (!selectedBid?.id) return;
    const validationError = validateBidForm(true);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const payload = {
        amount: parseFloat(bidFormData.amount),
        deliveryTime: parseInt(bidFormData.deliveryTime),
        proposal: bidFormData.proposal,
      };
      const response = await ApiService.patch<Bid, typeof payload>(
        `/bids/${selectedBid.id}`,
        payload
      );
      setBids(
        bids.map((b) =>
          b.id === selectedBid.id
            ? { ...response.data, hasContract: b.hasContract }
            : b
        )
      );
      setIsEditBidModalOpen(false);
      setSelectedBid(null);
      setFormError(null);
    } catch (err: any) {
      console.error("Update bid error:", err, "Response:", err.response?.data);
      const message = err.response?.data?.message;
      setFormError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to update bid"
      );
    }
  };

  // Create contract
  const handleCreateContract = async () => {
    const validationError = validateContractForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const payload = {
        amount: parseFloat(contractFormData.amount),
        description: contractFormData.description,
        startDate: contractFormData.startDate,
        endDate: contractFormData.endDate,
        project_id: contractFormData.project_id,
        freelancer_id: contractFormData.freelancer_id,
      };
      await ApiService.post<Contract, typeof payload>("/contracts", payload);
      setBids(
        bids.map((bid) =>
          bid.id === selectedBid?.id ? { ...bid, hasContract: true } : bid
        )
      );
      setIsCreateContractModalOpen(false);
      setFormError(null);
    } catch (err: any) {
      console.error(
        "Create contract error:",
        err,
        "Response:",
        err.response?.data
      );
      const message = err.response?.data?.message;
      setFormError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to create contract"
      );
    }
  };

  // Delete bid
  const handleDeleteBid = async (bid: Bid) => {
    if (!bid.id) return;
    if (
      !window.confirm(
        `Are you sure you want to delete this bid for ${
          bid.project?.title || "the project"
        }?`
      )
    )
      return;
    try {
      await ApiService.delete<MessageResponse>(`/bids/${bid.id}`);
      setBids(bids.filter((b) => b.id !== bid.id));
      setError(null);
    } catch (err: any) {
      console.error("Delete bid error:", err, "Response:", err.response?.data);
      const message = err.response?.data?.message;
      setError(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to delete bid"
      );
    }
  };

  if (!user) {
    return null;
  }

  const isAdmin = user.role === "admin";
  const isFreelancer = user.role === "freelancer";
  const isClient = user.role === "client";

  return (
    <DashboardLayout userRole={user.role}>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Bids
          </h1>
          {isFreelancer && (
            <Button
              variant="default"
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-300"
              onClick={handleOpenCreateBidModal}
            >
              <Plus className="w-5 h-5 mr-2" />
              Place a Bid
            </Button>
          )}
        </div>

        {isLoading && (
          <p className="text-center text-gray-600 dark:text-gray-300">
            Loading bids...
          </p>
        )}
        {error && (
          <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            {error}
          </p>
        )}
        {!isLoading && bids.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">
            {isFreelancer || isClient
              ? "You have no bids yet."
              : "No bids found."}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {bids.map((bid) => (
            <div
              key={bid.id}
              className="border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-lg bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3 line-clamp-1">
                {bid.project?.title || "Unknown Project"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {bid.proposal || "No proposal provided"}
              </p>
              <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <p>
                  <span className="font-medium">Amount:</span> $
                  {bid.amount || 0}
                </p>
                <p>
                  <span className="font-medium">Delivery Time:</span>{" "}
                  {bid.deliveryTime || 0} days
                </p>
                <p>
                  <span className="font-medium">Submitted:</span>{" "}
                  {bid.createdAt
                    ? new Date(bid.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
              {/* No bid.description property; remove or replace this section if needed */}
              <div className="flex flex-wrap gap-3 mt-4">
                {(isAdmin ||
                  (isFreelancer && bid.freelancer_id === user.id) ||
                  (isClient &&
                    bid.project?.client?.user_id === user.user_id)) && (
                  <>
                    <Button
                      variant="default"
                      className="flex-1 min-w-[100px] bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm transition-all duration-300"
                      onClick={() => handleEditBid(bid)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1 min-w-[100px] bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-lg shadow-sm transition-all duration-300"
                      onClick={() => handleDeleteBid(bid)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </>
                )}
                {isClient &&
                  bid.project?.client?.user_id === user.user_id &&
                  (bid.hasContract ? (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      Contract Created
                    </p>
                  ) : (
                    <Button
                      variant="default"
                      className="flex-1 min-w-[100px] bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-sm transition-all duration-300"
                      onClick={() => handleOpenCreateContractModal(bid)}
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create Contract
                    </Button>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* Create Bid Modal */}
        <Dialog
          open={isCreateBidModalOpen}
          onOpenChange={setIsCreateBidModalOpen}
        >
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Place a New Bid
              </DialogTitle>
            </DialogHeader>
            {formError && (
              <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {formError}
              </p>
            )}
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="amount"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Bid Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={bidFormData.amount}
                  onChange={handleBidInputChange}
                  placeholder="e.g., 1000"
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="deliveryTime"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Delivery Time (days)
                </Label>
                <Input
                  id="deliveryTime"
                  name="deliveryTime"
                  type="number"
                  value={bidFormData.deliveryTime}
                  onChange={handleBidInputChange}
                  placeholder="e.g., 14"
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="proposal"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Proposal
                </Label>
                <textarea
                  id="proposal"
                  name="proposal"
                  value={bidFormData.proposal}
                  onChange={handleBidInputChange}
                  placeholder="Describe your approach to this project..."
                  className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] p-3"
                />
              </div>
              <div>
                <Label
                  htmlFor="project_id"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Select Project
                </Label>
                <Select
                  value={bidFormData.project_id}
                  onValueChange={handleBidProjectChange}
                >
                  <SelectTrigger className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg">
                    {projects.map((project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id}
                        className="text-gray-900 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {project.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setIsCreateBidModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm transition-all duration-300"
                onClick={handleCreateBid}
              >
                Submit Bid
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Bid Modal */}
        <Dialog open={isEditBidModalOpen} onOpenChange={setIsEditBidModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit Bid
              </DialogTitle>
            </DialogHeader>
            {formError && (
              <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {formError}
              </p>
            )}
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="amount"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Bid Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={bidFormData.amount}
                  onChange={handleBidInputChange}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="deliveryTime"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Delivery Time (days)
                </Label>
                <Input
                  id="deliveryTime"
                  name="deliveryTime"
                  type="number"
                  value={bidFormData.deliveryTime}
                  onChange={handleBidInputChange}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="proposal"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Proposal
                </Label>
                <textarea
                  id="proposal"
                  name="proposal"
                  value={bidFormData.proposal}
                  onChange={handleBidInputChange}
                  className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] p-3"
                />
              </div>
              <div>
                <Label
                  htmlFor="project_id"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Project
                </Label>
                <Input
                  id="project_id"
                  value={selectedBid?.project?.title || "Unknown Project"}
                  disabled
                  className="mt-1 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded-lg"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setIsEditBidModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm transition-all duration-300"
                onClick={handleUpdateBid}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Create Contract Modal */}
        <Dialog
          open={isCreateContractModalOpen}
          onOpenChange={setIsCreateContractModalOpen}
        >
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800 rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Contract
              </DialogTitle>
            </DialogHeader>
            {formError && (
              <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                {formError}
              </p>
            )}
            <div className="space-y-6">
              <div>
                <Label
                  htmlFor="amount"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Contract Amount
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={contractFormData.amount}
                  onChange={handleContractInputChange}
                  placeholder="e.g., 1000"
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="description"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Description
                </Label>
                <textarea
                  id="description"
                  name="description"
                  value={contractFormData.description}
                  onChange={handleContractInputChange}
                  placeholder="e.g., Development of a responsive website..."
                  className="mt-1 w-full bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 resize-y min-h-[100px] p-3"
                />
              </div>
              <div>
                <Label
                  htmlFor="startDate"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={contractFormData.startDate}
                  onChange={handleContractInputChange}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="endDate"
                  className="text-gray-700 dark:text-gray-200"
                >
                  End Date
                </Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={contractFormData.endDate}
                  onChange={handleContractInputChange}
                  className="mt-1 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="project_id"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Project
                </Label>
                <Input
                  id="project_id"
                  value={selectedBid?.project?.title || "Unknown Project"}
                  disabled
                  className="mt-1 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded-lg"
                />
              </div>
              <div>
                <Label
                  htmlFor="freelancer_id"
                  className="text-gray-700 dark:text-gray-200"
                >
                  Freelancer
                </Label>
                <Input
                  id="freelancer_id"
                  value={
                    selectedBid?.freelancer
                      ? `${selectedBid.freelancer.firstName} ${selectedBid.freelancer.lastName}`
                      : "Unknown Freelancer"
                  }
                  disabled
                  className="mt-1 bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded-lg"
                />
              </div>
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="outline"
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                onClick={() => setIsCreateContractModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg shadow-sm transition-all duration-300"
                onClick={handleCreateContract}
              >
                Submit Contract
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
