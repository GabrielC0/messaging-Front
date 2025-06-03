"use client"

import { useState } from "react"
import { X, Bell, Lock, Palette, Globe, HelpCircle, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [notifications, setNotifications] = useState(true)
  const [readReceipts, setReadReceipts] = useState(true)
  const [lastSeen, setLastSeen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex items-center justify-between">
          <h2 className="text-lg font-medium">Paramètres</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-blue-700 cursor-pointer">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Settings List */}
        <div className="flex-1 overflow-y-auto">
          {/* Notifications */}
          <div className="p-4 border-b border-blue-100 cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-medium">Notifications</h3>
                  <p className="text-sm text-gray-600">Recevoir les notifications</p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>

          {/* Privacy */}
          <div className="p-4 border-b border-blue-100">
            <div className="flex items-center space-x-3 mb-4">
              <Lock className="h-5 w-5 text-blue-600" />
              <h3 className="font-medium">Confidentialité</h3>
            </div>

            <div className="space-y-4 ml-8">
              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <h4 className="text-sm font-medium">Accusés de lecture</h4>
                  <p className="text-xs text-gray-600">Afficher quand vous avez lu les messages</p>
                </div>
                <Switch checked={readReceipts} onCheckedChange={setReadReceipts} />
              </div>

              <div className="flex items-center justify-between cursor-pointer">
                <div>
                  <h4 className="text-sm font-medium">Dernière connexion</h4>
                  <p className="text-xs text-gray-600">Afficher votre dernière connexion</p>
                </div>
                <Switch checked={lastSeen} onCheckedChange={setLastSeen} />
              </div>
            </div>
          </div>

          {/* Appearance */}
          <div className="p-4 border-b border-blue-100 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Palette className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Apparence</h3>
                <p className="text-sm text-gray-600">Thème et couleurs</p>
              </div>
            </div>
          </div>

          {/* Language */}
          <div className="p-4 border-b border-blue-100 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Globe className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Langue</h3>
                <p className="text-sm text-gray-600">Français</p>
              </div>
            </div>
          </div>

          {/* Help */}
          <div className="p-4 border-b border-blue-100 cursor-pointer">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">Aide</h3>
                <p className="text-sm text-gray-600">Centre d'aide et support</p>
              </div>
            </div>
          </div>

          {/* About */}
          <div className="p-4 cursor-pointer">
            <div className="flex items-center space-x-3">
              <Info className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-medium">À propos</h3>
                <p className="text-sm text-gray-600">Version 1.0.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
