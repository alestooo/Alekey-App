import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop({ trigger }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const mainContent = document.querySelector("main");

    if (mainContent) {
      mainContent.scrollTo({
        top: 0,
        behavior: "instant",
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: "instant",
      });
    }
  }, [pathname, trigger]);

  return null;
}