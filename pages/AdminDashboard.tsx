'use client';
import React, { useState, useEffect } from 'react';
import { Eye, Users, TrendingUp, DollarSign, LogOut, UserCheck, Phone, Mail, Calendar, Filter, X, Edit } from 'lucide-react';
import { auth, db } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';

// Types
interface ClientLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappPhone: string;
  projectType: string;
  clientName: string;
  estimatedAmount: number;
  status: 'pending' | 'confirmed' | 'paid';
  commission: number;
  createdAt: string;
  affiliateId: string;
  affiliateEmail: string;
}

interface Affiliate {
  id: string;
  email: string;
  name: string;
  totalCommissions: number;
  clientsCount: number;
  joinDate: string;
  status: 'active' | 'inactive';
}

interface AdminDashboardProps {
  onLogout?: () => void;
}

// Components
const Layout: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
    <div className="container mx-auto px-4 py-8">
      {children}
    </div>
  </div>
);

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

const Button: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({ children, variant = 'primary', size = 'md', onClick, className = '', disabled = false }) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900';
  
  const variants = {
    primary: 'bg-[#00FF7F] text-black hover:bg-[#00FF7F]/90 focus:ring-[#00FF7F]',
    secondary: 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {children}
    </button>
  );
};

const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle: string;
  color?: string;
}> = ({ title, value, subtitle, color = 'text-[#00FF7F]' }) => (
  <Card>
    <div className="text-center">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
      <p className="text-gray-500 text-xs">{subtitle}</p>
    </div>
  </Card>
);

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [selectedAffiliate, setSelectedAffiliate] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientLead[]>([]);
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingClient, setEditingClient] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<string>('');
  const [editCommission, setEditCommission] = useState<string>('');
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  // Récupération de l'utilisateur actuel
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Récupération des clients depuis Firebase
  useEffect(() => {
    const clientsRef = collection(db, 'clients');
    
    const unsubscribe = onSnapshot(clientsRef, (snapshot) => {
      const fetchedClients: ClientLead[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          whatsappPhone: data.whatsappPhone || '',
          projectType: data.projectType || 'Non spécifié',
          clientName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
          estimatedAmount: data.estimatedAmount || 0,
          status: data.status || 'pending',
          commission: data.commission || 0,
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(),
          affiliateId: data.affiliateId || '',
          affiliateEmail: data.affiliateEmail || ''
        };
      });
      setClients(fetchedClients);
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors de la récupération des clients: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Génération des affiliés à partir des clients
  useEffect(() => {
    const affiliateMap = new Map<string, Affiliate>();
    
    clients.forEach(client => {
      if (client.affiliateId && !affiliateMap.has(client.affiliateId)) {
        affiliateMap.set(client.affiliateId, {
          id: client.affiliateId,
          email: client.affiliateEmail || 'Email non disponible',
          name: client.affiliateEmail ? client.affiliateEmail.split('@')[0] : 'Nom non disponible',
          totalCommissions: 0,
          clientsCount: 0,
          joinDate: client.createdAt,
          status: 'active'
        });
      }
      
      if (client.affiliateId) {
        const affiliate = affiliateMap.get(client.affiliateId)!;
        affiliate.totalCommissions += client.commission || 0;
        affiliate.clientsCount += 1;
        
        // Garder la date la plus ancienne comme date d'inscription
        if (new Date(client.createdAt) < new Date(affiliate.joinDate)) {
          affiliate.joinDate = client.createdAt;
        }
      }
    });

    setAffiliates(Array.from(affiliateMap.values()));
  }, [clients]);

  const handleMarkAsPaid = async (clientId: string) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, {
        status: 'paid'
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut: ", error);
    }
  };

  const handleMarkAsConfirmed = async (clientId: string) => {
    try {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, {
        status: 'confirmed'
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut: ", error);
    }
  };

  const handleUpdateAmountAndCommission = async (clientId: string) => {
    if (!editAmount || !editCommission) return;
    
    try {
      const clientRef = doc(db, 'clients', clientId);
      await updateDoc(clientRef, {
        estimatedAmount: parseFloat(editAmount),
        commission: parseFloat(editCommission)
      });
      setEditingClient(null);
      setEditAmount('');
      setEditCommission('');
    } catch (error) {
      console.error("Erreur lors de la mise à jour: ", error);
    }
  };

  const startEditing = (client: ClientLead) => {
    setEditingClient(client.id);
    setEditAmount(client.estimatedAmount.toString());
    setEditCommission(client.commission.toString());
  };

  const cancelEditing = () => {
    setEditingClient(null);
    setEditAmount('');
    setEditCommission('');
  };

  const getStatusColor = (status: ClientLead['status']) => {
    switch (status) {
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      case 'confirmed': return 'text-blue-400 bg-blue-400/10';
      case 'paid': return 'text-green-400 bg-green-400/10';
    }
  };

  const getStatusText = (status: ClientLead['status']) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'paid': return 'Payée';
    }
  };

  const filteredClients = selectedAffiliate 
    ? clients.filter(client => client.affiliateId === selectedAffiliate)
    : clients;

  const totalCommissions = clients.reduce((sum, client) => sum + client.commission, 0);
  const totalClients = clients.length;
  const paidClients = clients.filter(client => client.status === 'paid').length;
  const confirmedClients = clients.filter(client => client.status === 'confirmed').length;

  if (loading) {
    return (
      <Layout title="Chargement...">
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF7F] mx-auto mb-4"></div>
            <p className="text-white">Chargement du dashboard admin...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard Admin">
      <div className="space-y-8">
        {/* Header avec logout */}
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

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Affiliés" 
            value={affiliates.length} 
            subtitle="actifs"
          />
          <StatCard 
            title="Total Clients" 
            value={totalClients} 
            subtitle="inscrits"
          />
          <StatCard 
            title="Ventes Confirmées/Payées" 
            value={confirmedClients + paidClients} 
            subtitle={`${totalClients > 0 ? Math.round((confirmedClients + paidClients)/totalClients*100) : 0}% conversion`}
          />
          <StatCard 
            title="Commissions Totales" 
            value={`${totalCommissions.toLocaleString('fr-FR')} DA`} 
            subtitle="générées"
          />
        </div>

        {/* Liste des Affiliés */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Users className="text-[#00FF7F]" size={24} />
            <h2 className="text-xl font-bold text-white">Affiliés Inscrits</h2>
          </div>
          
          {affiliates.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun affilié pour le moment</h3>
              <p className="text-gray-400">Les affiliés apparaîtront ici dès qu'ils ajouteront des clients.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="pb-3 text-gray-400 font-medium">Email</th>
                    <th className="pb-3 text-gray-400 font-medium">ID Affilié</th>
                    <th className="pb-3 text-gray-400 font-medium">Date inscription</th>
                    <th className="pb-3 text-gray-400 font-medium">Commissions totales</th>
                    <th className="pb-3 text-gray-400 font-medium">Nb clients</th>
                    <th className="pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map((affiliate) => (
                    <tr key={affiliate.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4 text-white font-medium">{affiliate.email}</td>
                      <td className="py-4 text-[#00FF7F] font-mono text-sm">{affiliate.id.substring(0, 8)}...</td>
                      <td className="py-4 text-gray-300 text-sm">
                        {new Date(affiliate.joinDate).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4 text-white font-semibold">
                        {affiliate.totalCommissions.toLocaleString('fr-FR')} DA
                      </td>
                      <td className="py-4 text-gray-300">
                        {affiliate.clientsCount} clients
                      </td>
                      <td className="py-4">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedAffiliate(
                            selectedAffiliate === affiliate.id ? null : affiliate.id
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
          )}
        </Card>

        {/* Liste des Clients */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-[#00FF7F]" size={24} />
              <h2 className="text-xl font-bold text-white">
                Clients / Leads
                {selectedAffiliate && (
                  <span className="text-[#00FF7F] text-base ml-2">
                    (Filtrés par affilié sélectionné)
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
          
          {filteredClients.length === 0 ? (
            <div className="text-center py-8">
              <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun client pour le moment</h3>
              <p className="text-gray-400">
                {selectedAffiliate 
                  ? "Cet affilié n'a pas encore de clients."
                  : "Les clients apparaîtront ici dès qu'ils seront ajoutés par les affiliés."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="pb-3 text-gray-400 font-medium">Client</th>
                    <th className="pb-3 text-gray-400 font-medium">Téléphone</th>
                    <th className="pb-3 text-gray-400 font-medium">WhatsApp</th>
                    <th className="pb-3 text-gray-400 font-medium">Projet</th>
                    <th className="pb-3 text-gray-400 font-medium">Montant</th>
                    <th className="pb-3 text-gray-400 font-medium">Commission</th>
                    <th className="pb-3 text-gray-400 font-medium">Affilié</th>
                    <th className="pb-3 text-gray-400 font-medium">Statut</th>
                    <th className="pb-3 text-gray-400 font-medium">Date</th>
                    <th className="pb-3 text-gray-400 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4">
                        <div>
                          <div className="text-white font-medium">{client.clientName}</div>
                          <div className="text-gray-400 text-sm">{client.email}</div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-300 text-sm">{client.phone}</td>
                      <td className="py-4 text-gray-300 text-sm">{client.whatsappPhone || '-'}</td>
                      <td className="py-4 text-gray-300">{client.projectType}</td>
                      <td className="py-4">
                        {editingClient === client.id ? (
                          <input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="w-20 bg-gray-700 text-white text-sm px-2 py-1 rounded"
                            placeholder="Montant"
                          />
                        ) : (
                          <div className="text-white font-semibold">
                            {client.estimatedAmount > 0 ? `${client.estimatedAmount.toLocaleString('fr-FR')} DA` : '-'}
                          </div>
                        )}
                      </td>
                      <td className="py-4">
                        {editingClient === client.id ? (
                          <input
                            type="number"
                            value={editCommission}
                            onChange={(e) => setEditCommission(e.target.value)}
                            className="w-20 bg-gray-700 text-white text-sm px-2 py-1 rounded"
                            placeholder="Commission"
                          />
                        ) : (
                          <div className="text-[#00FF7F] font-semibold">
                            {client.commission > 0 ? `${client.commission.toLocaleString('fr-FR')} DA` : '-'}
                          </div>
                        )}
                      </td>
                      <td className="py-4 text-gray-300 text-sm">{client.affiliateEmail}</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                          {getStatusText(client.status)}
                        </span>
                      </td>
                      <td className="py-4 text-gray-400 text-sm">
                        {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-4">
                        <div className="flex space-x-2">
                          {editingClient === client.id ? (
                            <>
                              <Button
                                variant="success"
                                size="sm"
                                onClick={() => handleUpdateAmountAndCommission(client.id)}
                                className="text-xs"
                              >
                                Sauver
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={cancelEditing}
                                className="text-xs"
                              >
                                Annuler
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => startEditing(client)}
                                className="flex items-center space-x-1"
                              >
                                <Edit size={14} />
                                <span>Éditer</span>
                              </Button>
                              {client.status === 'pending' && (
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleMarkAsConfirmed(client.id)}
                                  className="text-xs"
                                >
                                  Confirmer
                                </Button>
                              )}
                              {client.status === 'confirmed' && (
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => handleMarkAsPaid(client.id)}
                                  className="flex items-center space-x-1"
                                >
                                  <DollarSign size={14} />
                                  <span>Marquer payé</span>
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};