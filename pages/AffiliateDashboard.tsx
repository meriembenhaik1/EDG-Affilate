'use client';
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { StatCard } from '../components/StatCard';
import { Copy, Share2, Users, CheckCircle, Clock, DollarSign, ExternalLink, Plus, Mail, Phone, User, X } from 'lucide-react';
import { auth, db } from '../firebase'; // Assurez-vous que firebase.ts exporte auth et db
import { collection, query, where, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'; // Importe le type User et onAuthStateChanged de firebase/auth

interface ClientLead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsappPhone: string; // Nouveau champ
  projectType: string; // Remplace serviceType
  clientName: string; // Combiné pour l'affichage
  estimatedAmount: number;
  status: 'pending' | 'confirmed' | 'paid';
  commission: number;
  createdAt: string; // ISO string
  affiliateId: string;
}

interface AffiliateDashboardProps {
  userEmail: string; // Garde userEmail comme prop
  onLogout: () => void;
}

// Types de projets disponibles
const PROJECT_TYPES = [
  'Site Web Vitrine',
  'E-commerce',
  'Application Web',
  'Application Mobile',
  'Refonte de Site',
  'SEO/Référencement',
  'Maintenance',
  'Formation',
  'Portfolio', // Ajout de 'Portfolio'
  'Autre'
];

