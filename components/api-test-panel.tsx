"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  useHealthCheck,
  useUsers,
  useConversations,
  useUserOperations,
  useConversationOperations,
} from "../hooks/use-api";
import { useSocket } from "../hooks/use-socket";
import { User } from "../graphql/types";

export function ApiTestPanel() {
  const [testResults, setTestResults] = useState<Record<string, boolean>>({});
  const {
    data: healthData,
    loading: healthLoading,
    error: healthError,
    refetch: refetchHealth,
  } = useHealthCheck();
  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useUsers();
  const {
    data: conversationsData,
    loading: conversationsLoading,
    error: conversationsError,
  } = useConversations();
  const { isConnected: socketConnected } = useSocket();
  const { registerUser } = useUserOperations();
  const { startConversation } = useConversationOperations();

  const [testUser, setTestUser] = useState<any>(null);
  const [testConversation, setTestConversation] = useState<any>(null);

  useEffect(() => {
    setTestResults({
      health:
        !healthLoading &&
        !healthError &&
        (healthData?.healthCheck?.result === "OK" ||
          healthData?.healthCheck?.result === "ok"),
      users: !usersLoading && !usersError && Array.isArray(usersData?.users),
      conversations:
        !conversationsLoading &&
        !conversationsError &&
        Array.isArray(conversationsData?.conversations),
      websocket: socketConnected,
    });
  }, [
    healthLoading,
    healthError,
    healthData,
    usersLoading,
    usersError,
    usersData,
    conversationsLoading,
    conversationsError,
    conversationsData,
    socketConnected,
  ]);

  const createTestUser = async () => {
    try {
      const user = await registerUser({
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        avatarUrl: "https://via.placeholder.com/150",
      });
      setTestUser(user);
      console.log("Utilisateur de test créé:", user);
    } catch (error) {
      console.error(
        "Erreur lors de la création de l'utilisateur de test:",
        error
      );
    }
  };

  const createTestConversation = async () => {
    if (!usersData?.users || usersData.users.length < 2) {
      alert("Il faut au moins 2 utilisateurs pour créer une conversation");
      return;
    }

    try {
      const participants = usersData.users
        .slice(0, 2)
        .map((user: User) => user.id);
      const conversation = await startConversation({
        title: `Conversation de test ${Date.now()}`,
        participantIds: participants,
      });
      setTestConversation(conversation);
      console.log("Conversation de test créée:", conversation);
    } catch (error) {
      console.error(
        "Erreur lors de la création de la conversation de test:",
        error
      );
    }
  };

  const getStatusBadge = (status: boolean, loading?: boolean) => {
    if (loading) return <Badge variant="secondary">Test en cours...</Badge>;
    return status ? (
      <Badge variant="default" className="bg-green-500">
        ✅ OK
      </Badge>
    ) : (
      <Badge variant="destructive">❌ Erreur</Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tests de Connectivité API</CardTitle>
          <CardDescription>
            Vérification de la connexion avec l'API GraphQL et WebSocket
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {" "}
          {/* Health Check */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span>Health Check</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchHealth()}
                disabled={healthLoading}
              >
                🔄
              </Button>
            </div>
            {getStatusBadge(testResults.health, healthLoading)}
          </div>
          {healthData && (
            <div className="text-sm text-muted-foreground ml-4">
              Résultat: {healthData.healthCheck.result}
            </div>
          )}
          {healthError && (
            <div className="text-sm text-red-500 ml-4">
              Erreur: {healthError.message}
            </div>
          )}
          <Separator />
          {/* WebSocket */}
          <div className="flex justify-between items-center">
            <span>WebSocket</span>
            {getStatusBadge(testResults.websocket)}
          </div>
          <div className="text-sm text-muted-foreground ml-4">
            URL:{" "}
            {process.env.NEXT_PUBLIC_WEBSOCKET_URL || "http://localhost:3002"}
          </div>
          <Separator />
          {/* Utilisateurs */}
          <div className="flex justify-between items-center">
            <span>Requête Utilisateurs</span>
            {getStatusBadge(testResults.users, usersLoading)}
          </div>
          {usersData && (
            <div className="text-sm text-muted-foreground ml-4">
              {usersData.users.length} utilisateur(s) trouvé(s)
            </div>
          )}
          {usersError && (
            <div className="text-sm text-red-500 ml-4">
              Erreur: {usersError.message}
            </div>
          )}
          <Separator />
          {/* Conversations */}
          <div className="flex justify-between items-center">
            <span>Requête Conversations</span>
            {getStatusBadge(testResults.conversations, conversationsLoading)}
          </div>
          {conversationsData && (
            <div className="text-sm text-muted-foreground ml-4">
              {conversationsData.conversations.length} conversation(s)
              trouvée(s)
            </div>
          )}
          {conversationsError && (
            <div className="text-sm text-red-500 ml-4">
              Erreur: {conversationsError.message}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tests de Mutations</CardTitle>
          <CardDescription>
            Tester la création d'utilisateurs et de conversations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={createTestUser} variant="outline">
              Créer un utilisateur de test
            </Button>
            <Button onClick={createTestConversation} variant="outline">
              Créer une conversation de test
            </Button>
          </div>

          {testUser && (
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800">Utilisateur créé :</h4>
              <p className="text-sm text-green-700">
                {testUser.username} ({testUser.email})
              </p>
            </div>
          )}

          {testConversation && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800">
                Conversation créée :
              </h4>
              <p className="text-sm text-blue-700">
                {testConversation.title} -{" "}
                {testConversation.participants?.length} participants
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations de Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>GraphQL URL:</strong>
              <div className="text-muted-foreground">
                {process.env.NEXT_PUBLIC_GRAPHQL_URL ||
                  "http://localhost:3002/graphql"}
              </div>
            </div>
            <div>
              <strong>WebSocket URL:</strong>
              <div className="text-muted-foreground">
                {process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
                  "http://localhost:3002"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
