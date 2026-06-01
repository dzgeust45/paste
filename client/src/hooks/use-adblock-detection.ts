import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    const detectAdBlock = async () => {
      try {
        // Clear any cached detection
        sessionStorage.removeItem("adBlockDetected");

        // Method 1: Test if ad network requests are blocked (best for Brave)
        const testAdUrl =
          "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);

          const response = await fetch(testAdUrl, {
            method: "HEAD",
            mode: "no-cors",
            signal: controller.signal,
          });

          clearTimeout(timeoutId);

          // In no-cors mode, blocked requests still return 0 status
          if (response.status === 0) {
            setAdBlockDetected(true);
            setIsChecking(false);
            return;
          }
        } catch (error) {
          // Network error could mean blocked
          console.log("Network request error - likely ad blocker");
        }

        // Method 2: Test with baited elements (for extension blockers)
        const bait = document.createElement("div");
        bait.innerHTML = "&nbsp;";
        bait.className =
          "advertisement ads ad_banner pub_300x250 pub_300x600 pub_728x90";
        bait.id = "__ad_container__";
        bait.style.cssText =
          "width:1px;height:1px;position:absolute;left:-9999px;top:-9999px;";
        document.body.appendChild(bait);

        const isElementBlocked =
          bait.offsetHeight === 0 || bait.offsetWidth === 0;
        document.body.removeChild(bait);

        setAdBlockDetected(isElementBlocked);
        setIsChecking(false);
      } catch (error) {
        console.log("Detection error:", error);
        setAdBlockDetected(false);
        setIsChecking(false);
      }
    };

    // Run detection immediately
    detectAdBlock();

    // Also listen for visibility changes - when tab becomes active again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        setIsChecking(true);
        // Re-run detection when tab becomes visible
        setTimeout(detectAdBlock, 100);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return { adBlockDetected, isChecking };
}
