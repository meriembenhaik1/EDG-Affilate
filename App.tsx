import React from 'react';
import { AdminDashboard } from './pages/AdminDashboard';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { Shield, Users } from 'lucide-react';
import { AffiliateApp } from './pages/AffiliateApp';
import { useState } from 'react';

type ViewType = 'home' | 'admin' | 'affiliate';

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const handleAdminLogout = () => {
    setCurrentView('home');
  };

  if (currentView === 'admin') {
    return <AdminDashboard onLogout={handleAdminLogout} />;
  }

  if (currentView === 'affiliate') {
    return <AffiliateApp />;
  }

  // page home
  return (
    <Layout title="Système d'Affiliation">
      <div className="text-center py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-white mb-6">
            Système d'<span className="text-[#00FF7F]">Affiliation</span>
          </h1>
          <p className="text-xl text-gray-300 mb-12">
            Rejoignez notre programme d'affiliation et générez des revenus en recommandant nos services de développement web
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-[#00FF7F] transition-colors duration-300">
              <div className="w-16 h-16 bg-[#00FF7F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-[#00FF7F]" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Administration</h3>
              <p className="text-gray-400 mb-6">
                Accédez au tableau de bord administrateur pour gérer les affiliés et suivre les performances
              </p>
              <Button 
                onClick={() => setCurrentView('admin')} 
                className="w-full justify-center"
              >
                <Shield size={20} className="mr-2" />
                Dashboard Admin
              </Button>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 hover:border-[#00FF7F] transition-colors duration-300">
              <div className="w-16 h-16 bg-[#00FF7F]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-[#00FF7F]" size={32} />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Espace Affilié</h3>
              <p className="text-gray-400 mb-6">
                Connectez-vous à votre espace affilié pour suivre vos commissions et performances
              </p>
              <Button 
                onClick={() => setCurrentView('affiliate')} 
                className="w-full justify-center"
              >
                <Users size={20} className="mr-2" />
                Espace Affilié
              </Button>
            </div>
          </div>

          <div className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 border border-[#00FF7F]/20 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-white mb-4">
              Pourquoi devenir affilié EDG ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="text-[#00FF7F] text-3xl font-bold mb-2">10%</div>
                <p className="text-gray-300">Commission sur chaque vente</p>
              </div>
              <div className="text-center">
                <div className="text-[#00FF7F] text-3xl font-bold mb-2">24h</div>
                <p className="text-gray-300">Support réactif</p>
              </div>
              <div className="text-center">
                <div className="text-[#00FF7F] text-3xl font-bold mb-2">∞</div>
                <p className="text-gray-300">Potentiel de gains illimité</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default App;
