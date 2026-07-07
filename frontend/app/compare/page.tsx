import ComparePage from "../components/compare/ComparePage";
import { Suspense } from "react";

export default function CompareRoute() {
  return (
    <Suspense fallback={<div style={{ background: "#050505", minHeight: "100vh", padding: "40px", color: "#fff", fontFamily: "monospace" }}>Cargando Comparador...</div>}>
      <ComparePage />
    </Suspense>
  );
}
