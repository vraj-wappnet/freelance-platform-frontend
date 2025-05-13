"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/shared/dashboard-layout";
import { Table } from "@/components/ui/table";
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
import { Contract, MessageResponse } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ApiService from "@/lib/api.service";

export default function ContractsPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    client: "",
    freelancer: "",
    status: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Fetch contracts
  useEffect(() => {
    const fetchContracts = async () => {
      setIsLoading(true);
      try {
        const response = await ApiService.get<Contract[]>("/contracts");
        setContracts(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch contracts");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchContracts();
    }
  }, [user]);

  // Open edit modal
  const handleEdit = (contract: Contract) => {
    setSelectedContract(contract);
    setFormData({
      title: contract.title,
      client: contract.client,
      freelancer: contract.freelancer,
      status: contract.status,
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

  // Update contract
  const handleUpdate = async () => {
    if (!selectedContract) return;
    try {
      const response = await ApiService.patch<Contract, typeof formData>(
        `/contracts/${selectedContract.id}`,
        formData
      );
      setContracts(
        contracts.map((c) => (c.id === selectedContract.id ? response.data : c))
      );
      setIsEditModalOpen(false);
      setSelectedContract(null);
    } catch (err: any) {
      setError(err.message || "Failed to update contract");
    }
  };

  // Delete contract
  const handleDelete = async (contract: Contract) => {
    if (!confirm(`Are you sure you want to delete ${contract.title}?`)) return;
    try {
      await ApiService.delete<MessageResponse>(`/contracts/${contract.id}`);
      setContracts(contracts.filter((c) => c.id !== contract.id));
    } catch (err: any) {
      setError(err.message || "Failed to delete contract");
    }
  };

  // Table columns
  const columns = [
    { header: "ID", accessor: "id" as keyof Contract },
    { header: "Title", accessor: "title" as keyof Contract },
    { header: "Client", accessor: "client" as keyof Contract },
    { header: "Freelancer", accessor: "freelancer" as keyof Contract },
    { header: "Status", accessor: "status" as keyof Contract },
  ];

  if (!user) {
    return null; // Redirect will handle this
  }

  const isAdmin = user.role === "admin";

  return (
    <DashboardLayout userRole={user.role}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Contracts</h1>
        <Table
          columns={columns}
          data={contracts}
          isLoading={isLoading}
          error={error}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Contract</DialogTitle>
            </DialogHeader>
            <div className="space-y-4  space-y-4">
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
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="freelancer">Freelancer</Label>
                <Input
                  id="freelancer"
                  name="freelancer"
                  value={formData.freelancer}
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
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
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