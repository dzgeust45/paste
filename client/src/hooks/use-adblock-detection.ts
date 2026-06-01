import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Clear any cached detection
        sessionStorage.removeItem("adBlockDetected");

        // Check if ANY element with adsbygoogle class is blocked
        const adElements = document.querySelectorAll(".adsbygoogle");
        
        let isBlocked = false;
        for (const element of adElements) {
          const style = window.getComputedStyle(element);
          if (
            style.display === "none" ||
            style.visibility === "hidden" ||
            element.offsetHeight === 0 ||
            element.offsetWidth === 0
          ) {
            isBlocked = true;
            break;
          }
        }

        setAdBlockDetected(isBlocked);
        setIsChecking(false);
      } catch (error) {
        console.log("Detection error:", error);
        setAdBlockDetected(false);
        setIsChecking(false);
      }
    };

    // Add delay to let DOM render
    const timer = setTimeout(detectAdBlock, 500);

    // Also listen for visibility changes
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setIsChecking(true);
        setTimeout(detectAdBlock, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { adBlockDetected, isChecking };
}
