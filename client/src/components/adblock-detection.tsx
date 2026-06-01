import { useState, useEffect } from "react";
import { useAdBlockDetection } from "@/hooks/use-adblock-detection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdBlockDetectionProps {
  children: React.ReactNode;
}

export function AdBlockDetection({ children }: AdBlockDetectionProps) {
  const { adBlockDetected, dismissPopup } = useAdBlockDetection();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (adBlockDetected) {
      setOpen(true);
    }
  }, [adBlockDetected]);

  const handleRefresh = () => {
    dismissPopup();
    setOpen(false);
  };

  return (
    <>
      {children}
      
      {/* Simple popup that shows when page loads */}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl">
              Ad Blocker Detected
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Your ad blocker is blocking content on this site. Please disable it to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-3">
              <strong>How to disable:</strong>
            </p>
            <ol className="text-sm text-muted-foreground space-y-2 list-decimal list-inside">
              <li>Click the ad blocker icon in your browser toolbar</li>
              <li>Select "Disable on this site"</li>
              <li>Click refresh below</li>
            </ol>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRefresh}>
              Refresh
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
