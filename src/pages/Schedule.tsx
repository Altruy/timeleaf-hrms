
import { useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarClock, Clock, Plus, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

const Schedule = () => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [view, setView] = useState("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  
  // Placeholder events data
  const events = [
    {
      id: "1",
      title: "Team Meeting",
      date: new Date(2023, 9, 15, 10, 0),
      type: "meeting",
      attendees: ["John Doe", "Jane Smith"]
    },
    {
      id: "2",
      title: "Project Deadline",
      date: new Date(2023, 9, 20),
      type: "deadline"
    },
    {
      id: "3",
      title: "1:1 with Manager",
      date: new Date(2023, 9, 18, 14, 30),
      type: "meeting",
      attendees: ["Manager"]
    }
  ];
  
  // Get events for the selected date
  const eventsForDate = date 
    ? events.filter(event => 
        event.date.getDate() === date.getDate() && 
        event.date.getMonth() === date.getMonth() && 
        event.date.getFullYear() === date.getFullYear()
      )
    : [];
    
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Schedule</h1>
        <p className="text-muted-foreground">Manage your calendar and events</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Calendar</CardTitle>
                <Button onClick={() => setAddEventOpen(true)} size="sm">
                  <Plus className="mr-1 h-4 w-4" />
                  New Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={view} onValueChange={setView}>
                <TabsList className="mb-4">
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                </TabsList>
                <TabsContent value="month" className="space-y-4">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm"
                  />
                </TabsContent>
                <TabsContent value="week">
                  <div className="p-8 text-center text-muted-foreground">
                    Week view coming soon
                  </div>
                </TabsContent>
                <TabsContent value="day">
                  <div className="p-8 text-center text-muted-foreground">
                    Day view coming soon
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {date ? format(date, "MMMM d, yyyy") : "No date selected"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForDate.length > 0 ? (
                <div className="space-y-4">
                  {eventsForDate.map((event) => (
                    <div key={event.id} className="flex items-start p-3 rounded-lg border">
                      <div className={`rounded-full p-2 mr-3 ${
                        event.type === 'meeting' ? 'bg-blue-100 text-blue-600' : 
                        event.type === 'deadline' ? 'bg-red-100 text-red-600' : 
                        'bg-green-100 text-green-600'
                      }`}>
                        {event.type === 'meeting' ? (
                          <Users className="h-5 w-5" />
                        ) : (
                          <Clock className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {event.date.getHours()}:{String(event.date.getMinutes()).padStart(2, '0')}
                        </p>
                        {event.attendees && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {event.attendees.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  <CalendarClock className="mx-auto h-12 w-12 opacity-30 mb-2" />
                  <p>No events scheduled for this day</p>
                  <Button 
                    variant="link" 
                    onClick={() => setAddEventOpen(true)}
                    className="mt-2"
                  >
                    Add Event
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event for your calendar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" placeholder="Enter event title" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                type="date" 
                defaultValue={date ? format(date, "yyyy-MM-dd") : undefined} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="eventType">Event Type</Label>
              <Select defaultValue="meeting">
                <SelectTrigger id="eventType">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="reminder">Reminder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Add details about this event"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddEventOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Schedule;
