import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, UserPlus } from "lucide-react";
import OrgChart from "@/components/team/OrgChart";
import TeamMemberList from "@/components/team/TeamMemberList";
import { supabase, EDGE_FUNCTION_URL, SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Team = () => {
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      
      const { data: teamMembersData, error: teamMembersError } = await supabase
        .from('team_members')
        .select('*')
        .order('department', { ascending: true });
      
      if (teamMembersError) throw teamMembersError;
      
      const userIds = teamMembersData.map(member => member.user_id);
      
      const response = await fetch(`${EDGE_FUNCTION_URL}/get_user_emails`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
        },
        body: JSON.stringify({ user_ids: userIds })
      });
      
      let usersData = [];
      
      if (response.ok) {
        usersData = await response.json();
      } else {
        console.error('Error fetching user emails:', await response.text());
        usersData = userIds.map(id => ({ 
          id, 
          email: `user-${id.substring(0, 8)}@example.com` 
        }));
      }
      
      const enhancedTeamMembers = teamMembersData.map(member => {
        const userEmail = usersData.find(u => u.id === member.user_id)?.email || 
                         `user-${member.user_id.substring(0, 8)}@example.com`;
        return {
          ...member,
          email: userEmail
        };
      });
      
      setTeamMembers(enhancedTeamMembers);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: "Error fetching team members",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert([formData])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Member added",
        description: "Team member has been added successfully."
      });
      
      setIsAddMemberOpen(false);
      fetchTeamMembers();
    } catch (error) {
      toast({
        title: "Error adding member",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Team</h1>
        <p className="text-muted-foreground">Manage your team members and organizational structure</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Team Management</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search members..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsAddMemberOpen(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add Member
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="org">Organization Chart</TabsTrigger>
            </TabsList>
            <TabsContent value="list">
              <TeamMemberList
                teamMembers={teamMembers}
                isLoading={isLoading}
                searchQuery={searchQuery}
                onRefresh={fetchTeamMembers}
              />
            </TabsContent>
            <TabsContent value="org">
              <OrgChart teamMembers={teamMembers} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <AddMemberForm onSubmit={handleAddMember} onCancel={() => setIsAddMemberOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

const AddMemberForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    department: '',
    position: '',
    reports_to: null,
    hire_date: new Date().toISOString().split('T')[0],
    status: 'active'
  });
  const [users, setUsers] = useState([]);
  const [managers, setManagers] = useState([]);

  useEffect(() => {
    fetchAvailableUsers();
    fetchManagers();
  }, []);

  const fetchAvailableUsers = async () => {
    try {
      const { data: existingUserIds, error: existingError } = await supabase
        .from('team_members')
        .select('user_id');
      
      if (existingError) throw existingError;
      
      const mockUsers = [
        { id: '123e4567-e89b-12d3-a456-426614174000', email: 'john.doe@example.com' },
        { id: '123e4567-e89b-12d3-a456-426614174001', email: 'jane.smith@example.com' },
        { id: '123e4567-e89b-12d3-a456-426614174002', email: 'bob.johnson@example.com' },
      ];
      
      const existingIds = existingUserIds?.map(item => item.user_id) || [];
      const availableUsers = mockUsers.filter(user => !existingIds.includes(user.id));
      
      setUsers(availableUsers);
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const fetchManagers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .or('position.ilike.%manager%,position.ilike.%lead%,position.ilike.%director%,position.ilike.%head%');
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const managerUserIds = data.map(manager => manager.user_id);
        
        const response = await fetch(`${EDGE_FUNCTION_URL}/get_user_emails`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_PUBLISHABLE_KEY}`
          },
          body: JSON.stringify({ user_ids: managerUserIds })
        });
        
        let usersData = [];
        
        if (response.ok) {
          usersData = await response.json();
        } else {
          usersData = managerUserIds.map(id => ({ 
            id, 
            email: `user-${id.substring(0, 8)}@example.com` 
          }));
        }
        
        const managersWithEmails = data.map(manager => {
          const userEmail = usersData.find(u => u.id === manager.user_id)?.email || 
                          `user-${manager.user_id.substring(0, 8)}@example.com`;
          return {
            ...manager,
            email: userEmail
          };
        });
        
        setManagers(managersWithEmails);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = { ...formData };
    if (submissionData.reports_to === "none") {
      submissionData.reports_to = null;
    }
    onSubmit(submissionData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="user_id">User</Label>
          <Select name="user_id" onValueChange={value => handleChange({ target: { name: 'user_id', value }})}>
            <SelectTrigger>
              <SelectValue placeholder="Select user" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="department">Department</Label>
            <Input 
              id="department" 
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="e.g., Engineering" 
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="position">Position</Label>
            <Input 
              id="position" 
              name="position"
              value={formData.position}
              onChange={handleChange}
              placeholder="e.g., Software Engineer" 
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hire_date">Hire Date</Label>
            <Input 
              id="hire_date" 
              name="hire_date"
              type="date"
              value={formData.hire_date}
              onChange={handleChange}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select 
              name="status" 
              value={formData.status}
              onValueChange={value => handleChange({ target: { name: 'status', value }})}
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="on-leave">On Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="reports_to">Reports To</Label>
          <Select 
            name="reports_to" 
            onValueChange={value => handleChange({ target: { name: 'reports_to', value: value || null }})}
          >
            <SelectTrigger id="reports_to">
              <SelectValue placeholder="Select manager" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {managers.map(manager => (
                <SelectItem key={manager.id} value={manager.id}>
                  {manager.email} ({manager.position})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Member</Button>
      </DialogFooter>
    </form>
  );
};

export default Team;
