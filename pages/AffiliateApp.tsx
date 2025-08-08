// ==============================================
// 1. AffiliateApp.tsx (NOUVEAU FICHIER)
// ==============================================

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase'; // Ajustez le chemin selon votre structure
import { AffiliateLogin } from './AffiliateLogin';
import { AffiliateDashboard } from './AffiliateDashboard';

export const AffiliateApp: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Observer les changements d'état d'authentification
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUserEmail(currentUser.email || '');
      } else {
        setUser(null);
        setUserEmail('');
      }
      setLoading(false);
    });

    // Nettoyer l'observer au démontage du composant
    return () => unsubscribe();
  }, []);

  const handleLogin = (email: string) => {
    // Cette fonction sera appelée après une connexion réussie
    // L'observer onAuthStateChanged se chargera de mettre à jour l'état
    setUserEmail(email);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // L'observer onAuthStateChanged mettra automatiquement à jour l'état
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Afficher un loader pendant la vérification de l'authentification
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF7F] mx-auto mb-4"></div>
          <p className="text-white">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  // Si l'utilisateur est connecté, afficher le dashboard
  if (user && userEmail) {
    return (
      <AffiliateDashboard 
        userEmail={userEmail} 
        onLogout={handleLogout}
      />
    );
  }

  // Sinon, afficher la page de connexion
  return (
    <AffiliateLogin 
      onLogin={handleLogin}
    />
  );
};