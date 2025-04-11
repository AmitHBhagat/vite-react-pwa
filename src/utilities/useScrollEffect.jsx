import { useEffect } from "react";

const useScrollEffect = (handleScroll) => {
  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    document.body.classList.add("body-public");

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.body.classList.remove("body-public");
    };
  }, [handleScroll]);
};

export default useScrollEffect;
