"use client";

import { useEffect, useState } from "react";
import { useNotifications } from "../hooks/use-notifications";
import { useGlobalNotifications } from "../hooks/use-global-notifications";
import { useSocket } from "../hooks/use-socket";
import { useAuth } from "../contexts/auth-provider";

export function NotificationDebug() {
  const [isOpen, setIsOpen] = useState(false);
  const { permission, isReady, requestPermission, showTestNotification } =
    useNotifications();
  const { isListening, systemStatus } = useGlobalNotifications();
  const { isConnected, lastMessage } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    // Debug en console
    console.log("🔍 Debug Notifications:", {
      permission,
      isReady,
      isListening,
      systemStatus,
      isConnected,
      hasUser: !!user,
      lastMessage: lastMessage?.id,
      timestamp: new Date().toISOString(),
    });
  }, [
    permission,
    isReady,
    isListening,
    systemStatus,
    isConnected,
    user,
    lastMessage,
  ]);

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        zIndex: 9999,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "8px",
        padding: "10px",
        fontSize: "12px",
        maxWidth: "300px",
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{ marginBottom: "10px", padding: "5px 10px" }}
      >
        {isOpen ? "Masquer" : "Debug Notifications"}
      </button>

      {isOpen && (
        <div>
          <div>
            📱 Permission: <strong>{permission}</strong>
          </div>
          <div>
            ⚡ Ready: <strong>{isReady ? "Oui" : "Non"}</strong>
          </div>
          <div>
            👂 Listening: <strong>{isListening ? "Oui" : "Non"}</strong>
          </div>
          <div>
            🔌 Socket:{" "}
            <strong>{isConnected ? "Connecté" : "Déconnecté"}</strong>
          </div>
          <div>
            👤 User: <strong>{user?.username || "Non connecté"}</strong>
          </div>
          <div>
            💬 Last Message: <strong>{lastMessage?.id || "Aucun"}</strong>
          </div>

          <div style={{ marginTop: "10px" }}>
            <button
              onClick={requestPermission}
              style={{
                marginRight: "5px",
                padding: "3px 6px",
                fontSize: "11px",
              }}
              disabled={permission === "granted"}
            >
              Demander Permission
            </button>
            <button
              onClick={showTestNotification}
              style={{ padding: "3px 6px", fontSize: "11px" }}
              disabled={permission !== "granted"}
            >
              Test Notification
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
