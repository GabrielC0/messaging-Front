"use client";

import { useState } from "react";
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
  const [name, setName] = useState(user?.name || "");
  const [status, setStatus] = useState(user?.status || "");

  if (!isOpen) return null;

  const handleSave = () => {
    // Ici vous pourriez mettre à jour les données
    setIsEditing(false);
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
                <AvatarImage src={user?.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-blue-200 text-2xl">
                  {user?.name?.[0]}
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
              Nom
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

          {/* Phone */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Téléphone
            </label>
            <div className="p-2 border border-gray-200 rounded bg-gray-50">
              <span className="text-gray-600">{user?.phone}</span>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            {isEditing ? (
              <Textarea
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border-blue-200 focus:border-blue-400 cursor-text"
                rows={2}
              />
            ) : (
              <div className="flex items-center justify-between p-2 border border-gray-200 rounded">
                <span>{status}</span>
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

          {/* Actions */}
          {isEditing && (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                className="flex-1 bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Enregistrer
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 cursor-pointer"
              >
                Annuler
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
