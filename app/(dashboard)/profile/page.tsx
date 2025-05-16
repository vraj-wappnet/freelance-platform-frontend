"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/lib/store";
import { setCredentials } from "@/lib/authSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import ApiService from "@/lib/api.service";

interface Profile {
  id: string;
  user_id: string;
  email: string;
  firstName: string;
  lastName: string;
  location: string;
  phone: string;
  bio: string;
  role: string;
  profilePhoto?: string | null;
}

const ProfilePage = () => {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const refreshToken = useSelector(
    (state: RootState) => state.auth.refreshToken
  );
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    location: "",
    phone: "",
    bio: "",
    profilePhoto: null as File | null,
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref for file input

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await ApiService.get<Profile>("/auth/profile");
        setProfile(response.data);
        setFormData({
          firstName: response.data.firstName || "",
          lastName: response.data.lastName || "",
          location: response.data.location || "",
          phone: response.data.phone || "",
          bio: response.data.bio || "",
          profilePhoto: null,
        });
        setPreviewUrl(response.data.profilePhoto || null);
      } catch (err: any) {
        alert(err.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Only JPEG or PNG files are allowed");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      console.log("Selected file:", file.name, file.type, file.size);
      setFormData((prev) => ({ ...prev, profilePhoto: file }));
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      console.log("No file selected");
    }
  };

  // Handle profile photo upload
  const handlePhotoUpload = async () => {
    if (!formData.profilePhoto) {
      alert("Please select a profile photo to upload");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("profilePhoto", formData.profilePhoto);
      console.log(
        "Photo FormData contents:",
        Array.from(formDataToSend.entries())
      );

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}auth/profile-photo`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formDataToSend,
        }
      );

      console.log(
        "Fetch response status:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Fetch error response:", errorData);
        throw new Error(errorData.message || "Failed to upload profile photo");
      }

      const responseData = await response.json();
      console.log("Fetch success response:", responseData);

      setProfile(responseData);
      setFormData((prev) => ({ ...prev, profilePhoto: null }));
      setPreviewUrl(responseData.profilePhoto || null);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Update Redux store
      if (user && accessToken) {
        dispatch(
          setCredentials({
            user: {
              ...user,
              firstName: responseData.firstName,
              lastName: responseData.lastName,
              location: responseData.location,
              phone: responseData.phone,
              bio: responseData.bio,
              profilePhoto: responseData.profilePhoto,
            },
            accessToken,
            refreshToken: refreshToken ?? "",
          })
        );
      }

      alert("Profile photo uploaded successfully");
    } catch (err: any) {
      console.error("Photo Upload Error:", err);
      alert(err.message || "Failed to upload profile photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle profile form submission (text fields only)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updateData: Record<string, string> = {};
      if (formData.firstName.trim())
        updateData.firstName = formData.firstName.trim();
      if (formData.lastName.trim())
        updateData.lastName = formData.lastName.trim();
      if (formData.location.trim())
        updateData.location = formData.location.trim();
      if (formData.phone.trim()) updateData.phone = formData.phone.trim();
      if (formData.bio.trim()) updateData.bio = formData.bio.trim();

      console.log("Profile Update Data:", updateData);

      if (Object.keys(updateData).length === 0) {
        alert("Please provide at least one field to update");
        setSubmitting(false);
        return;
      }

      const response = await ApiService.patch<Profile , FormData>(
        "/auth/profile",
        updateData
      );
      setProfile(response.data);

      // Update Redux store
      if (user && accessToken) {
        dispatch(
          setCredentials({
            user: {
              ...user,
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              location: response.data.location,
              phone: response.data.phone,
              bio: response.data.bio,
              profilePhoto: response.data.profilePhoto,
            },
            accessToken,
            refreshToken: refreshToken ?? "",
          })
        );
      }

      alert("Profile updated successfully");
    } catch (err: any) {
      console.error("Submit Error: ", err);
      alert(err.message || "Failed to update profile");
    } finally {
      setSubmitting(false);
    }
  };

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return <div className="text-center py-8">Error loading profile</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Edit Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={previewUrl || profile.profilePhoto || ""}
                  alt="Profile"
                />
                <AvatarFallback>
                  {profile.firstName[0] || ""}
                  {profile.lastName[0] || ""}
                </AvatarFallback>
              </Avatar>
              <div>
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <Input
                  id="profilePhoto"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={handleFileChange}
                  className="mt-1"
                  ref={fileInputRef}
                />
                <Button
                  type="button"
                  onClick={handlePhotoUpload}
                  disabled={uploadingPhoto || !formData.profilePhoto}
                  className="mt-2"
                >
                  {uploadingPhoto ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Photo"
                  )}
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="Enter your first name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                placeholder="Enter your last name"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={profile.email}
                disabled
                className="mt-1 bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Enter your location"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter your phone number (e.g., +91 1234567890)"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={profile.role}
                disabled
                className="mt-1 bg-muted capitalize"
              />
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself"
                className="mt-1 w-full p-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
              />
            </div>

            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
