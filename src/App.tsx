import React from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { HomePage } from "@/pages/HomePage";
import { RegistryPage } from "@/pages/RegistryPage";
import { EntityInspectorPage } from "@/pages/EntityInspectorPage";
import { SchemaPage } from "@/pages/SchemaPage";
import { StatusPage } from "@/pages/StatusPage";
import { SecurityPage } from "@/pages/SecurityPage";
import { Toaster } from "@/components/ui/sonner";
export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/registry" element={<RegistryPage />} />
        <Route path="/registry/:id" element={<EntityInspectorPage />} />
        <Route path="/schemas" element={<SchemaPage />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/security" element={<SecurityPage />} />
      </Routes>
      <Toaster richColors position="top-right" />
    </AppShell>
  );
}