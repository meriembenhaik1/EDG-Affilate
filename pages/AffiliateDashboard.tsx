import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCard } from '../components/StatCard';
import { mockLeads } from '../utils/mockData';
import { Copy, Share2, Users, CheckCircle, Clock, DollarSign, ExternalLink } from 'lucide-react';

interface AffiliateDashboardProps {
  userEmail: string;
  onLogout: () => void;
}

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ userEmail, onLogout }) => {
  const [copied, setCopied] = useState(false);
  
  // Simulate affiliate code based on email
  const affiliateCode = userEmail.split('@')[0].toLowerCase().replace('.', '') + '123';
  const affiliateLink = `https://edg-informatique.com/devis?ref=${affiliateCode}`;
  
  // Filter leads for this affiliate
  const affiliateLeads = mockLeads.filter(lead => lead.affiliateCode === affiliateCode);
  const confirmedSales = affiliateLeads.filter(lead => lead.status === 'confirmed' || lead.status === 'paid');
  const pendingCommissions = affiliateLeads
    .filter(lead => lead.status === 'confirmed')
    .reduce((sum, lead) => sum + lead.commission, 0);
  const paidCommissions = affiliateLeads
    .filter(lead => lead.status === 'paid')
    .reduce((sum, lead) => sum + lead.commission, 0);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-400';
      case 'confirmed': return 'text-blue-400';
      case 'paid': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'paid': return 'Payée';
      default: return status;
    }
  };

  return (
    <Layout title={`Bonjour, ${userEmail.split('@')[0]}`}>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Tableau de bord Affilié
            </h1>
            <p className="text-gray-400">
              Suivez vos performances et gérez vos commissions
            </p>
          </div>
          <Button variant="secondary" onClick={onLogout}>
            Déconnexion
          </Button>
        </div>

        {/* Affiliate Link */}
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Share2 className="text-[#00FF7F]" size={24} />
            <h2 className="text-xl font-bold text-white">Votre Lien d'Affiliation</h2>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-gray-400 text-sm mb-1">Code affilié:</p>
                <p className="text-[#00FF7F] font-mono text-lg font-bold">{affiliateCode}</p>
                <p className="text-gray-400 text-sm mt-2">Lien complet:</p>
                <p className="text-white font-mono text-sm break-all">{affiliateLink}</p>
              </div>
              <div className="ml-4 flex flex-col space-y-2">
                <Button
                  variant={copied ? 'success' : 'primary'}
                  size="sm"
                  onClick={() => copyToClipboard(affiliateLink)}
                  className="flex items-center space-x-1"
                >
                  {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                  <span>{copied ? 'Copié !' : 'Copier'}</span>
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => window.open(affiliateLink, '_blank')}
                  className="flex items-center space-x-1"
                >
                  <ExternalLink size={16} />
                  <span>Tester</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Clients Ramenés" 
            value={affiliateLeads.length} 
            subtitle="total"
          />
          <StatCard 
            title="Ventes Confirmées" 
            value={confirmedSales.length} 
            subtitle={`${affiliateLeads.length > 0 ? Math.round(confirmedSales.length/affiliateLeads.length*100) : 0}% de conversion`}
          />
          <StatCard 
            title="Commissions en Attente" 
            value={`${pendingCommissions.toLocaleString('fr-FR')} €`} 
            subtitle="à recevoir"
            color="text-yellow-400"
          />
          <StatCard 
            title="Commissions Payées" 
            value={`${paidCommissions.toLocaleString('fr-FR')} €`} 
            subtitle="reçues"
            color="text-green-400"
          />
        </div>

        {/* Clients List */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Users className="text-[#00FF7F]" size={24} />
            <h2 className="text-xl font-bold text-white">Vos Clients</h2>
          </div>
          
          {affiliateLeads.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun client pour le moment</h3>
              <p className="text-gray-400">
                Partagez votre lien d'affiliation pour commencer à générer des commissions !
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="pb-3 text-gray-400 font-medium">Client</th>
                    <th className="pb-3 text-gray-400 font-medium">Service</th>
                    <th className="pb-3 text-gray-400 font-medium">Montant</th>
                    <th className="pb-3 text-gray-400 font-medium">Statut</th>
                    <th className="pb-3 text-gray-400 font-medium">Commission</th>
                    <th className="pb-3 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4 text-white font-medium">{lead.clientName}</td>
                      <td className="py-4 text-gray-300">{lead.serviceType}</td>
                      <td className="py-4 text-white font-semibold">
                        {lead.estimatedAmount.toLocaleString('fr-FR')} €
                      </td>
                      <td className="py-4">
                        <span className={`font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusText(lead.status)}
                        </span>
                      </td>
                      <td className="py-4 text-white font-semibold flex items-center">
                        <DollarSign size={16} className="mr-1 text-[#00FF7F]" />
                        {lead.commission.toLocaleString('fr-FR')} €
                      </td>
                      <td className="py-4 text-gray-400 text-sm">
                        {new Date(lead.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-gray-900 to-gray-800 border-[#00FF7F]/20">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-[#00FF7F] rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-sm">💡</span>
            </div>
            <h2 className="text-lg font-bold text-white">Conseils pour maximiser vos gains</h2>
          </div>
          
          <div className="space-y-3 text-gray-300">
            <p className="flex items-start">
              <span className="text-[#00FF7F] mr-2">•</span>
              Partagez votre lien sur vos réseaux sociaux professionnels
            </p>
            <p className="flex items-start">
              <span className="text-[#00FF7F] mr-2">•</span>
              Recommandez EDG Informatique à vos contacts dans le besoin
            </p>
            <p className="flex items-start">
              <span className="text-[#00FF7F] mr-2">•</span>
              Participez aux événements networking de votre région
            </p>
            <p className="flex items-start">
              <span className="text-[#00FF7F] mr-2">•</span>
              Créez du contenu autour du développement web et ajoutez votre lien
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};