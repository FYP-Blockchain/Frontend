import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { createEvent, clearLastCreatedEvent } from "@/features/events/eventSlice";
import { setWalletAddress, clearWalletAddress } from "@/features/wallet/walletReducer";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Tag, Loader2, Wallet, ShieldCheck, AlertCircle, TrendingUp, Percent } from "lucide-react";
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
import apiClient from "@/services/api";
import { getEventManagerContract, extractEventIdFromReceipt } from "@/lib/blockchain/eventManager";
import { requestConnectedAccount, ensureTargetNetwork } from "@/services/walletService";
import { parseEther } from "ethers";

const eventSchema = z.object({
  name: z.string().min(3, "Event name is required"),
  eventDate: z.date({ required_error: "Event date is required" }),
  totalSupply: z.coerce.number().min(1, "Total supply must be at least 1"),
  priceInEther: z.coerce.number().min(0, "Price must be 0 or greater"),
  description: z.string().min(10, "Description is required"),
  eventStartTime: z.string().min(1, "Start time is required"),
  eventEndTime: z.string().min(1, "End time is required"),
  imageFile: z.instanceof(FileList).refine(files => files?.length === 1, "Event image is required."),
  category: z.string().min(1, "Category is required"),
  location: z.string().min(3, "Location is required"),
  // Resale configuration
  resaleAllowed: z.boolean().default(true),
  maxResalePriceMultiplier: z.coerce.number().min(100, "Must be at least 100%").max(500, "Cannot exceed 500%").default(150),
  organizerResaleShare: z.coerce.number().min(0, "Cannot be negative").max(50, "Cannot exceed 50%").default(10),
});

type EventFormData = z.infer<typeof eventSchema>;
type CreationStrategy = "BACKEND_MANAGED" | "SELF_CUSTODY";

interface ImageUploadResponse {
  imageUrl: string;
}

const uploadImageToIpfs = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file, file.name);
  const { data } = await apiClient.post<ImageUploadResponse>(
    '/ipfs/upload/image',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  if (!data?.imageUrl) {
    throw new Error('Image upload failed. Missing IPFS URL.');
    }
  return data.imageUrl;
};

