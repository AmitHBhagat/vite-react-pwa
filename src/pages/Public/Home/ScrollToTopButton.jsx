import React, { useState, useEffect } from "react";
import { Button } from "rsuite";
import SortUpIcon from "@rsuite/icons/SortUp";
import useScrollEffect from "../../../utilities/useScrollEffect";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const animationDuration = 300; // milliseconds

  const handleScroll = () => {
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    const totalScrollableHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    // Show if scrolled past half, otherwise hide
    if (scrollPos > totalScrollableHeight / 5) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // useEffect(() => {
  //   window.addEventListener("scroll", handleScroll);
  //   // Cleanup listener
  //   return () => window.removeEventListener("scroll", handleScroll);
  // }, []);
  useScrollEffect(handleScroll);

  return (
    <Button
      appearance="primary"
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        height: "3rem",
        width: "3rem",
        borderRadius: "50%",
        transition: "transform 300ms ease, opacity 300ms ease",
        transform: isVisible ? "translateX(0)" : "translateX(100%)",
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      }
    >
      <SortUpIcon />
    </Button>
  );
};

export default ScrollToTopButton;
