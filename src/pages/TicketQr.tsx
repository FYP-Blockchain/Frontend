import React, { useState, useRef } from 'react';
import { useAppSelector } from '@/app/hooks';
import { RootState } from '@/app/store';
import { getQrData } from '@/services/api';
import { getUserNFTs } from '@/lib/helpers/ticketNFT';
import QRCode from 'react-qr-code';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { toast } from 'sonner';
import { Wallet, Loader2 } from 'lucide-react';

interface QrDataResponse {
     message: string;
     signature: string;
}

interface NFTItem {
     tokenId: string;
     metadata?: any;
}

const TicketQr: React.FC = () => {
     const walletAddress = useAppSelector((state: RootState) => state.wallet.address);
     const { currentUser } = useAppSelector((state: RootState) => state.auth);
     const [tokenId, setTokenId] = useState('');
     const [loading, setLoading] = useState(false);
     const [loadingNFTs, setLoadingNFTs] = useState(false);
     const [qrPayload, setQrPayload] = useState<QrDataResponse | null>(null);
     const [userNFTs, setUserNFTs] = useState<NFTItem[]>([]);
     const [showNFTSelection, setShowNFTSelection] = useState(false);
     const qrRef = useRef<HTMLDivElement>(null);

     const fetchUserNFTs = async () => {
          if (!walletAddress) {
               toast.error('Please connect your MetaMask wallet first');
               return;
          }

          if (!currentUser) {
               toast.error('Please log in to access this feature');
               return;
          }

          setLoadingNFTs(true);
          try {
               const nfts = await getUserNFTs(walletAddress);
               
               if (nfts.length === 0) {
                    toast.info('No NFT tickets found in your wallet');
               } else {
                    setUserNFTs(nfts);
                    setShowNFTSelection(true);
                    toast.success(`Found ${nfts.length} NFT ticket${nfts.length > 1 ? 's' : ''}`);
               }
          } catch (error: any) {
               console.error('Error fetching NFTs:', error);
               toast.error(error.message || 'Failed to fetch NFTs from MetaMask');
          } finally {
               setLoadingNFTs(false);
          }
     };

     const selectNFT = (nftTokenId: string) => {
          setTokenId(nftTokenId);
          setShowNFTSelection(false);
          toast.success(`Selected NFT Token #${nftTokenId}`);
          // Automatically fetch QR data after selection
          fetchQrDataForToken(nftTokenId);
     };

     const fetchQrDataForToken = async (selectedTokenId: string) => {
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
               const res = await getQrData(selectedTokenId, walletAddress);

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
                    toast.success('QR code generated successfully!');
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

     const fetchQrData = async () => {
          if (!tokenId) {
               toast.error('Please enter a tokenId or select from MetaMask');
               return;
          }

          await fetchQrDataForToken(tokenId);
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
                              Select your NFT ticket from MetaMask or enter the token ID manually.
                              {!currentUser && <span className="text-red-500 font-semibold"> You must be logged in to access this feature.</span>}
                         </p>

                         {/* Fetch NFTs from MetaMask Button */}
                         <Button
                              disabled={loadingNFTs || !currentUser || !walletAddress}
                              onClick={fetchUserNFTs}
                              className="w-full"
                              variant="default"
                         >
                              {loadingNFTs ? (
                                   <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Loading NFTs from MetaMask...
                                   </>
                              ) : (
                                   <>
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Select Your Ticket
                                   </>
                              )}
                         </Button>

                         {/* NFT Selection Grid */}
                         {showNFTSelection && userNFTs.length > 0 && (
                              <div className="space-y-2">
                                   <h3 className="font-semibold text-sm">Your NFT Tickets:</h3>
                                   <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto p-3 border rounded-lg bg-muted/20">
                                        {userNFTs.map((nft) => {
                                             // Extract ticket information from metadata
                                             const eventName = nft.metadata?.attributes?.find((a: any) => a.trait_type === 'Event')?.value || 
                                                             nft.metadata?.name || 
                                                             'Unknown Event';
                                             const seat = nft.metadata?.attributes?.find((a: any) => a.trait_type === 'Seat')?.value;
                                             const eventDate = nft.metadata?.attributes?.find((a: any) => a.trait_type === 'Event Date')?.value;
                                             const venue = nft.metadata?.attributes?.find((a: any) => a.trait_type === 'Venue')?.value;
                                             const imageUrl = nft.metadata?.image;

                                             return (
                                                  <Button
                                                       key={nft.tokenId}
                                                       variant="outline"
                                                       className="w-full justify-start text-left h-auto p-4 hover:bg-accent transition-colors"
                                                       onClick={() => selectNFT(nft.tokenId)}
                                                  >
                                                       <div className="flex gap-3 w-full">
                                                            {imageUrl && (
                                                                 <img 
                                                                      src={imageUrl} 
                                                                      alt={eventName}
                                                                      className="w-16 h-16 object-cover rounded-md"
                                                                      onError={(e) => {
                                                                           (e.target as HTMLImageElement).style.display = 'none';
                                                                      }}
                                                                 />
                                                            )}
                                                            <div className="flex-1 flex flex-col gap-1">
                                                                 <span className="font-semibold text-base">{eventName}</span>
                                                                 {seat && (
                                                                      <span className="text-sm text-muted-foreground">
                                                                           🪑 Seat: <span className="font-medium text-foreground">{seat}</span>
                                                                      </span>
                                                                 )}
                                                                 {eventDate && (
                                                                      <span className="text-xs text-muted-foreground">
                                                                           📅 {eventDate}
                                                                      </span>
                                                                 )}
                                                                 {venue && (
                                                                      <span className="text-xs text-muted-foreground">
                                                                           📍 {venue}
                                                                      </span>
                                                                 )}
                                                                 <span className="text-xs text-muted-foreground mt-1">
                                                                      Token ID: {nft.tokenId}
                                                                 </span>
                                                            </div>
                                                       </div>
                                                  </Button>
                                             );
                                        })}
                                   </div>
                                   <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setShowNFTSelection(false)}
                                        className="w-full"
                                   >
                                        Cancel
                                   </Button>
                              </div>
                         )}

                         {/* Divider */}
                         {!showNFTSelection && (
                              <div className="relative">
                                   <div className="absolute inset-0 flex items-center">
                                        <span className="w-full border-t" />
                                   </div>
                                   <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-background px-2 text-muted-foreground">
                                             Or enter manually
                                        </span>
                                   </div>
                              </div>
                         )}

                         {/* Manual Token ID Input */}
                         {!showNFTSelection && (
                              <>
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
                                        {loading ? 'Loading...' : 'Generate QR Code'}
                                   </Button>
                              </>
                         )}

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
