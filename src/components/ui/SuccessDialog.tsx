import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from 'lucide-react';

interface SuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: { id: string; name: string } | null;
  variant: 'created' | 'updated'; 
}

const SuccessDialog: React.FC<SuccessDialogProps> = ({ isOpen, onClose, event, variant }) => {
  const navigate = useNavigate();

  if (!event) return null;

  const handleViewEvent = () => {
    onClose();
    navigate(`/event/${event.id}`);
  };

  const handleSecondaryAction = () => {
    onClose();
    if (variant === 'updated') {
      navigate('/my-events');
    }
    // For 'created', onClose() is enough as the form is already reset.
  };
  
  // Conditionally set the text based on the variant
  const title = variant === 'created' ? "Event Created Successfully!" : "Event Updated Successfully!";
  const description = variant === 'created' 
    ? `Your event, "${event.name}", is now live on the blockchain.`
    : `Your changes to "${event.name}" have been saved to the blockchain.`;
  const secondaryButtonText = variant === 'created' ? "Create Another Event" : "Back to My Events";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-glass/80 backdrop-blur-glass border-glass-border shadow-glass">
        <DialogHeader className="text-center items-center">
          <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-success" />
          </div>
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
          <p className="text-muted-foreground pt-2">
            {description}
          </p>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button variant="outline" onClick={handleSecondaryAction} className="w-full">
            {secondaryButtonText}
          </Button>
          <Button variant="hero" onClick={handleViewEvent} className="w-full">
            View Event
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
