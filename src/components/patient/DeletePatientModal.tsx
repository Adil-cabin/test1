import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, Lock } from 'lucide-react';
import DraggableModal from '../DraggableModal';

interface DeletePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  patientName: string;
}

export default function DeletePatientModal({
  isOpen,
  onClose,
  onConfirm,
  patientName
}: DeletePatientModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier le mot de passe (à adapter selon votre logique d'authentification)
    if (password === 'admin123') {
      onConfirm();
      setPassword('');
      setError('');
    } else {
      setError('Mot de passe incorrect');
    }
  };

  return (
    <DraggableModal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmation de suppression"
      className="w-full max-w-md"
    >
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-4 bg-red-50 rounded-lg">
          <AlertTriangle className="h-6 w-6 text-red-600" />
          <div className="text-sm text-red-700">
            <p className="font-medium">Attention !</p>
            <p>Vous êtes sur le point de supprimer définitivement le patient : <strong>{patientName}</strong></p>
            <p>Cette action supprimera également :</p>
            <ul className="list-disc list-inside mt-2">
              <li>Tous les rendez-vous associés</li>
              <li>L'historique des consultations</li>
              <li>Les données de paiement</li>
              <li>Les documents médicaux</li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              <div className="flex items-center">
                <Lock className="h-4 w-4 mr-2" />
                Mot de passe administrateur
              </div>
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </form>
      </div>
    </DraggableModal>
  );
}