import { User, Project, Bid, Contract, Milestone, Message, Conversation, Notification } from "@/types";

// Mock data for development - would be replaced with actual API calls in production

export const users: User[] = [
  {
    id: "user1",
    name: "John Doe",
    email: "john@example.com",
    role: "client",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=600",
    bio: "Tech entrepreneur looking for talented developers",
    createdAt: new Date("2023-01-15"),
  },
  {
    id: "user2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "freelancer",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
    bio: "Full-stack developer with 5 years of experience",
    skills: ["React", "Node.js", "TypeScript", "MongoDB"],
    createdAt: new Date("2023-02-10"),
  },
  {
    id: "user3",
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "freelancer",
    avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=600",
    bio: "UI/UX designer specializing in mobile applications",
    skills: ["UI/UX", "Figma", "Adobe XD", "Sketch"],
    createdAt: new Date("2023-03-05"),
  },
  {
    id: "user4",
    name: "Emily Wilson",
    email: "emily@example.com",
    role: "client",
    avatar: "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=600",
    bio: "Marketing agency looking for creative talent",
    createdAt: new Date("2023-01-30"),
  },
  {
    id: "user5",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    avatar: "https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=600",
    createdAt: new Date("2022-12-01"),
  },
];

export const projects: Project[] = [
  {
    id: "project1",
    clientId: "user1",
    title: "E-commerce Website Development",
    description: "Looking for a developer to build a modern e-commerce website with product catalog, shopping cart, and payment integration.",
    category: "Web Development",
    skills: ["React", "Node.js", "MongoDB", "Stripe"],
    budget: {
      min: 2000,
      max: 5000,
    },
    duration: "2-3 months",
    status: "open",
    createdAt: new Date("2023-04-10"),
    updatedAt: new Date("2023-04-10"),
  },
  {
    id: "project2",
    clientId: "user4",
    title: "Mobile App UI Design",
    description: "Need a skilled designer to create UI/UX for a fitness tracking mobile app for iOS and Android.",
    category: "UI/UX Design",
    skills: ["UI/UX", "Figma", "Mobile Design"],
    budget: {
      min: 1500,
      max: 3000,
    },
    duration: "1-2 months",
    status: "open",
    createdAt: new Date("2023-04-15"),
    updatedAt: new Date("2023-04-15"),
  },
  {
    id: "project3",
    clientId: "user1",
    title: "Content Management System",
    description: "Need to build a custom CMS for a media company to manage articles, images, and videos.",
    category: "Web Development",
    skills: ["Next.js", "TypeScript", "PostgreSQL"],
    budget: {
      min: 3000,
      max: 7000,
    },
    duration: "3-4 months",
    status: "assigned",
    createdAt: new Date("2023-03-20"),
    updatedAt: new Date("2023-04-05"),
  },
];

export const bids: Bid[] = [
  {
    id: "bid1",
    projectId: "project1",
    freelancerId: "user2",
    amount: 3500,
    coverLetter: "I have extensive experience building e-commerce platforms with React and Node.js. I've worked with Stripe integration before and can deliver a high-quality solution.",
    deliveryTime: "2.5 months",
    status: "pending",
    createdAt: new Date("2023-04-12"),
  },
  {
    id: "bid2",
    projectId: "project1",
    freelancerId: "user3",
    amount: 4200,
    coverLetter: "While I specialize in UI/UX, I also have full-stack development experience and can create a beautiful and functional e-commerce site.",
    deliveryTime: "3 months",
    status: "pending",
    createdAt: new Date("2023-04-13"),
  },
  {
    id: "bid3",
    projectId: "project2",
    freelancerId: "user3",
    amount: 2000,
    coverLetter: "As a UI/UX specialist with a focus on mobile applications, I'm the perfect fit for your fitness app. I've designed similar apps before and understand the user needs in this space.",
    deliveryTime: "1 month",
    status: "shortlisted",
    createdAt: new Date("2023-04-16"),
  },
];

