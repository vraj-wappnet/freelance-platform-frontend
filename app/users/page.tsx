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
import { User, MessageResponse } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import ApiService from "@/lib/api.service";

export default function UsersPage() {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, [user, router]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const response = await ApiService.get<User[]>("/users");
        setUsers(response.data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch users");
      } finally {
        setIsLoading(false);
      }
    };
    if (user) {
      fetchUsers();
    }
  }, [user]);

  // Open edit modal
  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
    });
    setIsEditModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle role selection
  const handleRoleChange = (value: string) => {
    setFormData({ ...formData, role: value });
  };

  // Update user
  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      const response = await ApiService.patch<User, typeof formData>(
        `/users/${selectedUser.id}`,
        formData
      );
      setUsers(
        users.map((u) => (u.id === selectedUser.id ? response.data : u))
      );
      setIsEditModalOpen(false);
      setSelectedUser(null);
    } catch (err: any) {
      setError(err.message || "Failed to update user");
    }
  };

  // Delete user
  const handleDelete = async (user: User) => {
    if (
      !confirm(
        `Are you sure you want to delete ${user.firstName} ${user.lastName}?`
      )
    )
      return;
    try {
      await ApiService.delete<MessageResponse>(`/users/${user.id}`);
      setUsers(users.filter((u) => u.id !== user.id));
    } catch (err: any) {
      setError(err.message || "Failed to delete user");
    }
  };

  // Table columns
  const columns = [
    { header: "ID", accessor: "id" as keyof User },
    {
      header: "Name",
      accessor: (user: User) => `${user.firstName} ${user.lastName}`,
    },
    { header: "Email", accessor: "email" as keyof User },
    { header: "Role", accessor: "role" as keyof User },
  ];

  if (!user) {
    return null; // Redirect will handle this
  }

  const isAdmin = user.role === "admin";

  return (
    <DashboardLayout userRole={user.role}>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold tracking-tight mb-6">Users</h1>
        <Table
          columns={columns}
          data={users}
          isLoading={isLoading}
          error={error}
          onEdit={isAdmin ? handleEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
        />

        {/* Edit Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <Select value={formData.role} onValueChange={handleRoleChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
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
