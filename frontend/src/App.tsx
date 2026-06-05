import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import TabBar from "./components/layout/TabBar";
import IPLookup from "./pages/IPLookup";
import MyIP from "./pages/MyIP";
import DomainLookup from "./pages/DomainLookup";
import DNSLookup from "./pages/DNSLookup";
import ASNLookup from "./pages/ASNLookup";
import History from "./pages/History";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <TabBar />

        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/ip-lookup" replace />} />
            <Route path="/ip-lookup"     element={<IPLookup />}     />
            <Route path="/my-ip"         element={<MyIP />}         />
            <Route path="/domain-lookup" element={<DomainLookup />} />
            <Route path="/dns-lookup"    element={<DNSLookup />}    />
            <Route path="/asn-lookup"    element={<ASNLookup />}    />
            <Route path="/history"       element={<History />}      />
            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/ip-lookup" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="border-t border-cyber-border py-4 px-6 text-center">
          <p className="font-mono text-xs text-cyber-text-dim">
            Network Recon Toolkit — Built with React, TypeScript & Express.
            Data via{" "}
            <a
              href="https://ip-api.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-accent hover:underline"
            >
              ip-api.com
            </a>{" "}
            &{" "}
            <a
              href="https://bgpview.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyber-accent hover:underline"
            >
              BGPView
            </a>
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
};

export default App;