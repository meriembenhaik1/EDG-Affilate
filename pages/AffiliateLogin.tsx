// ==============================================
// 2. AffiliateLogin.tsx (VERSION MISE À JOUR)
// ==============================================

import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase'; // Ajustez le chemin selon votre structure
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, Lock, LogIn, UserPlus, Mail, Phone } from 'lucide-react';

interface AffiliateLoginProps {
  onLogin?: (email: string) => void;
}

export const AffiliateLogin: React.FC<AffiliateLoginProps> = ({ onLogin }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      setLoading(true);
      setError('');

      if (password !== confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }

      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }

      // Créer le compte utilisateur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Mettre à jour le profil avec le nom
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      // Sauvegarder les données supplémentaires dans Firestore
      await setDoc(doc(db, 'affiliates', user.uid), {
        firstName,
        lastName,
        email,
        phone,
        role: 'affiliate',
        createdAt: new Date().toISOString(),
        isActive: true,
        earnings: 0,
        referrals: 0
      });

      // L'observer onAuthStateChanged dans AffiliateApp gérera automatiquement la redirection
      console.log('Inscription réussie, redirection automatique...');

    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('Cette adresse email est déjà utilisée');
          break;
        case 'auth/invalid-email':
          setError('Adresse email invalide');
          break;
        case 'auth/weak-password':
          setError('Le mot de passe est trop faible');
          break;
        default:
          setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // L'observer onAuthStateChanged dans AffiliateApp gérera automatiquement la redirection
      console.log('Connexion réussie, redirection automatique...');

    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      
      switch (error.code) {
        case 'auth/user-not-found':
          setError('Aucun compte trouvé avec cette adresse email');
          break;
        case 'auth/wrong-password':
          setError('Mot de passe incorrect');
          break;
        case 'auth/invalid-email':
          setError('Adresse email invalide');
          break;
        case 'auth/too-many-requests':
          setError('Trop de tentatives. Veuillez réessayer plus tard.');
          break;
        case 'auth/invalid-credential':
          setError('Identifiants invalides');
          break;
        default:
          setError('Erreur lors de la connexion. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      handleSignUp();
    } else {
      handleSignIn();
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setError('');
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  return (
    <Layout title="Espace Affilié">
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00FF7F] rounded-full flex items-center justify-center mx-auto mb-4">
              {isSignUp ? (
                <UserPlus className="text-black" size={32} />
              ) : (
                <LogIn className="text-black" size={32} />
              )}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isSignUp ? 'Inscription Affilié' : 'Connexion Affilié'}
            </h2>
            <p className="text-gray-400">
              {isSignUp 
                ? 'Créez votre compte d\'affilié' 
                : 'Accédez à votre dashboard personnalisé'
              }
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border border-red-500 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prénom
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF7F] focus:border-transparent"
                        placeholder="Prénom"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Nom
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF7F] focus:border-transparent"
                        placeholder="Nom"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF7F] focus:border-transparent"
                      placeholder="+33 6 12 34 56 78"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF7F] focus:border-transparent"
                  placeholder="votre@email.com"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF7F] focus:border-transparent"
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-400 mt-1">
                  Minimum 6 caractères
                </p>
              )}
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF7F] focus:border-transparent"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full justify-center" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  {isSignUp ? 'Création en cours...' : 'Connexion en cours...'}
                </div>
              ) : isSignUp ? (
                <>
                  <UserPlus size={20} className="mr-2" />
                  Créer mon compte
                </>
              ) : (
                <>
                  <LogIn size={20} className="mr-2" />
                  Se connecter
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              {isSignUp ? (
                <>
                  Déjà un compte ?{' '}
                  <span 
                    className="text-[#00FF7F] cursor-pointer hover:underline"
                    onClick={toggleMode}
                  >
                    Se connecter
                  </span>
                </>
              ) : (
                <>
                  Pas encore de compte ?{' '}
                  <span 
                    className="text-[#00FF7F] cursor-pointer hover:underline"
                    onClick={toggleMode}
                  >
                    S'inscrire
                  </span>
                </>
              )}
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};
