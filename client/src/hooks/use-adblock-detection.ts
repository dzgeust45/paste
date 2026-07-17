import { useState, useEffect } from "react";

export function useAdBlockDetection() {
  const [adBlockDetected, setAdBlockDetected] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);

  useEffect(() => {
    // If already dismissed this session, never show again
    const dismissed = sessionStorage.getItem("adBlockDismissed");
    if (dismissed) {
      setAdBlockDetected(false);
      setIsChecking(false);
      return;
    }

    // Detect ad blocker with a bait element — ad blockers hide elements
    // with well-known ad class names by setting display:none or height:0
    const bait = document.createElement("div");
    bait.className =
      "adsbox pub_300x250 pub_300x250m pub_728x90 text-ad textAd text_ad text_ads text-ads";
    bait.style.cssText =
      "width:1px!important;height:1px!important;position:absolute!important;left:-10000px!important;top:-1000px!important;";
    document.body.appendChild(bait);

    // Give the ad blocker a tick to apply its CSS/rules
    const timer = setTimeout(() => {
      const style = window.getComputedStyle(bait);
      const blocked =
        bait.offsetHeight === 0 ||
        bait.clientHeight === 0 ||
        style.display === "none" ||
        style.visibility === "hidden";

      document.body.removeChild(bait);
      setAdBlockDetected(blocked);
      setIsChecking(false);
    }, 150);

    return () => {
      clearTimeout(timer);
      if (document.body.contains(bait)) document.body.removeChild(bait);
    };
  }, []);

  const dismissPopup = () => {
    sessionStorage.setItem("adBlockDismissed", "true");
    setAdBlockDetected(false);
  };

  return { adBlockDetected, isChecking, dismissPopup };
}
