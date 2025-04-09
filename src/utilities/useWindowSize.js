import { useState, useEffect } from "react";
import { BREAK_POINTS } from "./constants";

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
};

export const useSmallScreen = (breakpoint = BREAK_POINTS.MD) => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < breakpoint;
};
