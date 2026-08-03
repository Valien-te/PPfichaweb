import { Route, Routes } from "react-router";

import { FlujoGestion } from "@/features/FlujoGestion";
import { clienteMock } from "@/features/mock-data";
import { PortalPrincipal } from "@/features/PortalPrincipal";
import { SimulatorPanel } from "@/features/simulator/SimulatorPanel";
import { WhatsappHelpButton } from "@/features/WhatsappHelpButton";
import { AppHeaderBar } from "@/shared/components/base/AppHeaderBar";
import { Logo } from "@/shared/components/base/Logo";
import { Toaster } from "@/shared/components/base/Toaster";

export const App = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] text-foreground flex flex-col">
      <AppHeaderBar
        surface="default"
        sticky
        brand={<Logo brand="deudor" surface="light" />}
        actions={<span className="text-sm text-muted-foreground">{clienteMock.nombre}</span>}
      />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<PortalPrincipal />} />
          <Route path="/gestion/:gestionId/:pasoId" element={<FlujoGestion />} />
        </Routes>
      </div>
      <Toaster position="top-center" duration={2000} visibleToasts={2} />
      <WhatsappHelpButton ejecutivoLegal={clienteMock.ejecutivoLegal} />
      <SimulatorPanel />
    </div>
  );
};
