import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Send } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="container h-[calc(100vh-4rem)] px-4 md:px-6">
      <div className="grid h-full gap-6 lg:grid-cols-7">
        {/* Conversations List */}
        <Card className="col-span-2 flex flex-col">
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search messages..."
                className="pl-8"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={`https://i.pravatar.cc/150?img=${i}`} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 overflow-hidden">
                    <p className="font-medium">Contact Name</p>
                    <p className="truncate text-sm text-muted-foreground">
                      Latest message preview...
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">2m ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chat Area */}
        <Card className="col-span-5 flex flex-col">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="https://i.pravatar.cc/150?img=1" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Contact Name</CardTitle>
                <p className="text-sm text-muted-foreground">Active now</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}
                >
                  <div
                    className={`rounded-lg p-3 max-w-[70%] ${
                      i % 2 === 0
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p>This is a message in the chat.</p>
                    <p className="text-xs mt-1 opacity-70">2:30 PM</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input placeholder="Type a message..." />
              <Button size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}