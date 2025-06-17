"use client";

import { useSocket } from "../hooks/use-socket";
import { Badge } from "./ui/badge";
import { Wifi, WifiOff } from "lucide-react";

export function WebSocketStatus() {
  const { isConnected } = useSocket();

  return (
    <Badge
      variant={isConnected ? "default" : "destructive"}
      className={`flex items-center gap-1 ${
        isConnected ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {isConnected ? (
        <>
          <Wifi className="h-3 w-3" />
          Connecté
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3" />
          Déconnecté
        </>
      )}
    </Badge>
  );
}
