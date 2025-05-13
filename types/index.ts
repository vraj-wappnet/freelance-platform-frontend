export type UserRole = "client" | "freelancer" | "admin";

export interface User {
  id: string;
  user_id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  name?: string; // Optional for compatibility with Dashboard
}
export interface MessageResponse {
  message: string;
}
export interface Project {
  id: string;
  title: string;
  budget: {
    min: number;
    max: number;
  };
  status: "open" | "in-progress" | "completed";
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  createdAt: string;
}

export type ContractStage =
  | "proposal"
  | "approval"
  | "payment"
  | "review"
  | "completed";

export interface Milestone {
  id: string;
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "in-progress" | "completed" | "approved";
  paymentStatus: "unpaid" | "requested" | "paid";
  createdAt: Date;
  updatedAt: Date;
}

export interface Bid {
  id: string;
  projectId: string;
  freelancerId: string;
  amount: number;
  coverLetter: string;
  deliveryTime: string;
  status: "pending" | "shortlisted" | "accepted" | "rejected";
  createdAt: Date;
}

export interface Contract {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  stage: ContractStage;
  milestones: Milestone[];
  startDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  read: boolean;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  updatedAt: Date;
}
