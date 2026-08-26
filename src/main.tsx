import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SolarApp } from "@/components/solar/SolarApp";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SolarApp />
  </StrictMode>,
);
