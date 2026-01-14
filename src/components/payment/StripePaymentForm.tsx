import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { createPaymentIntent, confirmPayment, resetPaymentState } from "@/features/payment/paymentSlice";

interface StripePaymentFormProps {
     eventId: number;
     onPaymentSuccess: (paymentIntentId: string) => void;
     disabled?: boolean;
}

interface RootState {
     payment: {
          loading: boolean;
          error: string | null;
          clientSecret: string | null;
          paymentIntentId: string | null;
          paymentStatus: string | null;
     };
}

const StripePaymentForm: React.FC<StripePaymentFormProps> = ({
     eventId,
     onPaymentSuccess,
     disabled = false,
}) => {
     const stripe = useStripe();
     const elements = useElements();
     const dispatch = useDispatch();
     const paymentProcessedRef = useRef(false);
     const [isProcessingSuccess, setIsProcessingSuccess] = useState(false);

     const {
          loading,
          error,
          clientSecret,
          paymentIntentId,
          paymentStatus
     } = useSelector((state: RootState) => state.payment);

     // Create payment intent when component mounts
     useEffect(() => {
          if (eventId && !clientSecret) {
               dispatch(createPaymentIntent({ eventId }));
          }
     }, [eventId, clientSecret, dispatch]);

     // Handle successful payment - only process once per component lifecycle
     useEffect(() => {
          if (paymentStatus === 'succeeded' && paymentIntentId && !paymentProcessedRef.current) {
               paymentProcessedRef.current = true;
               setIsProcessingSuccess(true); // Keep showing loader
               onPaymentSuccess(paymentIntentId);
               // Don't reset payment state here - let parent handle it
          }
     }, [paymentStatus, paymentIntentId, onPaymentSuccess]);

     // Reset the processed flag when component mounts
     useEffect(() => {
          paymentProcessedRef.current = false;
          // Only reset on initial mount, not on every render
     }, []);

     const handleSubmit = async (event: React.FormEvent) => {
          event.preventDefault();

          if (!stripe || !elements || !clientSecret || disabled) {
               return;
          }

          const cardElement = elements.getElement(CardElement);
          if (!cardElement) {
               return;
          }

          dispatch(confirmPayment({
               stripe,
               clientSecret,
               cardElement
          }));
     };

     return (
          <>
               {/* Full-page loading overlay */}
               {(loading || isProcessingSuccess) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                         <div className="bg-card p-8 rounded-xl shadow-2xl border border-glass-border max-w-md w-full mx-4">
                              <div className="flex flex-col items-center gap-4 text-center">
                                   <div className="relative">
                                        <Loader2 className="h-16 w-16 animate-spin text-primary" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                             <CreditCard className="h-6 w-6 text-primary" />
                                        </div>
                                   </div>
                                   <div className="space-y-2">
                                        <h3 className="text-xl font-semibold">
                                             {isProcessingSuccess ? 'Payment Successful!' : 'Processing Payment'}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                             {isProcessingSuccess 
                                                  ? 'Preparing your ticket...' 
                                                  : !clientSecret 
                                                       ? 'Initializing payment...' 
                                                       : 'Confirming your payment with Stripe...'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                             Please do not close this window
                                        </p>
                                   </div>
                              </div>
                         </div>
                    </div>
               )}

               <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-4 border border-glass-border rounded-lg bg-glass/20">
                         <Label className="text-sm font-medium mb-2 block">Card Details</Label>
                         <CardElement
                              options={{
                                   style: {
                                        base: {
                                             fontSize: '16px',
                                             color: '#424770',
                                             '::placeholder': {
                                                  color: '#aab7c4',
                                             },
                                        },
                                        invalid: {
                                             color: '#9e2146',
                                        },
                                   },
                                   disabled: loading || isProcessingSuccess,
                              }}
                         />
                    </div>

                    {error && (
                         <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                              <AlertCircle className="h-4 w-4" />
                              <span>{error}</span>
                         </div>
                    )}

                    <Button
                         type="submit"
                         variant="hero"
                         size="lg"
                         className="w-full"
                         disabled={!stripe || loading || disabled || !clientSecret || isProcessingSuccess}
                    >
                         {loading || isProcessingSuccess ? (
                              <>
                                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                   {isProcessingSuccess ? 'Preparing Ticket...' : 'Processing Payment...'}
                              </>
                         ) : (
                              <>
                                   <CreditCard className="h-4 w-4 mr-2" />
                                   Complete Payment
                              </>
                         )}
                    </Button>
               </form>
          </>
     );
};

export default StripePaymentForm;