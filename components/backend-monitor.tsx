"use client";

import { useEffect } from "react";
import {
  startBackendMonitoring,
  checkBackendAvailability,
} from "@/lib/apollo-client";

export function BackendMonitor() {
  useEffect(() => {
    checkBackendAvailability();

    const cleanup = startBackendMonitoring(30000);

    return cleanup;
  }, []);

  return null;
}
