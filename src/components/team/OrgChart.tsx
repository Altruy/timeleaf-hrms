
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const OrgChart = ({ teamMembers, isLoading }) => {
  const [hierarchy, setHierarchy] = useState(null);
  
  useEffect(() => {
    if (teamMembers.length > 0) {
      buildHierarchy();
    }
  }, [teamMembers]);
  
  const buildHierarchy = () => {
    // Create a map of team members by id
    const membersMap = new Map();
    teamMembers.forEach(member => {
      membersMap.set(member.id, { ...member, children: [] });
    });
    
    // Build the hierarchy tree
    const rootNodes = [];
    
    membersMap.forEach(member => {
      if (!member.reports_to) {
        // This is a root node (no manager)
        rootNodes.push(member);
      } else if (membersMap.has(member.reports_to)) {
        // Add this member as a child to its manager
        const manager = membersMap.get(member.reports_to);
        manager.children.push(member);
      } else {
        // Manager not found, treat as root
        rootNodes.push(member);
      }
    });
    
    setHierarchy(rootNodes);
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hrms-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading organization chart...</p>
        </div>
      </div>
    );
  }
  
  if (!hierarchy || hierarchy.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No organization structure available</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex flex-col items-center min-w-[800px]">
        <div className="org-chart">
          {hierarchy.map((node) => (
            <OrgNode key={node.id} node={node} />
          ))}
        </div>
      </div>
    </div>
  );
};

const OrgNode = ({ node }) => {
  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };
  
  return (
    <div className="org-node">
      <Card className="w-64">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarFallback>{getInitials(node.users?.email)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h4 className="text-sm font-medium leading-none">{node.users?.email}</h4>
              <p className="text-xs text-muted-foreground">{node.position}</p>
              <p className="text-xs text-muted-foreground">{node.department}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {node.children.length > 0 && (
        <div className="org-children">
          {node.children.map((childNode) => (
            <OrgNode key={childNode.id} node={childNode} />
          ))}
        </div>
      )}
    </div>
  );
};

export default OrgChart;
