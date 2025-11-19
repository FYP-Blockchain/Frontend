import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { fetchOrganizerEvents, deactivateEvent } from "@/features/events/eventSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Edit, Trash2, Eye, AlertTriangle, QrCode } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import useSmoothScrollToTop from "@/hooks/useSmoothScrollToTop";
import { isSelfCustodyEvent } from "@/lib/custody/custodyHelper";
import { deactivateEventOnChain } from "@/lib/blockchain/eventManager";
import apiClient from "@/services/api";

const MyEvents = () => {
  useSmoothScrollToTop();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { organizerEvents, loading, error } = useAppSelector((state) => state.events);
  const walletAddress = useAppSelector((state) => state.wallet.address);
  const [deactivatingEventId, setDeactivatingEventId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchOrganizerEvents());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error("Failed to perform action", { description: error });
    }
  }, [error]);

  const handleDeactivate = async (event: any) => {
    const isSelfCustody = isSelfCustodyEvent(event, walletAddress);
    
    if (isSelfCustody) {
      await handleSelfCustodyDeactivation(event);
    } else {
      await handleBackendDeactivation(event.id);
    }
  };

  const handleBackendDeactivation = async (eventId: string) => {
    dispatch(deactivateEvent(eventId)).then((result) => {
      if (deactivateEvent.fulfilled.match(result)) {
        toast.success("Event Deactivated", {
          description: `Event ID ${eventId} has been successfully deactivated.`,
        });
      }
    });
  };

  const handleSelfCustodyDeactivation = async (event: any) => {
    setDeactivatingEventId(event.id);
    try {
      toast.info("Confirm the MetaMask transaction to deactivate your event.");
      await deactivateEventOnChain(event.id);
      await apiClient.post(`/event/cache/evict?eventId=${event.id}`);
      toast.success("Event deactivated on-chain");
      dispatch(fetchOrganizerEvents());
    } catch (err: unknown) {
      console.error(err);
      const description = err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Self-custody deactivation failed", { description });
    } finally {
      setDeactivatingEventId(null);
    }
  };

  const renderSkeleton = () => (
    Array.from({ length: 3 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell><Skeleton className="h-5 w-24" /></TableCell>
        <TableCell><Skeleton className="h-5 w-16" /></TableCell>
        <TableCell><Skeleton className="h-5 w-12" /></TableCell>
        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="min-h-screen bg-gradient-hero py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Events Dashboard
          </h1>
          <Button asChild variant="hero">
            <Link to="/create-event">
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Event
            </Link>
          </Button>
        </div>

        <Card className="bg-glass/80 backdrop-blur-glass border-glass-border shadow-glass">
          <CardHeader>
            <CardTitle>Your Created Events</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? renderSkeleton() : (
                  organizerEvents.map((event: any) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.name}</TableCell>
                      <TableCell>{format(new Date(event.eventDate), "PPP")}</TableCell>
                      <TableCell>
                        <Badge variant={event.active ? "default" : "destructive"} className={event.active ? "bg-success" : ""}>
                          {event.active ? "Active" : "Deactivated"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/event/${event.id}`)} title="View Event">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/verify-ticket/${event.id}`)}
                          disabled={!event.active}
                          title="Verify Tickets"
                          className="text-primary hover:text-primary/80"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/edit-event/${event.id}`)} disabled={!event.active} title="Edit Event">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={!event.active} title="Deactivate Event">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-glass/80 backdrop-blur-glass border-glass-border">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center">
                                <AlertTriangle className="mr-2 text-destructive" />
                                Are you sure you want to deactivate this event?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. Deactivating the event will make it inactive on the platform, and new tickets cannot be sold.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeactivate(event)} className="bg-destructive hover:bg-destructive/90">
                                Deactivate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {!loading && organizerEvents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <p>You haven't created any events yet.</p>
                <Button variant="link" asChild><Link to="/create-event">Create your first event</Link></Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyEvents;