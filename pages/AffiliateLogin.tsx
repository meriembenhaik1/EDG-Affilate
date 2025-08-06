import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { User, Lock, LogIn } from 'lucide-react';

interface AffiliateLoginProps {
  onLogin: (email: string) => void;
}

export const AffiliateLogin: React.FC<AffiliateLoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email);
    }
  };

  return (
    <Layout title="Espace Affilié">
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#00FF7F] rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="text-black" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connexion Affilié</h2>
            <p className="text-gray-400">Accédez à votre dashboard personnalisé</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00FF7F] focus:border-transparent"
                  placeholder="votre@email.com"
                  required
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
                />
              </div>
            </div>

            <Button type="submit" className="w-full justify-center" size="lg">
              <LogIn size={20} className="mr-2" />
              Se connecter
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Première connexion ?{' '}
              <span className="text-[#00FF7F] cursor-pointer hover:underline">
                Contactez l'administrateur
              </span>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};