const uploadMetadataToIpfs = async (metadata: Record<string, unknown>) => {
  const payload = new URLSearchParams();
  payload.append('jsonContent', JSON.stringify(metadata));

  const { data } = await apiClient.post<string>(
    '/ipfs/upload',
    payload,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  if (!data) {
    throw new Error('Failed to upload metadata to IPFS.');
  }

  return `ipfs://${data}`;
};

const CreateEvent = () => {
  useSmoothScrollToTop();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error, lastCreatedEvent } = useAppSelector((state) => state.events);
  const walletAddress = useAppSelector((state) => state.wallet.address);
  const [isCompressing, setIsCompressing] = useState(false);
  const [creationStrategy, setCreationStrategy] = useState<CreationStrategy>("BACKEND_MANAGED");
  const [isSelfCustodySubmitting, setIsSelfCustodySubmitting] = useState(false);
  const [selfCustodyEvent, setSelfCustodyEvent] = useState<{ id: string; name: string } | null>(null);
  const strategyOptions = [
    {
      key: "BACKEND_MANAGED" as CreationStrategy,
      title: "Platform Managed",
      description: "We publish the event using the platform operator and cover the gas fees.",
      icon: ShieldCheck,
    },
    {
      key: "SELF_CUSTODY" as CreationStrategy,
      title: "Self-Custody (MetaMask)",
      description: "You sign the transaction with MetaMask and pay the gas to keep full control.",
      icon: Wallet,
    },
  ];

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      name: "",
      totalSupply: 100,
      priceInEther: 0.1,
      description: "",
      eventStartTime: "20:00",
      eventEndTime: "23:00",
      category: "",
      location: "",
      // Resale defaults
      resaleAllowed: true,
      maxResalePriceMultiplier: 150,
      organizerResaleShare: 10,
    },
  });

  const successEvent = selfCustodyEvent ?? lastCreatedEvent;

  const onSubmit = async (data: EventFormData) => {
    try {
      setIsCompressing(true);
      const eventDateUTC = data.eventDate.toISOString().split('T')[0];
      const originalImageFile = data.imageFile[0];
      const compressedImageFile = await compressImage(originalImageFile);

      const formData = new FormData();
      const normalizedEventDate = `${eventDateUTC}T00:00:00Z`;
      formData.append('name', data.name);
      formData.append('eventDateUTC', normalizedEventDate);
      formData.append('totalSupply', data.totalSupply.toString());
      formData.append('priceInEther', data.priceInEther.toString());
      formData.append('description', data.description);
      formData.append('eventStartTime', `${eventDateUTC}T${data.eventStartTime}:00Z`);
      formData.append('eventEndTime', `${eventDateUTC}T${data.eventEndTime}:00Z`);
      formData.append('imageFile', compressedImageFile, originalImageFile.name);
      formData.append('category', data.category);
      formData.append('location', data.location);
      // Resale configuration
      formData.append('resaleAllowed', String(data.resaleAllowed));
      formData.append('maxResalePriceMultiplier', data.maxResalePriceMultiplier.toString());
      formData.append('organizerResaleShare', (data.organizerResaleShare * 100).toString()); // Convert to basis points

      setIsCompressing(false);

      if (creationStrategy === "SELF_CUSTODY") {
        await handleSelfCustodyCreation({
          eventDateUTC,
          formValues: data,
          compressedImageFile,
        });
        return;
      }

      dispatch(createEvent(formData));
    } catch (err: unknown) {
      console.error(err);
      const description = err instanceof Error ? err.message : "Please try again.";
      toast.error("Unable to prepare your event", {
        description,
      });
      setIsCompressing(false);
    }
  };

  const handleSelfCustodyCreation = async ({
    eventDateUTC,
    formValues,
    compressedImageFile,
  }: {
    eventDateUTC: string;
    formValues: EventFormData;
    compressedImageFile: File;
  }) => {
    if (!window.ethereum) {
      toast.info("MetaMask is required", {
        description: "Install the MetaMask extension to continue.",
      });
      return;
    }

    if (!walletAddress) {
      toast.error("Wallet not connected", {
        description: "Connect your MetaMask wallet to deploy from your account.",
      });
      return;
    }

    setIsSelfCustodySubmitting(true);
    try {
      const imageUrl = await uploadImageToIpfs(compressedImageFile);
      const eventStartTime = `${eventDateUTC}T${formValues.eventStartTime}:00Z`;
      const eventEndTime = `${eventDateUTC}T${formValues.eventEndTime}:00Z`;
      const metadata = {
        description: formValues.description,
        image: imageUrl,
        location: formValues.location,
        eventStartTime,
        eventEndTime,
        category: formValues.category,
      };

      const metadataURI = await uploadMetadataToIpfs(metadata);
      const normalizedEventDate = `${eventDateUTC}T00:00:00Z`;
      const ticketPrice = parseEther(formValues.priceInEther.toString());
      const eventTimestamp = BigInt(Math.floor(new Date(normalizedEventDate).getTime() / 1000));
      
      // Convert resale share from percentage to basis points (e.g., 10% = 1000 bps)
      const organizerResaleShareBps = BigInt(formValues.organizerResaleShare * 100);

      const { contract } = await getEventManagerContract();
      toast.info("Confirm the MetaMask transaction to publish your event.");
      const tx = await contract.createEvent(
        formValues.name,
        eventTimestamp,
        BigInt(formValues.totalSupply),
        ticketPrice,
        metadataURI,
        BigInt(formValues.maxResalePriceMultiplier),
        organizerResaleShareBps,
        formValues.resaleAllowed
      );

      const receipt = await tx.wait();
      const createdEventId = extractEventIdFromReceipt(receipt);
      if (!createdEventId) {
        throw new Error("Could not locate EventCreated log in the transaction receipt.");
      }
      const { data: registeredEvent } = await apiClient.post("/event/self-custody/register", {
        eventId: createdEventId,
      });

      toast.success("Event deployed with your wallet");
      setSelfCustodyEvent({ id: registeredEvent.id, name: registeredEvent.name });
      form.reset();
    } catch (err: unknown) {
      console.error(err);
      const description = err instanceof Error ? err.message : "Something went wrong during deployment.";
      toast.error("Self-custody deployment failed", { description });
    } finally {
      setIsSelfCustodySubmitting(false);
    }
  };
  
  useEffect(() => {
    if (lastCreatedEvent) {
      form.reset();
    }
    if (error) {
      toast.error("Event Creation Failed", {
        description: error || "There was an issue creating your event.",
      });
    }
  }, [lastCreatedEvent, error, form]);

  const handleCloseSuccessDialog = () => {
    if (selfCustodyEvent) {
      setSelfCustodyEvent(null);
    }
    dispatch(clearLastCreatedEvent());
  };

  const handleInlineWalletConnect = async () => {
    try {
      const account = await requestConnectedAccount();
      await ensureTargetNetwork();
      dispatch(setWalletAddress(account));
      toast.success("Wallet connected", {
        description: `${account.substring(0, 6)}...${account.slice(-4)}`,
      });
    } catch (err: unknown) {
      const description = err instanceof Error ? err.message : undefined;
      toast.error("Wallet connection failed", description ? { description } : undefined);
    }
  };

  const handleInlineWalletDisconnect = () => {
    dispatch(clearWalletAddress());
    toast.info("Wallet disconnected for this session.");
  };

  const categories = ["Music", "Conference", "Workshop", "Art", "Sports", "Festival", "Other"];

  const isSubmitting = loading || isCompressing || isSelfCustodySubmitting;
  const overlayText = isCompressing
    ? "Compressing Image..."
    : isSelfCustodySubmitting
      ? "Awaiting MetaMask confirmation"
      : "Creating Your Event on the Blockchain...";

  return (
    <>
      <LoadingOverlay 
        isLoading={isSubmitting} 
        text={overlayText} 
      />
      <SuccessDialog 
        isOpen={!!successEvent}
        onClose={handleCloseSuccessDialog}
        event={successEvent}
        variant={"created"}
      />
      <div className="min-h-screen bg-gradient-hero py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
              Create Your Event
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fill in the details below to mint your event on the blockchain and start selling NFT tickets.
            </p>
          </div>

          <Card className="bg-glass/80 backdrop-blur-glass border-glass-border shadow-glass">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <Tag className="h-6 w-6 mr-3 text-primary" />
                Event Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  <div className="space-y-4">
                    <FormLabel className="text-base">Deployment Strategy</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {strategyOptions.map((option) => {
                        const Icon = option.icon;
                        const isActive = creationStrategy === option.key;
                        return (
                          <button
                            type="button"
                            key={option.key}
                            onClick={() => setCreationStrategy(option.key)}
                            className={cn(
                              "flex flex-col items-start rounded-xl border p-4 text-left transition-all",
                              "bg-glass/30 border-glass-border hover:border-primary/50",
                              isActive && "border-primary bg-primary/10 shadow-glow"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                              <p className="font-semibold">{option.title}</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">{option.description}</p>
                          </button>
                        );
                      })}
                    </div>
                    {creationStrategy === "SELF_CUSTODY" && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm space-y-3">
                        <div className="flex items-start gap-2 text-primary">
                          <AlertCircle className="h-4 w-4 mt-0.5" />
                          <div>
                            <p className="font-semibold">You will sign and pay gas using MetaMask.</p>
                            <p className="text-muted-foreground">Make sure the wallet contains enough ETH on the selected network.</p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <p className="text-muted-foreground">
                            {walletAddress
                              ? `Connected wallet: ${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)}`
                              : "No wallet connected."}
                          </p>
                          <div className="flex gap-2">
                            {!walletAddress ? (
                              <Button type="button" variant="outline" onClick={handleInlineWalletConnect}>
                                Connect Wallet
                              </Button>
                            ) : (
                              <Button type="button" variant="ghost" onClick={handleInlineWalletDisconnect}>
                                Disconnect
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
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
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                      <FormLabel>Event Image / Flyer</FormLabel>
                      <FormControl>
                        <Input type="file" accept="image/png, image/jpeg, image/gif" className="bg-glass/30 border-glass-border file:text-primary file:font-semibold" {...form.register("imageFile")} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {/* Resale Configuration Section */}
                  <div className="pt-4">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Ticket Resale Configuration</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure how your tickets can be resold on the marketplace. This helps prevent scalping while allowing legitimate resales.
                    </p>
                    
                    <div className="space-y-4 bg-glass/20 p-4 rounded-lg border border-glass-border">
                      <FormField control={form.control} name="resaleAllowed" render={({ field }) => (
                        <FormItem className="flex items-center justify-between">
                          <div>
                            <FormLabel className="text-base">Allow Ticket Resale</FormLabel>
                            <p className="text-sm text-muted-foreground">Enable ticket holders to resell on the marketplace</p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )} />
                      
                      {form.watch("resaleAllowed") && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                            <FormField control={form.control} name="maxResalePriceMultiplier" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <Percent className="h-4 w-4" />
                                  Max Resale Price (% of original)
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="100" 
                                    max="500" 
                                    placeholder="e.g., 150" 
                                    className="bg-glass/30 border-glass-border" 
                                    {...field} 
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  e.g., 150% means tickets can be resold for up to 1.5x the original price
                                </p>
                                <FormMessage />
                              </FormItem>
                            )} />
                            
                            <FormField control={form.control} name="organizerResaleShare" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="flex items-center gap-1">
                                  <TrendingUp className="h-4 w-4" />
                                  Your Share of Resale Profit (%)
                                </FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    min="0" 
                                    max="50" 
                                    placeholder="e.g., 10" 
                                    className="bg-glass/30 border-glass-border" 
                                    {...field} 
                                  />
                                </FormControl>
                                <p className="text-xs text-muted-foreground">
                                  % of profit (above original price) you receive on each resale
                                </p>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                          
                          <div className="bg-primary/10 p-3 rounded-md text-sm">
                            <p className="font-medium text-primary">Example:</p>
                            <p className="text-muted-foreground">
                              If original price is 0.1 ETH and max resale is {form.watch("maxResalePriceMultiplier")}%, 
                              tickets can be resold for up to {(0.1 * form.watch("maxResalePriceMultiplier") / 100).toFixed(4)} ETH.
                              On a resale at max price, you would receive {form.watch("organizerResaleShare")}% of the {((0.1 * form.watch("maxResalePriceMultiplier") / 100) - 0.1).toFixed(4)} ETH profit.
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button type="submit" variant="hero" size="lg" className="w-full text-lg" disabled={loading || isCompressing}>
                      {loading || isCompressing ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          {isCompressing ? "Compressing Image..." : "Submitting to Blockchain..."}
                        </>
                      ) : (
                        "Create Event"
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

export default CreateEvent;
