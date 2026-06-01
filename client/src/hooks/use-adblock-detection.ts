import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // Add a small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      try {
        // Check if content marked as "ad" is being blocked
        const adContent = document.querySelector("[data-ad-block-test]");

        if (adContent) {
          // Check if the element has been hidden/removed by ad blocker
          const computedStyle = window.getComputedStyle(adContent);
          const isHidden =
            computedStyle.display === "none" ||
            computedStyle.visibility === "hidden" ||
            adContent.offsetHeight === 0 ||
            adContent.offsetWidth === 0;

          // Also check if element is removed from DOM
          const isRemoved = !document.body.contains(adContent);

          setAdBlockDetected(isHidden || isRemoved);
        } else {
          setAdBlockDetected(false);
        }

        setIsChecking(false);
      } catch (error) {
        setAdBlockDetected(false);
        setIsChecking(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, []);

  return { adBlockDetected, isChecking };
}
