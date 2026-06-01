import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Clear any cached detection
        sessionStorage.removeItem("adBlockDetected");

        // Check if ANY element with ad-related selectors is blocked by ad blocker
        const adSelectors = [
          ".adsbygoogle",
          ".advertisement",
          ".ad-banner",
          "#ad-container",
          "#ad-content",
          "#advertisement",
        ];

        let isBlocked = false;
        for (const selector of adSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const style = window.getComputedStyle(element);
            if (
              style.display === "none" ||
              style.visibility === "hidden" ||
              element.offsetHeight === 0 ||
              element.offsetWidth === 0 ||
              !document.body.contains(element)
            ) {
              isBlocked = true;
              break;
            }
          }
          if (isBlocked) break;
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
