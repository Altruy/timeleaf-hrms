
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserMinus } from "lucide-react";

interface TeamMemberCardProps {
  id: string;
  email: string;
  role: string;
  department?: string;
  position?: string;
  onRemove: (id: string) => void;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  id,
  email,
  role,
  department,
  position,
  onRemove,
}) => {
  const getInitials = (email: string) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border">
      <div className="flex items-center">
        <Avatar className="h-9 w-9 mr-3">
          <AvatarFallback>{getInitials(email)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{email}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
          {department && position && (
            <p className="text-xs text-muted-foreground">
              {department} · {position}
            </p>
          )}
        </div>
      </div>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => onRemove(id)}
      >
        <UserMinus className="h-4 w-4" />
      </Button>
    </div>
  );
};
