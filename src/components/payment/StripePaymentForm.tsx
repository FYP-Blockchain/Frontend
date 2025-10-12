import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, CreditCard } from "lucide-react";
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
               onPaymentSuccess(paymentIntentId);
               dispatch(resetPaymentState());
          }
     }, [paymentStatus, paymentIntentId, onPaymentSuccess, dispatch]);

     // Reset the processed flag when component mounts or payment method changes
     useEffect(() => {
          paymentProcessedRef.current = false;
          dispatch(resetPaymentState());
     }, [dispatch]);

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
                    disabled={!stripe || loading || disabled || !clientSecret}
               >
                    {loading ? (
                         <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Processing Payment...
                         </>
                    ) : (
                         <>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Complete Payment
                         </>
                    )}
               </Button>
          </form>
     );
};

export default StripePaymentForm;