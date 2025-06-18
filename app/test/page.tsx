"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Wifi,
  Database,
  MessageSquare,
} from "lucide-react";
import { useSocket } from "@/hooks/use-socket";
import { useNotifications } from "@/hooks/use-notifications";

export default function TestPage() {
  const [testResults, setTestResults] = useState<{
    [key: string]: "success" | "error" | "warning" | null;
  }>({});
  const { isConnected } = useSocket();
  const { requestPermission, permission, showTestNotification } =
    useNotifications();

  const runTest = (
    testName: string,
    testFn: () => boolean | Promise<boolean>
  ) => {
    const executeTest = async () => {
      try {
        const result = await testFn();
        setTestResults((prev) => ({
          ...prev,
          [testName]: result ? "success" : "error",
        }));
      } catch (error) {
        setTestResults((prev) => ({ ...prev, [testName]: "error" }));
        console.error(`Test ${testName} failed:`, error);
      }
    };
    executeTest();
  };

  const testWebSocket = () => {
    return isConnected;
  };
  const testNotifications = async () => {
    if (permission === "default") {
      await requestPermission();
    }
    if (permission === "granted") {
      showTestNotification();
      return true;
    }
    return false;
  };
  const testAPI = async () => {
    try {
      const response = await fetch("/api/health");
      if (response.ok) {
        const data = await response.json();
        return data.frontend === "healthy";
      }
      return false;
    } catch (error) {
      console.error("API test failed:", error);
      return false;
    }
  };

  const getStatusIcon = (status: "success" | "error" | "warning" | null) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: "success" | "error" | "warning" | null) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="default" className="bg-green-500">
            OK
          </Badge>
        );
      case "error":
        return <Badge variant="destructive">ERREUR</Badge>;
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-500">
            ATTENTION
          </Badge>
        );
      default:
        return <Badge variant="outline">NON TESTÉ</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Page de Test</h1>
        <p className="text-gray-600">Tests de fonctionnalité du système</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">WebSocket</CardTitle>
            <Wifi className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {" "}
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(testResults.websocket)}
              <span className="text-sm">
                Status: {isConnected ? "Connecté" : "Déconnecté"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              {getStatusBadge(testResults.websocket)}
              <Button
                size="sm"
                onClick={() => runTest("websocket", testWebSocket)}
              >
                Tester
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(testResults.notifications)}
              <span className="text-sm">Permission: {permission}</span>
            </div>
            <div className="flex justify-between items-center">
              {getStatusBadge(testResults.notifications)}
              <Button
                size="sm"
                onClick={() => runTest("notifications", testNotifications)}
              >
                Tester
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Backend</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {" "}
            <div className="flex items-center space-x-2 mb-4">
              {getStatusIcon(testResults.api)}
              <span className="text-sm">Route: /api/health</span>
            </div>
            <div className="flex justify-between items-center">
              {getStatusBadge(testResults.api)}
              <Button size="sm" onClick={() => runTest("api", testAPI)}>
                Tester
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Complet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            className="w-full"
            onClick={() => {
              runTest("websocket", testWebSocket);
              runTest("notifications", testNotifications);
              runTest("api", testAPI);
            }}
          >
            Lancer tous les tests
          </Button>
          <div className="text-sm text-gray-600">
            <p>
              <strong>WebSocket:</strong> Teste la connexion temps réel
            </p>
            <p>
              <strong>Notifications:</strong> Teste les notifications push des
              messages
            </p>
            <p>
              <strong>API:</strong> Teste la connectivité backend
            </p>
            <p className="mt-2 text-xs text-blue-600">
              💡 Pour tester les notifications des messages, assurez-vous
              d'abord d'autoriser les notifications, puis ouvrez deux onglets et
              envoyez un message depuis l'autre onglet.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
