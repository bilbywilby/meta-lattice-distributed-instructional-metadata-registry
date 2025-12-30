import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { RegistryPage } from "@/pages/RegistryPage";
import { Toaster } from "@/components/ui/sonner";
export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registry" element={<RegistryPage />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </AppShell>
  );
}