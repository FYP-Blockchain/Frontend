import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { verifyTicket as verifyTicketApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import QrScanner from 'qr-scanner';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { ArrowLeft } from 'lucide-react';

interface VerificationResult {
     success: boolean;
     message: string;
     verifiedAt?: string;
     tokenId?: string;
     seat?: string;
     details?: Record<string, unknown>;
}

const parseQrPayload = (raw: string): { message: string; signature: string } => {
     // The QR from TicketQr.tsx encodes: JSON.stringify({ message, signature })
     // NOTE: eventId is NOT included in QR - must be entered manually
     try {
          const obj = JSON.parse(raw);
          if (obj && typeof obj === 'object') {
               return {
                    message: typeof obj.message === 'string' ? obj.message : '',
                    signature: typeof obj.signature === 'string' ? obj.signature : ''
               };
          }
     } catch (err) {
          // Not JSON, try other formats as fallback
          console.warn('QR is not JSON, trying other formats:', err);
     }

     // Fallback: URL with query params (in case user generates QR differently)
     try {
          const url = new URL(raw);
          return {
               message: url.searchParams.get('message') || '',
               signature: url.searchParams.get('signature') || ''
          };
     } catch (err) {
          // Not a URL either
     }

     // Last resort: treat entire string as message
     console.warn('Could not parse QR, treating as raw message');
     return { message: raw, signature: '' };
};

const extractQrText = (value: unknown): string => {
     console.log('extractQrText received:', typeof value, value);

     if (typeof value === 'string') {
          console.log('Value is already a string:', value);
          return value;
     }

     if (typeof value === 'object' && value !== null) {
          const maybeRecord = value as Record<string, unknown>;
          console.log('Value is object with keys:', Object.keys(maybeRecord));

          const data = maybeRecord['data'];
          if (typeof data === 'string') {
               console.log('Extracted data property:', data);
               return data;
          }

          // Some QR libraries return { text: ... } instead of { data: ... }
          const text = maybeRecord['text'];
          if (typeof text === 'string') {
               console.log('Extracted text property:', text);
               return text;
          }
     }

     console.warn('Could not extract text from:', value);
     return '';
};

const VerifyTicket: React.FC = () => {
     const navigate = useNavigate();
     const { eventId: urlEventId } = useParams<{ eventId?: string }>();
     const videoRef = useRef<HTMLVideoElement | null>(null);
     const scannerRef = useRef<QrScanner | null>(null);
     const fileInputRef = useRef<HTMLInputElement | null>(null);
     const { currentUser } = useAppSelector((state: RootState) => state.auth);
     const [eventId, setEventId] = useState(urlEventId || '');
     const [message, setMessage] = useState('');
     const [signature, setSignature] = useState('');
     const [verifying, setVerifying] = useState(false);
     const [result, setResult] = useState<VerificationResult | null>(null);
     const [cameraActive, setCameraActive] = useState(false);

     const isOrganizer = currentUser?.roles?.includes('ROLE_ORGANIZER');
     const token = localStorage.getItem('userToken');
     const hasEventIdFromUrl = Boolean(urlEventId);

     useEffect(() => {
          if (urlEventId) {
               setEventId(urlEventId);
          }
     }, [urlEventId]);

     useEffect(() => {
          return () => {
               scannerRef.current?.stop();
          };
     }, []);

     const startCamera = async () => {
          if (!isOrganizer) {
               toast.error('Only organizers can verify tickets');
               return;
          }

          if (!videoRef.current) return;
          try {
               scannerRef.current = new QrScanner(
                    videoRef.current,
                    (decoded) => {
                         const text = extractQrText(decoded);
                         if (text) handleDecoded(text);
                    },
                    { highlightScanRegion: true, highlightCodeOutline: true }
               );
               await scannerRef.current.start();
               setCameraActive(true);
               toast.info('Camera scanning started');
          } catch (e) {
               toast.error('Failed to access camera');
          }
     };

     const stopCamera = () => {
          scannerRef.current?.stop();
          setCameraActive(false);
     };

     const handleDecoded = (decoded: string) => {
          const parsed = parseQrPayload(decoded);

          console.log('Raw QR:', decoded);
          console.log('Parsed:', parsed);

          setMessage(parsed.message);
          setSignature(parsed.signature);

          if (parsed.message && parsed.signature) {
               toast.success('QR decoded successfully');
          } else {
               toast.warning('QR decoded but missing fields');
          }

          if (cameraActive) stopCamera();
     };

     const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0];
          if (!file) return;

          console.log('Attempting to scan QR from file:', file.name);

          try {
               const decoded = await QrScanner.scanImage(file, { returnDetailedScanResult: true });
               console.log('QR scan result (detailed):', decoded);
               const text = extractQrText(decoded);
               console.log('Extracted text:', text);

               if (text) {
                    handleDecoded(text);
               } else {
                    toast.error('QR decoded but no text found');
               }
          } catch (err) {
               console.error('QR scan error:', err);
               try {
                    const simpleDecoded = await QrScanner.scanImage(file, { returnDetailedScanResult: false });
                    console.log('QR scan result (simple):', simpleDecoded);
                    if (simpleDecoded) {
                         handleDecoded(simpleDecoded as string);
                    } else {
                         toast.error('Failed to decode QR - no data');
                    }
               } catch (err2) {
                    console.error('QR scan error (retry):', err2);
                    toast.error('Failed to decode QR image - ensure it\'s a valid QR code');
               }
          }
     };

     const verifyTicket = async () => {
          if (!eventId || !message || !signature) {
               toast.error('Event ID, Message and Signature are required');
               return;
          }

          if (!token) {
               toast.error('Please log in to verify tickets');
               return;
          }

          if (!isOrganizer) {
               toast.error('Access denied - Only organizers can verify tickets');
               return;
          }

          console.log('Auth token present:', !!token);
          console.log('Current user:', currentUser);
          console.log('Is organizer:', isOrganizer);

          setVerifying(true);
          setResult(null);

          const payload = { eventId, message, signature };
          console.log('Sending verification request:', payload);

          try {
               const res = await verifyTicketApi(payload);
               console.log('Verification response:', res.data);
               setResult(res.data);
               toast.success(res.data.message || 'Verification complete');
          } catch (e) {
               const err = e as { response?: { data?: string; status?: number } };
               console.error('Verification error:', err);

               if (err.response) {
                    const statusCode = err.response.status;
                    const errorMessage = err.response.data || 'An unexpected error occurred.';

                    // Display the error message in the snackbar
                    if (statusCode === 400) {
                         toast.error(errorMessage);
                    } else if (statusCode === 401) {
                         toast.error('Authentication failed - ' + errorMessage);
                    } else if (statusCode === 403) {
                         toast.error('Access denied - ' + errorMessage);
                    } else if (statusCode === 404) {
                         toast.error('Not Found - ' + errorMessage);
                    } else {
                         toast.error('Error: ' + errorMessage);
                    }
               } else {
                    toast.error('Network error or server is unreachable.');
               }
          } finally {
               setVerifying(false);
          }
     };

     const clearAll = () => {
          setEventId('');
          setMessage('');
          setSignature('');
          setResult(null);
     };

     return (
          <div className="container mx-auto py-12">
               <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                         <div className="flex items-center gap-4">
                              {hasEventIdFromUrl && (
                                   <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => navigate(-1)}
                                        title="Go back"
                                   >
                                        <ArrowLeft className="h-5 w-5" />
                                   </Button>
                              )}
                              <div className="flex-1">
                                   <CardTitle className="text-2xl">
                                        Ticket Verification {hasEventIdFromUrl && `- Event #${urlEventId}`}
                                   </CardTitle>
                                   {currentUser ? (
                                        isOrganizer ? (
                                             <p className="text-sm text-green-600 mt-2">
                                                  ✓ Logged in as: {currentUser.email || currentUser.username || 'User'}
                                                  <Badge className="ml-2 bg-green-600">ORGANIZER</Badge>
                                             </p>
                                        ) : (
                                             <p className="text-sm text-amber-600 mt-2">
                                                  ⚠ Logged in as: {currentUser.email || currentUser.username || 'User'}
                                                  <Badge className="ml-2 bg-amber-600">USER (No verification access)</Badge>
                                             </p>
                                        )
                                   ) : (
                                        <p className="text-sm text-red-600 mt-2">⚠ Not logged in - please sign in with an organizer account</p>
                                   )}
                              </div>
                         </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                         {!isOrganizer && (
                              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                   <p className="text-sm text-amber-800 font-medium">
                                        🔒 Access Restricted: Only organizers can verify tickets.
                                        {currentUser ? ' Your account does not have organizer privileges.' : ' Please log in with an organizer account.'}
                                   </p>
                              </div>
                         )}

                         <p className="text-sm text-muted-foreground">
                              Organizers can verify tickets by scanning a QR code via camera or uploading a QR image.
                              Parsed data can be adjusted before sending verification.
                         </p>

                         <div className="flex flex-wrap gap-3">
                              {!cameraActive ? (
                                   <Button
                                        onClick={startCamera}
                                        variant="default"
                                        disabled={!isOrganizer}
                                   >
                                        Start Camera Scan
                                   </Button>
                              ) : (
                                   <Button onClick={stopCamera} variant="destructive">Stop Camera</Button>
                              )}
                              <Button
                                   variant="outline"
                                   onClick={() => fileInputRef.current?.click()}
                                   disabled={!isOrganizer}
                              >
                                   Upload QR Image
                              </Button>
                              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                              <Button variant="secondary" onClick={clearAll}>Reset</Button>
                         </div>
                         {cameraActive && (
                              <div className="rounded overflow-hidden border p-2 w-full max-w-md">
                                   <video ref={videoRef} className="w-full" />
                              </div>
                         )}
                         <div className="space-y-4">
                              <div>
                                   <label className="text-sm font-medium mb-1 block">Event ID</label>
                                   <Input
                                        placeholder={hasEventIdFromUrl ? "Event ID (from event)" : "Event ID (enter manually)"}
                                        value={eventId}
                                        onChange={(e) => setEventId(e.target.value)}
                                        disabled={!isOrganizer || hasEventIdFromUrl}
                                        className={hasEventIdFromUrl ? "border-green-300 bg-green-50/50" : "border-amber-300 focus:ring-amber-500"}
                                   />
                                   {hasEventIdFromUrl && (
                                        <p className="text-xs text-green-600 mt-1">
                                             ✓ Event ID auto-filled from your event
                                        </p>
                                   )}
                              </div>
                              <Button
                                   disabled={verifying || !message.trim() || !signature.trim() || !eventId.trim() || !isOrganizer}
                                   onClick={verifyTicket}
                                   className="w-full"
                              >
                                   {verifying ? 'Verifying...' : 'Verify Ticket'}
                              </Button>
                              {(!message.trim() || !signature.trim() || !eventId.trim()) && isOrganizer && (
                                   <p className="text-xs text-muted-foreground text-center">
                                        {(!message.trim() || !signature.trim()) ? 'Scan QR to get ticket data' : ''}
                                        {(!message.trim() || !signature.trim()) && !eventId.trim() ? ' • ' : ''}
                                        {!eventId.trim() ? (hasEventIdFromUrl ? '' : 'Enter Event ID') : ''}
                                   </p>
                              )}
                         </div>
                         {result && (
                              <div className={`mt-4 p-4 rounded border ${result.success ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                                   <p className="font-semibold">{result.message}</p>
                                   {result.seat && <p className="text-sm mt-1">Seat: {result.seat}</p>}
                                   {result.verifiedAt && <p className="text-sm mt-1">Verified At: {new Date(result.verifiedAt).toLocaleString()}</p>}
                              </div>
                         )}
                    </CardContent>
               </Card>
          </div>
     );
};

export default VerifyTicket;
