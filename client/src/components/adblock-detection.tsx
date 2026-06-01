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
  const { adBlockDetected, isChecking } = useAdBlockDetection();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isChecking && adBlockDetected) {
      setOpen(true);
    }
  }, [adBlockDetected, isChecking]);

  // While checking, show normal content
  if (isChecking) {
    return <>{children}</>;
  }

  // If ad block detected (content was blocked), show dialog and hide content
  if (adBlockDetected) {
    return (
      <>
        <div className="hidden">{children}</div>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl">
                Ad Blocker Detected
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                Your ad blocker is blocking this content. Please disable it to
                view pastes on this site.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-3">
                <strong>How to disable ad blocker:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Click the ad blocker icon in your browser toolbar</li>
                <li>Select "Disable on this site"</li>
                <li>Refresh the page</li>
              </ul>
            </div>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => window.location.reload()}>
                Refresh After Disabling
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // No ad block detected, show content normally
  return <>{children}</>;
}
