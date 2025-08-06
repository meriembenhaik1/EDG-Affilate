import React, { useState } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCard } from '../components/StatCard';
import { mockAffiliates, mockLeads } from '../utils/mockData';
import { Affiliate, Lead } from '../types';
import { Eye, Users, TrendingUp, DollarSign, LogOut } from 'lucide-react';

interface AdminDashboardProps {
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>(mockLeads);

  const totalCommissions = mockAffiliates.reduce((sum, affiliate) => sum + affiliate.totalCommissions, 0);
  const totalLeads = mockLeads.length;
  const paidLeads = mockLeads.filter(lead => lead.status === 'paid').length;

  const handleMarkAsPaid = (leadId: string) => {
    setLeads(leads.map(lead => 
      lead.id === leadId ? { ...lead, status: 'paid' as const } : lead
    ));
  };

  const getStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'confirmed': return 'text-blue-400 bg-blue-400/10';
      case 'paid': return 'text-green-400 bg-green-400/10';
    }
  };

  const getStatusText = (status: Lead['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'paid': return 'Payée';
    }
  };

  const filteredLeads = selectedAffiliate 
    ? leads.filter(lead => lead.affiliateCode === selectedAffiliate)
    : leads;

  return (
    <Layout title="Dashboard Admin">
      <div className="space-y-8">
        {/* Header with logout */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Dashboard Administrateur
            </h1>
            <p className="text-gray-400">
              Gérez vos affiliés et suivez les performances
            </p>
          </div>
          {onLogout && (
            <Button variant="secondary" onClick={onLogout} className="flex items-center space-x-2">
              <LogOut size={20} />
              <span>Déconnexion</span>
            </Button>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Affiliés" 
            value={mockAffiliates.length} 
            subtitle="actifs"
          />
          <StatCard 
            title="Total Leads" 
            value={totalLeads} 
            subtitle="ce mois"
          />
          <StatCard 
            title="Ventes Payées" 
            value={paidLeads} 
            subtitle={`${Math.round(paidLeads/totalLeads*100)}% conversion`}
          />
          <StatCard 
            title="Commissions Totales" 
            value={`${totalCommissions.toLocaleString('fr-FR')} €`} 
            subtitle="générées"
          />
        </div>

        {/* Affiliates List */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Users className="text-[#00FF7F]" size={24} />
            <h2 className="text-xl font-bold text-white">Affiliés Inscrits</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-3 text-gray-400 font-medium">Nom</th>
                  <th className="pb-3 text-gray-400 font-medium">Code Affilié</th>
                  <th className="pb-3 text-gray-400 font-medium">Email</th>
                  <th className="pb-3 text-gray-400 font-medium">Paiement</th>
                  <th className="pb-3 text-gray-400 font-medium">Commissions</th>
                  <th className="pb-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockAffiliates.map((affiliate) => (
                  <tr key={affiliate.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-4 text-white font-medium">{affiliate.name}</td>
                    <td className="py-4 text-[#00FF7F] font-mono">{affiliate.code}</td>
                    <td className="py-4 text-gray-300">{affiliate.email}</td>
                    <td className="py-4 text-gray-300">{affiliate.paymentMethod}</td>
                    <td className="py-4 text-white font-semibold">
                      {affiliate.totalCommissions.toLocaleString('fr-FR')} €
                      <span className="text-gray-400 text-sm ml-2">
                        ({affiliate.clientsCount} clients)
                      </span>
                    </td>
                    <td className="py-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAffiliate(
                          selectedAffiliate === affiliate.code ? null : affiliate.code
                        )}
                        className="flex items-center space-x-1"
                      >
                        <Eye size={16} />
                        <span>Voir clients</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Leads List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-[#00FF7F]" size={24} />
              <h2 className="text-xl font-bold text-white">
                Leads / Clients
                {selectedAffiliate && (
                  <span className="text-[#00FF7F] text-base ml-2">
                    (Filtrés par: {selectedAffiliate})
                  </span>
                )}
              </h2>
            </div>
            {selectedAffiliate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedAffiliate(null)}
              >
                Voir tous
              </Button>
            )}
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-3 text-gray-400 font-medium">Client</th>
                  <th className="pb-3 text-gray-400 font-medium">Téléphone</th>
                  <th className="pb-3 text-gray-400 font-medium">Service</th>
                  <th className="pb-3 text-gray-400 font-medium">Montant</th>
                  <th className="pb-3 text-gray-400 font-medium">Affilié</th>
                  <th className="pb-3 text-gray-400 font-medium">Statut</th>
                  <th className="pb-3 text-gray-400 font-medium">Commission</th>
                  <th className="pb-3 text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="py-4 text-white font-medium">{lead.clientName}</td>
                    <td className="py-4 text-gray-300 font-mono text-sm">{lead.phone}</td>
                    <td className="py-4 text-gray-300">{lead.serviceType}</td>
                    <td className="py-4 text-white font-semibold">
                      {lead.estimatedAmount.toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-4 text-[#00FF7F] font-mono text-sm">{lead.affiliateCode}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                        {getStatusText(lead.status)}
                      </span>
                    </td>
                    <td className="py-4 text-white font-semibold">
                      {lead.commission.toLocaleString('fr-FR')} €
                    </td>
                    <td className="py-4">
                      {lead.status !== 'paid' && (
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleMarkAsPaid(lead.id)}
                          className="flex items-center space-x-1"
                        >
                          <DollarSign size={16} />
                          <span>Marquer payé</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};