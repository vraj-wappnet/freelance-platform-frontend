"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { io, type Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Send,
  Loader2,
  AlertCircle,
  Smile,
  Search,
  MoreVertical,
  Edit,
  Trash,
  Check,
  X,
} from "lucide-react";
import type { RootState } from "@/lib/store";
import { cn } from "@/lib/utils";
import ApiService from "@/lib/api.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Utility to generate unique temporary IDs
const generateTempId = () => `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

// Define types
interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  createdAt: string;
  isRead: boolean;
  sender: { id: string; firstName: string; lastName: string; avatar?: string };
  recipient: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  lastSeen?: string;
  status?: "online" | "offline" | "away";
}

export default function MessagesPage() {
  const user = useSelector(
    (state: RootState) => state.auth.user
  ) as User | null;
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedNewUser, setSelectedNewUser] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeConversations, setActiveConversations] = useState<string[]>([]);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteMessageId, setDeleteMessageId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch available users for new chat
  useEffect(() => {
    const fetchUsers = async () => {
      if (!user?.role) return;
      setIsLoadingUsers(true);
      try {
        const roleToFetch = user.role === "client" ? "freelancer" : "client";
        const response = await ApiService.get<User[]>(
          `/users/by-role?role=${roleToFetch}`
        );
        const usersWithStatus = response.data.map((user) => ({
          ...user,
          status:
            Math.random() > 0.5 ? ("online" as const) : ("offline" as const),
          lastSeen: Math.random() > 0.5 ? "2h ago" : "5m ago",
        }));
        setAvailableUsers(
          Array.isArray(usersWithStatus) ? usersWithStatus : []
        );
        setError(null);
      } catch (err: any) {
        console.error("Fetch users error:", err);
        setError(err.response?.data?.message || "Failed to fetch users");
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [user?.role]);

  // Fetch messages for the selected recipient
  const fetchMessages = async (recipientId: string) => {
    if (!user?.id || !recipientId) return;
    setIsLoadingMessages(true);
    try {
      const response = await ApiService.get<Message[]>(
        `/messages/conversation?userId=${user.id}&recipientId=${recipientId}`
      );
      setMessages(Array.isArray(response.data) ? response.data : []);
      setError(null);
    } catch (err: any) {
      console.error("Fetch messages error:", err);
      setError(err.response?.data?.message || "Failed to fetch messages");
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Initialize WebSocket
  useEffect(() => {
    if (!user?.id || !accessToken) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    socketRef.current = io(socketUrl, {
      auth: { token: accessToken },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    socketRef.current.on("connect", () => {
      console.log(`WebSocket connected for user ${user.id}`);
      socketRef.current?.emit("join", user.id);
      setError(null);
    });

    socketRef.current.on(
      "conversationStarted",
      ({ initiatorId }: { initiatorId: string }) => {
        console.log(`Conversation started with initiator ${initiatorId}`);
        const initiator = availableUsers.find((u) => u.id === initiatorId);
        if (initiator) {
          const conversationRoom = [user.id, initiatorId].sort().join("_");
          console.log(`Joining conversation room ${conversationRoom}`);
          socketRef.current?.emit("joinConversation", {
            room: conversationRoom,
          });
          setActiveConversations((prev) =>
            Array.from(new Set([...prev, initiatorId]))
          );
          if (!selectedRecipient) {
            setSelectedRecipient(initiator);
            fetchMessages(initiatorId);
          }
        }
      }
    );

    socketRef.current.on("receiveMessage", (message: Message) => {
      console.log(`Received message: ${JSON.stringify(message)}`);
      const otherUserId =
        message.sender_id === user.id
          ? message.recipient_id
          : message.sender_id;
      if (
        activeConversations.includes(otherUserId) &&
        selectedRecipient?.id === otherUserId
      ) {
        setMessages((prev) => {
          // Replace temporary message if it exists
          const tempMessageIndex = prev.findIndex(
            (m) =>
              m.id.startsWith("temp-") &&
              m.content === message.content &&
              m.sender_id === message.sender_id
          );
          if (tempMessageIndex !== -1) {
            console.log(`Replacing temp message at index ${tempMessageIndex}`);
            const newMessages = [...prev];
            newMessages[tempMessageIndex] = message;
            return newMessages;
          }
          if (prev.some((m) => m.id === message.id)) {
            console.log(`Message ${message.id} already exists, skipping`);
            return prev;
          }
          return [...prev, message];
        });
      }
    });

    socketRef.current.on("messageUpdated", (updatedMessage: Message) => {
      console.log(`Message updated: ${JSON.stringify(updatedMessage)}`);
      if (
        (updatedMessage.sender_id === user?.id &&
          updatedMessage.recipient_id === selectedRecipient?.id) ||
        (updatedMessage.sender_id === selectedRecipient?.id &&
          updatedMessage.recipient_id === user?.id)
      ) {
        setMessages((prev) => {
          const newMessages = prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          );
          console.log(`Updated messages state: ${JSON.stringify(newMessages)}`);
          return [...newMessages];
        });
      }
    });

    socketRef.current.on(
      "messageDeleted",
      ({ messageId }: { messageId: string }) => {
        console.log(`Message deleted event received: ${messageId}`);
        setMessages((prev) => {
          const newMessages = prev.filter((msg) => msg.id !== messageId);
          console.log(`Messages after deletion: ${JSON.stringify(newMessages)}`);
          return [...newMessages];
        });
      }
    );

    socketRef.current.on("typing", ({ userId }: { userId: string }) => {
      if (userId === selectedRecipient?.id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    socketRef.current.on(
      "userStatus",
      ({
        userId,
        status,
      }: {
        userId: string;
        status: "online" | "offline";
      }) => {
        setAvailableUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, status } : user))
        );
      }
    );

    socketRef.current.on("connect_error", (error) => {
      console.error(`WebSocket connect error: ${error.message}`);
      setError(`Failed to connect to messaging service: ${error.message}`);
    });

    socketRef.current.on("error", (error) => {
      console.error(`WebSocket error: ${error.message || "Unknown error"}`);
      setError(`Socket error: ${error.message || "Unknown error"}`);
    });

    return () => {
      if (socketRef.current) {
        console.log("Disconnecting WebSocket");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [
    user?.id,
    accessToken,
    availableUsers,
    selectedRecipient,
    activeConversations,
  ]);

  // Fetch messages and join conversation room when recipient changes
  useEffect(() => {
    if (selectedRecipient?.id && user?.id) {
      fetchMessages(selectedRecipient.id);
      const conversationRoom = [user.id, selectedRecipient.id].sort().join("_");
      console.log(
        `Joining conversation room on recipient change: ${conversationRoom}`
      );
      socketRef.current?.emit("joinConversation", { room: conversationRoom });
    }
  }, [selectedRecipient?.id, user?.id]);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (socketRef.current && selectedRecipient?.id && user?.id) {
      socketRef.current.emit("typing", {
        userId: user.id,
        recipientId: selectedRecipient.id,
      });
    }
  };

  const handleStartConversation = (recipientId: string) => {
    const recipient = availableUsers.find((u) => u.id === recipientId);
    if (!recipient || !user) return;

    setSelectedRecipient(recipient);
    setMessages([]);
    setSelectedNewUser("");
    setSearchQuery("");
    setIsMobileSidebarOpen(false);

    const conversationRoom = [user.id, recipientId].sort().join("_");
    console.log(`Starting conversation, joining room: ${conversationRoom}`);
    socketRef.current?.emit("joinConversation", { room: conversationRoom });
    socketRef.current?.emit("startConversation", {
      userId: user.id,
      recipientId: recipient.id,
    });
    setActiveConversations((prev) =>
      Array.from(new Set([...prev, recipientId]))
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedRecipient || !socketRef.current || !user)
      return;

    const createMessageDto = {
      content: newMessage,
      recipient_id: selectedRecipient.id,
    };

    const tempMessage = {
      id: generateTempId(),
      content: newMessage,
      sender_id: user.id,
      recipient_id: selectedRecipient.id,
      createdAt: new Date().toISOString(),
      isRead: false,
      sender: user,
      recipient: selectedRecipient,
    };

    socketRef.current.emit("sendMessage", {
      userId: user.id,
      createMessageDto,
    });

    setMessages((prev) => [...prev, tempMessage]);
    setNewMessage("");
  };

  const handleStartEdit = (message: Message) => {
    setEditingMessageId(message.id);
    setEditedContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (!editingMessageId || !user || !socketRef.current) return;

    const updateMessageDto = {
      content: editedContent.trim(),
      isRead: false,
    };

    setIsUpdating(true);
    try {
      await ApiService.patch(`/messages/${editingMessageId}`, updateMessageDto);
      socketRef.current.emit("updateMessage", {
        userId: user.id,
        messageId: editingMessageId,
        updateMessageDto,
      });
      setEditingMessageId(null);
      setEditedContent("");
    } catch (err: any) {
      console.error("Update message error:", err);
      if (selectedRecipient?.id) {
        fetchMessages(selectedRecipient.id);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditedContent("");
  };

  const handleDeleteMessage = async () => {
    if (!deleteMessageId || !user || !socketRef.current || !selectedRecipient)
      return;

    setIsDeleting(true);
    try {
      // Optimistically update the UI by removing the message
      setMessages((prev) => {
        const newMessages = prev.filter((msg) => msg.id !== deleteMessageId);
        console.log(`Optimistically removed message ${deleteMessageId}: ${JSON.stringify(newMessages)}`);
        return [...newMessages];
      });

      // Make the API call to delete the message
      await ApiService.delete(`/messages/${deleteMessageId}`);

      // Emit the delete event
      socketRef.current.emit("deleteMessage", {
        userId: user.id,
        messageId: deleteMessageId,
      });

      // Fallback: If WebSocket event doesn't update within 2 seconds, refetch
      setTimeout(() => {
        setMessages((prev) => {
          if (prev.some((msg) => msg.id === deleteMessageId)) {
            console.log(`WebSocket event missed for delete ${deleteMessageId}, refetching messages`);
            fetchMessages(selectedRecipient.id);
          }
          return prev;
        });
      }, 2000);

      setDeleteMessageId(null);
    } catch (err: any) {
      console.error("Delete message error:", err);
      // Revert optimistic update on error
      if (selectedRecipient?.id) {
        fetchMessages(selectedRecipient.id);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = availableUsers.filter((u) =>
    `${u.firstName} ${u.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background rounded-xl overflow-hidden shadow-sm border">
      <AlertDialog
        open={!!deleteMessageId}
        onOpenChange={() => setDeleteMessageId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMessage}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="md:hidden fixed bottom-6 right-6 z-10">
        <Button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="rounded-full w-14 h-14 p-0 bg-primary shadow-lg"
        >
          {isMobileSidebarOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          )}
        </Button>
      </div>

      <div
        className={cn(
          "w-full md:w-96 border-r bg-card flex flex-col absolute md:relative z-20 h-full transition-transform duration-300",
          isMobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        )}
      >
        <div className="p-4 border-b">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Messages</h2>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="pl-10 rounded-full bg-background border-muted"
              />
            </div>
          </motion.div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 bg-destructive/10 text-destructive flex items-center gap-2 text-sm"
          >
            <AlertCircle className="h-4 w-4" />
            <p>{error}</p>
          </motion.div>
        )}

        <ScrollArea className="flex-1">
          {isLoadingUsers ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : availableUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div className="bg-muted/50 rounded-full p-4 mb-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-muted-foreground"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <p className="text-muted-foreground">No contacts available</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Start by adding new connections
              </p>
            </div>
          ) : (
            <div className="divide-y divide-muted/50">
              {filteredUsers.map((u) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    "flex items-center p-4 hover:bg-accent/30 cursor-pointer transition-all duration-200",
                    selectedRecipient?.id === u.id && "bg-accent/20"
                  )}
                  onClick={() => handleStartConversation(u.id)}
                >
                  <div className="relative mr-3">
                    <Avatar className="h-12 w-12">
                      {u.avatar && <AvatarImage src={u.avatar} />}
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-muted">
                        {u.firstName[0]}
                        {u.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {u.status === "online" && (
                      <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-green-500"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <p className="font-semibold text-foreground truncate">
                        {u.firstName} {u.lastName}
                      </p>
                      <span className="text-xs text-muted-foreground ml-2 whitespace-nowrap">
                        {u.lastSeen || "2h ago"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground truncate capitalize">
                        {u.role}
                      </p>
                      {activeConversations.includes(u.id) && (
                        <span className="h-2 w-2 rounded-full bg-primary ml-2"></span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col relative bg-background">
        {selectedRecipient ? (
          <>
            <div className="p-4 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden mr-2"
                  onClick={() => setIsMobileSidebarOpen(true)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </Button>
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <Avatar className="h-10 w-10">
                      {selectedRecipient.avatar && (
                        <AvatarImage src={selectedRecipient.avatar} />
                      )}
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-muted">
                        {selectedRecipient.firstName[0]}
                        {selectedRecipient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    {selectedRecipient.status === "online" && (
                      <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-background bg-green-500"></div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">
                      {selectedRecipient.firstName} {selectedRecipient.lastName}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedRecipient.status === "online" ? (
                        <span className="flex items-center">
                          <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                          Online
                        </span>
                      ) : (
                        `Last seen ${selectedRecipient.lastSeen || "recently"}`
                      )}
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4 bg-gradient-to-b from-card/30 to-background">
              {isLoadingMessages ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center h-full text-center p-8"
                >
                  <div className="bg-muted/50 rounded-full p-5 mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-10 w-10 text-muted-foreground"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    Start a conversation
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Send your first message to {selectedRecipient.firstName} and
                    begin collaborating on your project.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3 pb-4">
                  <AnimatePresence>
                    {messages
                      .filter(
                        (msg) =>
                          (msg.sender_id === user?.id &&
                            msg.recipient_id === selectedRecipient.id) ||
                          (msg.sender_id === selectedRecipient.id &&
                            msg.recipient_id === user?.id)
                      )
                      .map((msg) => (
                        <motion.div
                          key={msg.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.2 }}
                          className={cn(
                            "flex",
                            msg.sender_id === user?.id
                              ? "justify-end"
                              : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "flex max-w-xs md:max-w-md lg:max-w-lg",
                              msg.sender_id === user?.id
                                ? "items-end"
                                : "items-start"
                            )}
                          >
                            {msg.sender_id !== user?.id && (
                              <Avatar className="h-8 w-8 mr-2 mt-1">
                                {msg.sender.avatar && (
                                  <AvatarImage src={msg.sender.avatar} />
                                )}
                                <AvatarFallback className="bg-gradient-to-br from-primary/20 to-muted">
                                  {msg.sender.firstName[0]}
                                  {msg.sender.lastName[0]}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            <div className="flex items-end">
                              <div
                                className={cn(
                                  "p-3 rounded-2xl",
                                  msg.sender_id === user?.id
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-card border rounded-bl-none"
                                )}
                              >
                                {editingMessageId === msg.id ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editedContent}
                                      onChange={(e) =>
                                        setEditedContent(e.target.value)
                                      }
                                      className="text-sm bg-background text-foreground border-muted"
                                      autoFocus
                                      onKeyPress={(e) =>
                                        e.key === "Enter" && handleSaveEdit()
                                      }
                                    />
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={handleSaveEdit}
                                      disabled={
                                        isUpdating || !editedContent.trim()
                                      }
                                    >
                                      {isUpdating ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                      ) : (
                                        <Check className="h-4 w-4" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={handleCancelEdit}
                                      disabled={isUpdating}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-sm">{msg.content}</p>
                                    <p
                                      className={cn(
                                        "text-xs mt-1 flex justify-end items-center gap-1",
                                        msg.sender_id === user?.id
                                          ? "text-primary-foreground/80"
                                          : "text-muted-foreground"
                                      )}
                                    >
                                      {formatMessageTime(msg.createdAt)}
                                      {msg.sender_id === user?.id && (
                                        <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="12"
                                          height="12"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          className="ml-1"
                                        >
                                          <polyline points="20 6 9 17 4 12"></polyline>
                                        </svg>
                                      )}
                                    </p>
                                  </>
                                )}
                              </div>
                              {msg.sender_id === user?.id &&
                                editingMessageId !== msg.id && (
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="ml-2 h-6 w-6"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem
                                        onClick={() => handleStartEdit(msg)}
                                      >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        onClick={() =>
                                          setDeleteMessageId(msg.id)
                                        }
                                      >
                                        <Trash className="h-4 w-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                )}
                            </div>
                          </div>
                        </motion.div>
                      ))}

                    {isTyping && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex justify-start"
                      >
                        <div className="flex items-start">
                          <Avatar className="h-8 w-8 mr-2">
                            {selectedRecipient.avatar && (
                              <AvatarImage src={selectedRecipient.avatar} />
                            )}
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-muted">
                              {selectedRecipient.firstName[0]}
                              {selectedRecipient.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="bg-card border rounded-2xl rounded-bl-none px-3 py-2">
                            <div className="flex space-x-1">
                              <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{ repeat: Infinity, duration: 0.4 }}
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                              />
                              <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.4,
                                  delay: 0.2,
                                }}
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                              />
                              <motion.div
                                animate={{ y: [0, -4, 0] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: 0.4,
                                  delay: 0.4,
                                }}
                                className="w-2 h-2 bg-muted-foreground rounded-full"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="sticky bottom-0 bg-card/80 backdrop-blur-sm border-t p-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex gap-2 items-center"
              >
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Smile className="h-5 w-5" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 rounded-full bg-background border-muted"
                />
                <Button
                  onClick={handleSendMessage}
                  className="rounded-full h-11 w-11 p-0 bg-primary hover:bg-primary/90"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="max-w-md"
            >
              <div className="bg-muted/50 rounded-full p-5 mb-6 inline-block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-10 w-10 text-muted-foreground"
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Select a conversation
              </h3>
              <p className="text-muted-foreground mb-6">
                Choose a contact from the sidebar to start chatting or create a
                new conversation.
              </p>
              <Button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden"
              >
                Browse contacts
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}