export const AffiliateDashboard: React.FC<AffiliateDashboardProps> = ({ userEmail, onLogout }) => {
  const [copied, setCopied] = useState(false);
  const [clients, setClients] = useState<ClientLead[]>([]);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientWhatsappPhone, setNewClientWhatsappPhone] = useState(''); // Nouveau state
  const [newClientProjectType, setNewClientProjectType] = useState('Site Web Vitrine'); // Nouveau state
  const [newClientOtherProjectType, setNewClientOtherProjectType] = useState(''); // Nouveau state pour le type de projet 'Autre'
  const [loadingAddClient, setLoadingAddClient] = useState(false);
  const [addClientError, setAddClientError] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // Nouveau state pour le message de succès
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null); // État interne pour l'utilisateur Firebase
  const [loadingUser, setLoadingUser] = useState(true); // État de chargement pour l'utilisateur interne

  // Simule le code d'affilié basé sur l'email de l'utilisateur
  const affiliateCode = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') + '123';
  const affiliateLink = `https://edg-informatique.com/devis?ref=${affiliateCode}`;

  // Effet pour récupérer l'utilisateur Firebase actuel
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoadingUser(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!currentUser || loadingUser) return; // Attendre que l'utilisateur soit chargé

    const clientsRef = collection(db, 'clients');
    // Requête les clients où affiliateId correspond à l'UID de l'utilisateur actuel
    const q = query(clientsRef, where('affiliateId', '==', currentUser.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedClients: ClientLead[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          phone: data.phone || '',
          whatsappPhone: data.whatsappPhone || '', // Nouveau champ
          projectType: data.projectType || data.serviceType || 'Site Web Vitrine', // Support rétrocompatibilité
          clientName: `${data.firstName || ''} ${data.lastName || ''}`, // Combine prénom et nom
          estimatedAmount: data.estimatedAmount || 0, // Valeur par défaut si non définie
          status: data.status || 'pending', // Statut initial par défaut
          commission: data.commission || 0, // Valeur par défaut si non définie
          createdAt: data.createdAt?.toDate().toISOString() || new Date().toISOString(), // Convertit Timestamp en chaîne ISO
          affiliateId: data.affiliateId,
        };
      });
      setClients(fetchedClients);
    }, (error) => {
      console.error("Erreur lors de la récupération des clients: ", error);
      setAddClientError("Erreur lors du chargement des clients.");
    });
    // Nettoie l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, [currentUser, loadingUser]); // Réexécute l'effet si l'utilisateur interne change

  const resetForm = () => {
    setNewClientFirstName('');
    setNewClientLastName('');
    setNewClientEmail('');
    setNewClientPhone('');
    setNewClientWhatsappPhone('');
    setNewClientProjectType('Site Web Vitrine');
    setNewClientOtherProjectType(''); // Réinitialise le champ "Autre"
    setAddClientError('');
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setAddClientError("Vous devez être connecté pour ajouter un client.");
      return;
    }

    // Détermine le type de projet final
    const finalProjectType = newClientProjectType === 'Autre'
      ? newClientOtherProjectType.trim()
      : newClientProjectType;

    if (newClientProjectType === 'Autre' && !finalProjectType) {
      setAddClientError("Veuillez spécifier le type de projet 'Autre'.");
      return;
    }

    setLoadingAddClient(true);
    setAddClientError('');
    try {
      // Ajouter le client à la collection Firestore
      await addDoc(collection(db, 'clients'), {
        firstName: newClientFirstName.trim(),
        lastName: newClientLastName.trim(),
        email: newClientEmail.trim().toLowerCase(),
        phone: newClientPhone.trim(),
        whatsappPhone: newClientWhatsappPhone.trim(), // Nouveau champ
        projectType: finalProjectType, // Utilise le type de projet déterminé
        affiliateId: currentUser.uid, // Lie le client à l'affilié actuel
        status: 'pending', // Statut initial
        createdAt: Timestamp.now(), // Horodatage Firestore
        estimatedAmount: 0, // Montant par défaut (sera mis à jour par l'admin)
        commission: 0, // Commission par défaut (sera calculée par l'admin)
        // Champs additionnels pour la traçabilité
        affiliateEmail: userEmail,
        addedBy: 'affiliate' // Pour distinguer des leads automatiques
      });
      // Réinitialiser le formulaire
      resetForm();
      // Fermer la modale
      setIsAddClientModalOpen(false);
      // Afficher le message de succès
      setShowSuccessMessage(true);
      // Cacher le message après 5 secondes
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error: any) {
      console.error("Erreur lors de l'ajout du client: ", error);
      setAddClientError("Erreur lors de l'ajout du client. Veuillez réessayer.");
    } finally {
      setLoadingAddClient(false);
    }
  };

  const handleCloseModal = () => {
    if (!loadingAddClient) {
      setIsAddClientModalOpen(false);
      resetForm();
    }
  };

  const confirmedSales = clients.filter(client => client.status === 'confirmed' || client.status === 'paid');
  const pendingCommissions = clients
    .filter(client => client.status === 'confirmed')
    .reduce((sum, client) => sum + client.commission, 0);
  const paidCommissions = clients
    .filter(client => client.status === 'paid')
    .reduce((sum, client) => sum + client.commission, 0);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Échec de la copie du texte: ', err);
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

  // Afficher un loader si l'utilisateur interne n'est pas encore chargé
  if (loadingUser) {
    return (
      <Layout title="Chargement...">
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00FF7F] mx-auto mb-4"></div>
            <p className="text-white">Chargement du tableau de bord...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`Bonjour, ${userEmail.split('@')[0] || 'Affilié'}`}>
      <div className="space-y-8">
        {/* Message de succès */}
        {showSuccessMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-900/90 border border-green-500 rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-2">
              <CheckCircle className="text-green-400" size={20} />
              <div>
                <p className="text-green-400 font-medium">Client ajouté avec succès !</p>
                <p className="text-green-300 text-sm">Le client a été ajouté à votre liste.</p>
              </div>
              <button
                onClick={() => setShowSuccessMessage(false)}
                className="ml-4 text-green-400 hover:text-green-300"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        {/* Section de bienvenue */}
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
        {/* Lien d'affiliation */}
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
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Clients Ramenés"
            value={clients.length}
            subtitle="total"
          />
          <StatCard
            title="Ventes Confirmées"
            value={confirmedSales.length}
            subtitle={`${clients.length > 0 ? Math.round(confirmedSales.length / clients.length * 100) : 0}% de conversion`}
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
        {/* Liste des clients */}
        <Card>
          <div className="flex items-center justify-between space-x-2 mb-6">
            <div className="flex items-center space-x-2">
              <Users className="text-[#00FF7F]" size={24} />
              <h2 className="text-xl font-bold text-white">Vos Clients</h2>
            </div>
            <Button onClick={() => setIsAddClientModalOpen(true)} className="flex items-center space-x-2">
              <Plus size={18} />
              <span>Ajouter un client</span>
            </Button>
          </div>
          {clients.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Aucun client pour le moment</h3>
              <p className="text-gray-400">
                Partagez votre lien d'affiliation ou ajoutez un client manuellement pour commencer à générer des commissions !
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
                    <th className="pb-3 text-gray-400 font-medium">Type de Projet</th>
                    <th className="pb-3 text-gray-400 font-medium">Montant</th>
                    <th className="pb-3 text-gray-400 font-medium">Statut</th>
                    <th className="pb-3 text-gray-400 font-medium">Commission</th>
                    <th className="pb-3 text-gray-400 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                      <td className="py-4">
                        <div>
                          <div className="text-white font-medium">{client.clientName}</div>
                          <div className="text-gray-400 text-sm">{client.email}</div>
                        </div>
                      </td>
                      <td className="py-4 text-gray-300">{client.phone}</td>
                      <td className="py-4 text-gray-300">{client.whatsappPhone || '-'}</td>
                      <td className="py-4 text-gray-300">{client.projectType}</td>
                      <td className="py-4 text-white font-semibold">
                        {client.estimatedAmount > 0 ? `${client.estimatedAmount.toLocaleString('fr-FR')} €` : '-'}
                      </td>
                      <td className="py-4">
                        <span className={`font-medium ${getStatusColor(client.status)}`}>
                          {getStatusText(client.status)}
                        </span>
                      </td>
                      <td className="py-4 text-white font-semibold flex items-center">
                        <DollarSign size={16} className="mr-1 text-[#00FF7F]" />
                        {client.commission > 0 ? `${client.commission.toLocaleString('fr-FR')} €` : '-'}
                      </td>
                      <td className="py-4 text-gray-400 text-sm">
                        {new Date(client.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
        {/* Section Conseils */}
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
      {/* Modale d'ajout de client améliorée */}
      {isAddClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-lg rounded-lg border border-gray-700 bg-gray-900 p-6 text-white shadow-lg max-h-[90vh] overflow-y-auto">
            {/* Header de la modale */}
            <div className="mb-6 text-center">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">Ajouter un nouveau client</h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={loadingAddClient}
                >
                  <X size={24} />
                </button>
              </div>
              <p className="text-sm text-gray-400">
                Entrez les informations du client pour l'ajouter à votre liste.
              </p>
            </div>
            <form onSubmit={handleAddClient} className="space-y-4">
              {addClientError && (
                <div className="mb-4 p-3 rounded-lg border border-red-500 bg-red-900/50">
                  <p className="text-center text-sm text-red-400">{addClientError}</p>
                </div>
              )}
              {/* Prénom */}
              <div>
                <label htmlFor="newClientFirstName" className="block text-sm font-medium text-gray-300 mb-2">
                  Prénom *
                </label>
                <input
                  id="newClientFirstName"
                  type="text"
                  value={newClientFirstName}
                  onChange={(e) => setNewClientFirstName(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00FF7F]"
                  placeholder="Jean"
                  required
                  disabled={loadingAddClient}
                />
              </div>
              {/* Nom */}
              <div>
                <label htmlFor="newClientLastName" className="block text-sm font-medium text-gray-300 mb-2">
                  Nom *
                </label>
                <input
                  id="newClientLastName"
                  type="text"
                  value={newClientLastName}
                  onChange={(e) => setNewClientLastName(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00FF7F]"
                  placeholder="Dupont"
                  required
                  disabled={loadingAddClient}
                />
              </div>
              {/* Email */}
              <div>
                <label htmlFor="newClientEmail" className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  id="newClientEmail"
                  type="email"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00FF7F]"
                  placeholder="jean.dupont@email.com"
                  required
                  disabled={loadingAddClient}
                />
              </div>
              {/* Téléphone */}
              <div>
                <label htmlFor="newClientPhone" className="block text-sm font-medium text-gray-300 mb-2">
                  Téléphone *
                </label>
                <input
                  id="newClientPhone"
                  type="tel"
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00FF7F]"
                  placeholder="+33 6 12 34 56 78"
                  required
                  disabled={loadingAddClient}
                />
              </div>
              {/* WhatsApp */}
              <div>
                <label htmlFor="newClientWhatsappPhone" className="block text-sm font-medium text-gray-300 mb-2">
                  Numéro WhatsApp
                  <span className="text-gray-500 text-xs ml-1">(optionnel)</span>
                </label>
                <input
                  id="newClientWhatsappPhone"
                  type="tel"
                  value={newClientWhatsappPhone}
                  onChange={(e) => setNewClientWhatsappPhone(e.target.value)}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00FF7F]"
                  placeholder="+33 6 12 34 56 78"
                  disabled={loadingAddClient}
                />
              </div>
              {/* Type de projet */}
              <div>
                <label htmlFor="newClientProjectType" className="block text-sm font-medium text-gray-300 mb-2">
                  Type de projet *
                </label>
                <select
                  id="newClientProjectType"
                  value={newClientProjectType}
                  onChange={(e) => {
                    setNewClientProjectType(e.target.value);
                    if (e.target.value !== 'Autre') {
                      setNewClientOtherProjectType(''); // Efface le champ "Autre" si un autre type est sélectionné
                    }
                  }}
                  className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00FF7F]"
                  required
                  disabled={loadingAddClient}
                >
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {newClientProjectType === 'Autre' && (
                  <div className="mt-4">
                    <label htmlFor="newClientOtherProjectType" className="block text-sm font-medium text-gray-300 mb-2">
                      Spécifiez le type de projet *
                    </label>
                    <input
                      id="newClientOtherProjectType"
                      type="text"
                      value={newClientOtherProjectType}
                      onChange={(e) => setNewClientOtherProjectType(e.target.value)}
                      className="w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#00FF7F]"
                      placeholder="Ex: Application de gestion interne"
                      required
                      disabled={loadingAddClient}
                    />
                  </div>
                )}
              </div>
              {/* Footer de la modale */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-700">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCloseModal}
                  disabled={loadingAddClient}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={loadingAddClient}>
                  {loadingAddClient ? (
                    <div className="flex items-center">
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                      Ajout en cours...
                    </div>
                  ) : (
                    'Ajouter le client'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};
