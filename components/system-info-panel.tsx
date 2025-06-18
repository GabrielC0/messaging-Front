"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Info,
  Server,
  Database,
  Cloud,
  Wifi,
  Clock,
  Settings,
  Zap,
} from "lucide-react";
import { getConnectionInfo, apolloConfig } from "@/lib/apollo-client";

export function SystemInfoPanel() {
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo());
  const [buildInfo, setBuildInfo] = useState({
    version: "1.0.0",
    buildTime: new Date().toISOString(),
  });
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionInfo(getConnectionInfo());
    }, 5000);

    setBuildInfo({
      version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
      buildTime: process.env.NEXT_PUBLIC_BUILD_TIME || new Date().toISOString(),
    });

    return () => clearInterval(interval);
  }, []);

  const getEnvironmentBadge = () => {
    if (connectionInfo.isProduction) {
      return <Badge className="bg-green-500">🌐 Production</Badge>;
    }
    return <Badge variant="secondary">🏠 Développement</Badge>;
  };

  const getConnectionBadge = () => {
    if (connectionInfo.isAvailable) {
      return <Badge className="bg-green-500">✅ Connecté</Badge>;
    }
    return <Badge variant="destructive">❌ Déconnecté</Badge>;
  };

  const formatUptime = () => {
    const uptime = process.uptime ? Math.floor(process.uptime()) : 0;
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = uptime % 60;
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Info className="h-4 w-4" />
          Infos Système
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          {" "}
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Informations Système - LAMG-Messages
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Statut de l'application */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Statut de l'Application
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Environnement
                </span>
                {getEnvironmentBadge()}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Connexion Backend
                </span>
                {getConnectionBadge()}
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Version</span>
                <Badge variant="outline">{buildInfo.version}</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Build</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(buildInfo.buildTime).toLocaleDateString("fr-FR")}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Configuration Backend */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="h-4 w-4" />
                Configuration Backend
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">
                  URL GraphQL
                </span>
                <div className="text-xs font-mono bg-muted p-2 rounded break-all">
                  {apolloConfig.BACKEND_URL}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Timeout</span>
                <Badge variant="outline">{apolloConfig.TIMEOUT_MS}ms</Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Intervalle de reconnexion
                </span>
                <Badge variant="outline">
                  {apolloConfig.RECONNECT_INTERVAL / 1000}s
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  État de connexion
                </span>
                <Badge variant="outline" className="capitalize">
                  {connectionInfo.connectionState}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Infrastructure Cloud */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                Infrastructure Cloud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {" "}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Base de données</span>
                </div>
                <div className="pl-6 space-y-1">
                  <div className="text-sm text-muted-foreground">
                    PostgreSQL sur Render.com ✅
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Hébergeur:
                    dpg-d17tma3uibrs7384okvg-a.oregon-postgres.render.com
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Base: nestjs_db_uce4 | Utilisateur: nestjs
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-600 border-green-200"
                  >
                    ✅ Configuré
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium">Cache & Queues</span>
                </div>
                <div className="pl-6 space-y-1">
                  <div className="text-sm text-muted-foreground">
                    Redis sur Upstash.io ✅
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Hébergeur: dominant-frog-28062.upstash.io:6379
                  </div>
                  <div className="text-xs text-muted-foreground">
                    TLS activé (rediss://) | Gestion des files d'attente
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs bg-green-50 text-green-600 border-green-200"
                  >
                    ✅ Configuré
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Backend API</span>
                </div>
                <div className="pl-6 space-y-1">
                  <div className="text-sm text-muted-foreground">
                    NestJS sur Render.com
                  </div>
                  <div className="text-xs text-muted-foreground">
                    GraphQL + REST API
                  </div>
                  <div className="text-xs font-mono bg-muted px-2 py-1 rounded text-[10px] break-all">
                    {apolloConfig.BACKEND_URL}
                  </div>
                  <Badge
                    variant={
                      connectionInfo.isAvailable ? "outline" : "destructive"
                    }
                    className={`text-xs ${
                      connectionInfo.isAvailable
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-red-50 text-red-600 border-red-200"
                    }`}
                  >
                    {connectionInfo.isAvailable
                      ? "✅ Connecté"
                      : "❌ Déconnecté"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métriques de Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Métriques de Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Mode de cache
                </span>
                <Badge variant="outline">
                  {connectionInfo.isProduction
                    ? "Cache-first"
                    : "Cache-and-network"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">DevTools</span>
                <Badge
                  variant={
                    connectionInfo.isProduction ? "destructive" : "default"
                  }
                >
                  {connectionInfo.isProduction ? "Désactivé" : "Activé"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Credentials
                </span>
                <Badge variant="outline">
                  {connectionInfo.isProduction ? "Omit" : "Include"}
                </Badge>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">CORS</span>
                <Badge
                  variant={
                    connectionInfo.isProduction ? "default" : "secondary"
                  }
                >
                  {connectionInfo.isProduction ? "Cross-origin" : "Same-origin"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer avec informations supplémentaires */}
        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h4 className="font-medium text-sm mb-2">
            🚀 Configuration Cloud Active
          </h4>
          <p className="text-xs text-muted-foreground">
            Votre application est maintenant configurée pour utiliser
            l'infrastructure cloud avec PostgreSQL et Redis hébergés. Plus
            besoin de base de données locale !
            {connectionInfo.isProduction && " Vous êtes en mode production."}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
