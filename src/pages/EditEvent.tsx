import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchEventById, updateEvent, clearLastUpdatedEvent } from "@/features/events/eventSlice";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Tag, Loader2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import LoadingOverlay from "@/components/ui/LoadingOverlay";
import SuccessDialog from "@/components/ui/SuccessDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { compressImage } from "@/lib/image-compressor";

const eventSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  eventDate: z.date({ required_error: "Event date is required" }),
  totalSupply: z.coerce.number().min(1, "Total supply must be at least 1"),
  priceInEther: z.coerce.number().min(0, "Price must be 0 or greater"),
  description: z.string().min(10, "Description is required"),
  eventStartTime: z.string().min(1, "Start time is required"),
  eventEndTime: z.string().min(1, "End time is required"),
  imageFile: z.instanceof(FileList).optional(),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(3, "Location is required"),
});

type EventFormData = z.infer<typeof eventSchema>;

const EditEvent = () => {
  useSmoothScrollToTop();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentItem: event, loading, error, lastUpdatedEvent } = useAppSelector((state) => state.events);

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (event) {
      form.reset({
        name: event.name,
        eventDate: new Date(event.eventDate),
        totalSupply: event.totalSupply,
        priceInEther: Number(event.priceInWei) / 1e18,
        description: event.description,
        eventStartTime: format(new Date(event.eventStartTime), "HH:mm"),
        eventEndTime: format(new Date(event.eventEndTime), "HH:mm"),
        category: event.category,
        location: event.location,
      });
    }
  }, [event, form]);

  const onSubmit = async (data: EventFormData) => {
    const eventDateUTC = data.eventDate.toISOString().split('T')[0];

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('eventDateUTC', `${eventDateUTC}T00:00:00Z`);
    formData.append('totalSupply', data.totalSupply.toString());
    formData.append('priceInEther', data.priceInEther.toString());
    formData.append('description', data.description);
    formData.append('eventStartTime', `${eventDateUTC}T${data.eventStartTime}:00Z`);
    formData.append('eventEndTime', `${eventDateUTC}T${data.eventEndTime}:00Z`);
    formData.append('category', data.category);
    formData.append('location', data.location);
    
    if (data.imageFile && data.imageFile.length > 0) {
      const compressedImageFile = await compressImage(data.imageFile[0]);
      formData.append('imageFile', compressedImageFile, data.imageFile[0].name);
    }
    
    dispatch(updateEvent({ eventId: id, formData }));
  };
  
  useEffect(() => {
    if (error) {
      toast.error("Failed to Update Event", { description: error });
    }
  }, [error]);

  const handleCloseSuccessDialog = () => {
    dispatch(clearLastUpdatedEvent());
    navigate('/my-events'); // Navigate back after closing the dialog
  };

  const categories = ["Music", "Conference", "Workshop", "Art", "Sports", "Festival", "Other"];

  return (
    <>
      <LoadingOverlay isLoading={loading} text={form.formState.isSubmitting ? "Saving Changes..." : "Loading Event Details..."} />
      <SuccessDialog 
        isOpen={!!lastUpdatedEvent} 
        onClose={handleCloseSuccessDialog} 
        event={lastUpdatedEvent} 
        variant="updated"
      />
      <div className="min-h-screen bg-gradient-hero py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Edit Event
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Update the details for your event. Changes will be reflected on the blockchain.
            </p>
          </div>

          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border shadow-glass">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Edit className="h-6 w-6 mr-3 text-primary" />
                Editing: {event?.name || "..."}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Galle Music Festival" className="bg-glass/30 border-glass-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="category" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-glass/30 border-glass-border"><SelectValue placeholder="Select a category" /></SelectTrigger>
                          </FormControl>
                          <SelectContent>{categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Description</FormLabel>
                      <FormControl><Textarea placeholder="Tell everyone about your amazing event..." className="bg-glass/30 border-glass-border min-h-[120px]" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="location" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl><Input placeholder="e.g., Galle Fort, Sri Lanka" className="bg-glass/30 border-glass-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                     <FormField control={form.control} name="eventDate" render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Event Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button variant="outline" className={cn("w-full pl-3 text-left font-normal bg-glass/30 border-glass-border", !field.value && "text-muted-foreground")}>
                                {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date()} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="eventStartTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Time</FormLabel>
                        <FormControl><Input type="time" className="bg-glass/30 border-glass-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="eventEndTime" render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Time</FormLabel>
                        <FormControl><Input type="time" className="bg-glass/30 border-glass-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="totalSupply" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Tickets (Supply)</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 1000" className="bg-glass/30 border-glass-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="priceInEther" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price per Ticket (ETH)</FormLabel>
                        <FormControl><Input type="number" step="0.001" placeholder="e.g., 0.5" className="bg-glass/30 border-glass-border" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  
                  <FormField control={form.control} name="imageFile" render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Event Image (Optional)</FormLabel>
                      {event?.imageUrl && (
                        <div className="mt-2">
                          <p className="text-sm text-muted-foreground mb-2">Current Image:</p>
                          <img src={event.imageUrl} alt="Current event" className="w-32 h-32 object-cover rounded-md border border-glass-border" />
                        </div>
                      )}
                      <FormControl>
                        <Input type="file" accept="image/png, image/jpeg, image/gif" className="bg-glass/30 border-glass-border file:text-primary file:font-semibold" {...form.register("imageFile")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="pt-6">
                    <Button type="submit" variant="hero" size="lg" className="w-full text-lg" disabled={loading}>
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default EditEvent;
