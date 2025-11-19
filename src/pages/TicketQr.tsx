import React, { useState, useRef } from 'react';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { getQrData } from '@/services/api';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';

interface QrDataResponse {
     message: string;
     signature: string;
}

const TicketQr: React.FC = () => {
     const walletAddress = useAppSelector((state: RootState) => state.wallet.address);
     const { currentUser } = useAppSelector((state: RootState) => state.auth);
     const [tokenId, setTokenId] = useState('');
     const [loading, setLoading] = useState(false);
     const [qrPayload, setQrPayload] = useState<QrDataResponse | null>(null);
     const qrRef = useRef<HTMLDivElement>(null);

     const fetchQrData = async () => {
          if (!tokenId) {
               toast.error('Please enter a tokenId');
               return;
          }

          const token = localStorage.getItem('userToken');
          if (!token || !currentUser) {
               toast.error('Please log in to generate QR codes');
               return;
          }

          if (!walletAddress) {
               toast.error('Wallet not connected');
               return;
          }

          setLoading(true);
          try {
               const res = await getQrData(tokenId, walletAddress);

               console.log('Backend API response:', res);
               console.log('Response data:', res.data);

               const mapped: QrDataResponse = {
                    message: res?.data?.message ?? '',
                    signature: res?.data?.signature ?? ''
               };

               console.log('Mapped QR payload:', mapped);
               console.log('QR will encode:', JSON.stringify({ message: mapped.message, signature: mapped.signature }));

               if (!mapped.message) {
                    toast.error('Empty QR message returned');
               } else {
                    setQrPayload(mapped);
                    toast.success('QR data loaded - check console for details');
               }
          } catch (e) {
               const err = e as { response?: { data?: { message?: string }; status?: number } };
               console.error('QR data fetch error:', err);

               if (err.response?.status === 401) {
                    toast.error('Authentication required - please log in');
               } else if (err.response?.status === 403) {
                    toast.error('Access denied - insufficient permissions');
               } else if (err.response?.status === 404) {
                    toast.error('Ticket not found - check your token ID');
               } else {
                    toast.error(err.response?.data?.message || 'Failed to load QR data');
               }
          } finally {
               setLoading(false);
          }
     };

     const downloadQrImage = () => {
          if (!qrRef.current) return;
          const svg = qrRef.current.querySelector('svg');
          if (!svg) return;

          const canvas = document.createElement('canvas');
          const scale = 4; 
          const size = 256; 
          canvas.width = size * scale;
          canvas.height = size * scale;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          const serializer = new XMLSerializer();
          const svgStr = serializer.serializeToString(svg);
          const img = new Image();

          img.onload = () => {
               ctx.imageSmoothingEnabled = false; 
               ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

               const pngUrl = canvas.toDataURL('image/png', 1.0);
               const link = document.createElement('a');
               link.href = pngUrl;
               link.download = `ticket-qr-${tokenId}.png`;
               link.click();

               toast.success('QR code downloaded');
          };

          img.onerror = () => {
               toast.error('Failed to generate QR image');
          };

          const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(svgBlob);
          img.src = url;
     };

     const copyQrData = () => {
          if (!qrPayload) return;
          const qrData = JSON.stringify({
               message: qrPayload.message,
               signature: qrPayload.signature
          });
          navigator.clipboard.writeText(qrData).then(() => {
               toast.success('QR data copied to clipboard');
          }).catch(() => {
               toast.error('Failed to copy');
          });
     };

     return (
          <div className="container mx-auto py-12">
               <Card className="max-w-xl mx-auto">
                    <CardHeader>
                         <CardTitle className="text-2xl">Generate Ticket QR</CardTitle>
                         {currentUser ? (
                              <p className="text-sm text-green-600">✓ Logged in as: {currentUser.email || currentUser.username || 'User'}</p>
                         ) : (
                              <p className="text-sm text-red-600">⚠ Please sign in to generate QR codes (Bearer token required)</p>
                         )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <p className="text-sm text-muted-foreground">
                              Enter your NFT token ID from MetaMask to generate a scannable QR code.
                              {!currentUser && <span className="text-red-500 font-semibold"> You must be logged in to access this feature.</span>}
                         </p>
                         <Input
                              placeholder="NFT Token ID from MetaMask"
                              value={tokenId}
                              onChange={(e) => setTokenId(e.target.value)}
                              disabled={!currentUser}
                         />
                         <Button
                              disabled={loading || !currentUser || !tokenId}
                              onClick={fetchQrData}
                              className="w-full"
                         >
                              {loading ? 'Loading...' : 'Fetch QR Data'}
                         </Button>
                         {qrPayload && (
                              <div className="space-y-4 flex flex-col items-center">
                                   <div ref={qrRef} className="p-4 bg-white inline-block rounded shadow">
                                        <QRCode
                                             value={JSON.stringify({ message: qrPayload.message || '', signature: qrPayload.signature || '' })}
                                             size={256}
                                             level="H"
                                        />
                                   </div>
                                   <Button variant="outline" onClick={downloadQrImage} className="w-full max-w-xs">Download PNG</Button>
                              </div>
                         )}
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2">
                         <p className="text-xs text-muted-foreground">Wallet: {walletAddress ? walletAddress : 'Not connected'}</p>
                         {!currentUser && (
                              <p className="text-xs text-red-500 font-medium">⚠ Authentication required</p>
                         )}
                    </CardFooter>
               </Card>
          </div>
     );
};

export default TicketQr;
