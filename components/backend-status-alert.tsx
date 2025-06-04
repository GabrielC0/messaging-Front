"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { isBackendAvailable } from "@/lib/apollo-client";

export function BackendStatusAlert() {
  const [visible, setVisible] = useState(false);
  const [backendStatus, setBackendStatus] = useState<
    "available" | "unavailable" | "port-conflict"
  >("available");
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);

  useEffect(() => {
    setBackendStatus(isBackendAvailable ? "available" : "unavailable");
    setVisible(!isBackendAvailable);

    const handleBackendUnreachable = (event: Event) => {
      const customEvent = event as CustomEvent;
      const error = customEvent.detail?.error;

      if (error?.code === "EADDRINUSE") {
        setBackendStatus("port-conflict");
      } else {
        setBackendStatus("unavailable");
      }

      setVisible(true);

      if (customEvent.detail?.consecutive) {
        setReconnectionAttempts(customEvent.detail.consecutive);
      }
    };

    const handleBackendReconnected = () => {
      setBackendStatus("available");
      setTimeout(() => setVisible(false), 3000);
      setReconnectionAttempts(0);
    };

    window.addEventListener("backend-unreachable", handleBackendUnreachable);
    window.addEventListener("backend-reconnected", handleBackendReconnected);
    window.addEventListener("apollo-network-error", handleBackendUnreachable);

    return () => {
      window.removeEventListener(
        "backend-unreachable",
        handleBackendUnreachable
      );
      window.removeEventListener(
        "backend-reconnected",
        handleBackendReconnected
      );
      window.removeEventListener(
        "apollo-network-error",
        handleBackendUnreachable
      );
    };
  }, []);

  if (!visible) return null;

  return (
    <Alert
      variant={backendStatus === "available" ? "default" : "destructive"}
      className="fixed bottom-4 right-4 max-w-[400px] z-50 animate-in slide-in-from-bottom-2"
    >
      <AlertTitle className="flex items-center justify-between">
        {backendStatus === "available"
          ? "Backend Connected"
          : backendStatus === "port-conflict"
          ? "Backend Port Conflict"
          : "Backend Connection Error"}
        <Button
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => setVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertTitle>
      <AlertDescription>
        {backendStatus === "available" ? (
          "Successfully reconnected to the backend server."
        ) : backendStatus === "port-conflict" ? (
          <>
            The backend server cannot start because port 3000 is already in use.
            <br />
            Please either:
            <ul className="list-disc ml-4 mt-2">
              <li>Stop any other services using port 3000</li>
              <li>Change the backend port in your environment configuration</li>
            </ul>
          </>
        ) : (
          <>
            Unable to connect to the backend server.
            {reconnectionAttempts > 0 && (
              <> Retried {reconnectionAttempts} times.</>
            )}
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