export const contracts: Contract[] = [
  {
    id: "contract1",
    projectId: "project3",
    clientId: "user1",
    freelancerId: "user2",
    amount: 5500,
    stage: "payment",
    milestones: [
      {
        id: "milestone1",
        title: "Backend Development",
        description: "Set up database and API endpoints",
        amount: 2000,
        dueDate: new Date("2023-05-15"),
        status: "completed",
        paymentStatus: "paid",
        createdAt: new Date("2023-04-05"),
        updatedAt: new Date("2023-05-12"),
      },
      {
        id: "milestone2",
        title: "Frontend Development",
        description: "Build user interface and admin dashboard",
        amount: 2500,
        dueDate: new Date("2023-06-15"),
        status: "in-progress",
        paymentStatus: "unpaid",
        createdAt: new Date("2023-04-05"),
        updatedAt: new Date("2023-05-12"),
      },
      {
        id: "milestone3",
        title: "Testing and Deployment",
        description: "Comprehensive testing and launch",
        amount: 1000,
        dueDate: new Date("2023-07-01"),
        status: "pending",
        paymentStatus: "unpaid",
        createdAt: new Date("2023-04-05"),
        updatedAt: new Date("2023-04-05"),
      },
    ],
    startDate: new Date("2023-04-05"),
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-05-12"),
  },
];

export const conversations: Conversation[] = [
  {
    id: "conv1",
    participants: ["user1", "user2"],
    updatedAt: new Date("2023-05-10"),
  },
  {
    id: "conv2",
    participants: ["user1", "user3"],
    updatedAt: new Date("2023-04-20"),
  },
  {
    id: "conv3",
    participants: ["user4", "user3"],
    updatedAt: new Date("2023-05-05"),
  },
];

export const messages: Message[] = [
  {
    id: "msg1",
    conversationId: "conv1",
    senderId: "user1",
    receiverId: "user2",
    content: "Hello, I want to discuss the project details.",
    read: true,
    createdAt: new Date("2023-05-09T10:30:00"),
  },
  {
    id: "msg2",
    conversationId: "conv1",
    senderId: "user2",
    receiverId: "user1",
    content: "Hi there! I'd be happy to discuss. What specific aspects would you like to know more about?",
    read: true,
    createdAt: new Date("2023-05-09T11:15:00"),
  },
  {
    id: "msg3",
    conversationId: "conv1",
    senderId: "user1",
    receiverId: "user2",
    content: "I'm particularly interested in your approach to the payment integration part.",
    read: true,
    createdAt: new Date("2023-05-09T14:20:00"),
  },
  {
    id: "msg4",
    conversationId: "conv1",
    senderId: "user2",
    receiverId: "user1",
    content: "I've worked with Stripe extensively. I typically use their SDK to handle payments securely, and I make sure to implement proper error handling and confirmation processes.",
    read: false,
    createdAt: new Date("2023-05-10T09:45:00"),
  },
];

export const notifications: Notification[] = [
  {
    id: "notif1",
    userId: "user1",
    type: "bid",
    title: "New Bid Received",
    description: "Your project 'E-commerce Website Development' has received a new bid.",
    read: false,
    link: "/projects/project1",
    createdAt: new Date("2023-04-12T15:30:00"),
  },
  {
    id: "notif2",
    userId: "user1",
    type: "message",
    title: "New Message",
    description: "You have a new message from Jane Smith.",
    read: false,
    link: "/messages/conv1",
    createdAt: new Date("2023-05-10T09:45:00"),
  },
  {
    id: "notif3",
    userId: "user2",
    type: "milestone",
    title: "Milestone Approved",
    description: "Your milestone 'Backend Development' has been approved.",
    read: true,
    link: "/contracts/contract1",
    createdAt: new Date("2023-05-12T16:20:00"),
  },
];

// Helper functions to get data

export const getUserById = (id: string): User | undefined => {
  return users.find(user => user.id === id);
};

export const getProjectById = (id: string): Project | undefined => {
  return projects.find(project => project.id === id);
};

export const getBidsByProject = (projectId: string): Bid[] => {
  return bids.filter(bid => bid.projectId === projectId);
};

export const getContractByProject = (projectId: string): Contract | undefined => {
  return contracts.find(contract => contract.projectId === projectId);
};

export const getMessagesByConversation = (conversationId: string): Message[] => {
  return messages.filter(message => message.conversationId === conversationId);
};

export const getConversationsByUser = (userId: string): Conversation[] => {
  return conversations.filter(conversation => conversation.participants.includes(userId));
};

export const getProjectsByClient = (clientId: string): Project[] => {
  return projects.filter(project => project.clientId === clientId);
};

export const getBidsByFreelancer = (freelancerId: string): Bid[] => {
  return bids.filter(bid => bid.freelancerId === freelancerId);
};

export const getContractsByFreelancer = (freelancerId: string): Contract[] => {
  return contracts.filter(contract => contract.freelancerId === freelancerId);
};

export const getContractsByClient = (clientId: string): Contract[] => {
  return contracts.filter(contract => contract.clientId === clientId);
};

export const getNotificationsByUser = (userId: string): Notification[] => {
  return notifications.filter(notification => notification.userId === userId);
};