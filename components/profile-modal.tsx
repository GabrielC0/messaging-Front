"use client";

import { useState, useEffect } from "react";
import { X, Camera, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-provider";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.username || "");

  // TODO: À implémenter plus tard - Cette mutation sera activée quand le backend GraphQL
  // supportera la mise à jour du profil utilisateur
  // const [updateUser, { loading: updateLoading }] = useMutation(UPDATE_USER);

  useEffect(() => {
    // Mettre à jour le nom si l'utilisateur change
    if (user?.username) {
      setName(user.username);
    }
  }, [user?.username]);

  if (!isOpen) return null;

  // Fonction pour formater les dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleSave = async () => {
    try {
      // TODO: À implémenter plus tard - Cette logique sera activée quand le backend GraphQL
      // supportera la mise à jour du profil utilisateur
      /*
      if (name !== user?.username) {
        await updateUser({
          variables: {
            input: {
              userId: user?.id,
              username: name
            }
          }
        });
      }
      */

      setIsEditing(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error);
      // Réinitialiser le nom en cas d'erreur
      setName(user?.username || "");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-medium">Profil</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-blue-700 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatarUrl || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-200 text-2xl">
                  {user?.username?.[0]}
                </AvatarFallback>
              </Avatar>
              <Button
                size="sm"
                className="absolute bottom-0 right-0 rounded-full bg-blue-600 hover:bg-blue-700 h-8 w-8 p-0 cursor-pointer"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            {isEditing ? (
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-blue-200 focus:border-blue-400 cursor-text"
              />
            ) : (
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <span>{name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="cursor-pointer"
                >
                  <Edit3 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="p-2 border border-gray-200 rounded bg-gray-50">
              <span className="text-gray-600">{user?.email}</span>
            </div>
          </div>

          {/* Dates */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Membre depuis
            </label>
            <div className="p-2 border border-gray-200 rounded bg-gray-50">
              <span className="text-gray-600">
                {user?.createdAt ? formatDate(user.createdAt) : "Date inconnue"}
              </span>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dernière mise à jour
            </label>
            <div className="p-2 border border-gray-200 rounded bg-gray-50">
              <span className="text-gray-600">
                {user?.updatedAt ? formatDate(user.updatedAt) : "Date inconnue"}
              </span>
            </div>
          </div>

          {/* Save Button when editing */}
          {isEditing && (
            <div className="flex justify-end mt-4">
              <Button
                onClick={handleSave}
                type="button"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Enregistrer
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
