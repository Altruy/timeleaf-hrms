
import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Plus, Search, FileDown, Table as TableIcon, Check, X } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Payroll = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddPayrollOpen, setIsAddPayrollOpen] = useState(false);
  const [payrolls, setPayrolls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetchPayrolls();
  }, []);
  
  const fetchPayrolls = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('payroll')
        .select(`
          id,
          salary,
          payment_date,
          payment_period_start,
          payment_period_end,
          status,
          user_id,
          auth.users (email, id)
        `)
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      setPayrolls(data || []);
    } catch (error) {
      console.error('Error fetching payroll:', error);
      toast({
        title: "Error fetching payroll data",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddPayroll = async (formData) => {
    try {
      const { data, error } = await supabase
        .from('payroll')
        .insert([formData])
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Payroll added",
        description: "Payroll record has been added successfully."
      });
      
      setIsAddPayrollOpen(false);
      fetchPayrolls();
    } catch (error) {
      toast({
        title: "Error adding payroll",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('payroll')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Status updated",
        description: `Payroll status has been updated to ${newStatus}.`
      });
      
      fetchPayrolls();
    } catch (error) {
      toast({
        title: "Error updating status",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const filteredPayrolls = payrolls.filter(payroll => {
    // Filter by search term
    if (searchTerm && !payroll.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Filter by tab
    if (activeTab !== "all" && payroll.status !== activeTab) {
      return false;
    }
    
    return true;
  });
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>;
      case 'processed':
        return <Badge className="bg-blue-100 text-blue-800">Processed</Badge>;
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Payroll</h1>
        <p className="text-muted-foreground">Manage employee payroll and payments</p>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Payroll Records</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by employee..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsAddPayrollOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Payroll
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="processed">Processed</TabsTrigger>
              <TabsTrigger value="paid">Paid</TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab}>
              <div className="flex justify-end mb-4 space-x-2">
                <Button variant="outline" size="sm">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export
                </Button>
                <Button variant="outline" size="sm">
                  <TableIcon className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hrms-primary mx-auto"></div>
                    <p className="mt-2 text-muted-foreground">Loading payroll data...</p>
                  </div>
                </div>
              ) : filteredPayrolls.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead>Payment Date</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayrolls.map((payroll) => (
                        <TableRow key={payroll.id}>
                          <TableCell>{payroll.users?.email}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {format(new Date(payroll.payment_date), "MMM d, yyyy")}
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(payroll.payment_period_start), "MMM d")} - {format(new Date(payroll.payment_period_end), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell className="font-medium">
                            {formatCurrency(payroll.salary)}
                          </TableCell>
                          <TableCell>{getStatusBadge(payroll.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-1">
                              {payroll.status === 'pending' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleUpdateStatus(payroll.id, 'processed')}
                                    title="Mark as processed"
                                  >
                                    <Check className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleUpdateStatus(payroll.id, 'paid')}
                                    title="Mark as paid"
                                  >
                                    <FileDown className="h-4 w-4 text-blue-600" />
                                  </Button>
                                </>
                              )}
                              {payroll.status === 'processed' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleUpdateStatus(payroll.id, 'paid')}
                                  title="Mark as paid"
                                >
                                  <FileDown className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No payroll records found</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsAddPayrollOpen(true)}
                    className="mt-2"
                  >
                    Create your first payroll record
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Add Payroll Dialog */}
      <Dialog open={isAddPayrollOpen} onOpenChange={setIsAddPayrollOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Payroll Record</DialogTitle>
          </DialogHeader>
          <AddPayrollForm onSubmit={handleAddPayroll} onCancel={() => setIsAddPayrollOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

// Add Payroll Form Component
const AddPayrollForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    user_id: '',
    salary: '',
    payment_date: new Date().toISOString().split('T')[0],
    payment_period_start: new Date().toISOString().split('T')[0],
    payment_period_end: new Date().toISOString().split('T')[0],
    status: 'pending'
  });
  const [users, setUsers] = useState([]);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select(`
          user_id,
          auth.users (email, id)
        `);
      
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      salary: parseFloat(formData.salary)
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="user_id">Employee</Label>
          <Select
            name="user_id"
            onValueChange={value => handleChange({ target: { name: 'user_id', value }})}
            required
          >
            <SelectTrigger id="user_id">
              <SelectValue placeholder="Select an employee" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.user_id} value={user.user_id}>
                  {user.users?.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="salary">Salary Amount</Label>
          <Input 
            id="salary" 
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="payment_date">Payment Date</Label>
            <Input 
              id="payment_date" 
              name="payment_date"
              type="date"
              value={formData.payment_date}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payment_period_start">Period Start</Label>
            <Input 
              id="payment_period_start" 
              name="payment_period_start"
              type="date"
              value={formData.payment_period_start}
              onChange={handleChange}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="payment_period_end">Period End</Label>
            <Input 
              id="payment_period_end" 
              name="payment_period_end"
              type="date"
              value={formData.payment_period_end}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select 
            name="status" 
            value={formData.status}
            onValueChange={value => handleChange({ target: { name: 'status', value }})}
            required
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processed">Processed</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Create Payroll</Button>
      </DialogFooter>
    </form>
  );
};

export default Payroll;
