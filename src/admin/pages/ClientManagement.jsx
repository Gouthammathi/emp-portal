import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaUserPlus, FaUsers, FaTicketAlt, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamLeads, setTeamLeads] = useState([]);
  const [loadingTeamLeads, setLoadingTeamLeads] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  const [newClient, setNewClient] = useState({
    clientId: '',
    name: '',
    email: '',
    password: '',
    company: '',
    contactPerson: '',
    phone: '',
    address: '',
    assignedTeamLead: '',
    status: 'active',
    createdAt: new Date().toISOString(),
    ticketCount: 0
  });

  useEffect(() => {
    fetchClients();
    fetchTeamLeads();
  }, []);

  const fetchTeamLeads = async () => {
    try {
      setLoadingTeamLeads(true);
      const teamLeadsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'team lead'),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(teamLeadsQuery);
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamLeads(leads);
      setLoadingTeamLeads(false);
    } catch (error) {
      console.error('Error fetching team leads:', error);
      toast.error('Failed to load team leads');
      setLoadingTeamLeads(false);
    }
  };

  const fetchClients = async () => {
    try {
      const clientsRef = collection(db, 'clients');
      const snapshot = await getDocs(clientsRef);
      const clientsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setClients(clientsData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients');
      setLoading(false);
    }
  };

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      // Validate team lead assignment
      if (!newClient.assignedTeamLead) {
        toast.warning('Please assign a team lead to the client');
        return;
      }

      // Generate a unique client ID
      const clientId = `CLI${Date.now().toString().slice(-6)}`;
      const selectedTeamLead = teamLeads.find(lead => lead.id === newClient.assignedTeamLead);
      
      const clientData = {
        ...newClient,
        clientId,
        teamLeadName: selectedTeamLead ? `${selectedTeamLead.firstName} ${selectedTeamLead.lastName}` : '',
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'clients'), clientData);
      toast.success('Client added successfully');
      setShowAddModal(false);
      setNewClient({
        clientId: '',
        name: '',
        email: '',
        password: '',
        company: '',
        contactPerson: '',
        phone: '',
        address: '',
        assignedTeamLead: '',
        status: 'active',
        createdAt: new Date().toISOString(),
        ticketCount: 0
      });
      fetchClients();
    } catch (error) {
      console.error('Error adding client:', error);
      toast.error('Failed to add client');
    }
  };

  const handleEditClient = async (e) => {
    e.preventDefault();
    try {
      // Validate team lead assignment
      if (!selectedClient.assignedTeamLead) {
        toast.warning('Please assign a team lead to the client');
        return;
      }

      const selectedTeamLead = teamLeads.find(lead => lead.id === selectedClient.assignedTeamLead);
      const clientRef = doc(db, 'clients', selectedClient.id);
      await updateDoc(clientRef, {
        ...selectedClient,
        teamLeadName: selectedTeamLead ? `${selectedTeamLead.firstName} ${selectedTeamLead.lastName}` : '',
        updatedAt: new Date().toISOString()
      });
      toast.success('Client updated successfully');
      setShowEditModal(false);
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteDoc(doc(db, 'clients', clientId));
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Management</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
        >
          <FaUserPlus className="mr-2" /> Add New Client
        </button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team Lead</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client) => (
              <tr key={client.id}>
                <td className="px-6 py-4 whitespace-nowrap">{client.clientId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{client.company}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>{client.contactPerson}</div>
                  <div className="text-sm text-gray-500">{client.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {teamLeads.find(lead => lead.id === client.assignedTeamLead)?.firstName 
                    ? `${teamLeads.find(lead => lead.id === client.assignedTeamLead)?.firstName} ${teamLeads.find(lead => lead.id === client.assignedTeamLead)?.lastName}`
                    : 'Not Assigned'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {client.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{client.ticketCount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setSelectedClient(client);
                      setShowEditModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Add New Client</h2>
            <form onSubmit={handleAddClient}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={newClient.name}
                    onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={newClient.password}
                    onChange={(e) => setNewClient({...newClient, password: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={newClient.company}
                    onChange={(e) => setNewClient({...newClient, company: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    value={newClient.contactPerson}
                    onChange={(e) => setNewClient({...newClient, contactPerson: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Team Lead</label>
                  <select
                    value={newClient.assignedTeamLead}
                    onChange={(e) => setNewClient({...newClient, assignedTeamLead: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Team Lead</option>
                    {loadingTeamLeads ? (
                      <option value="" disabled>Loading team leads...</option>
                    ) : teamLeads.length === 0 ? (
                      <option value="" disabled>No team leads available</option>
                    ) : (
                      teamLeads.map((lead) => (
                        <option key={lead.id} value={lead.id}>
                          {lead.firstName} {lead.lastName} - {lead.designation || 'Team Lead'}
                        </option>
                      ))
                    )}
                  </select>
                  {teamLeads.length === 0 && !loadingTeamLeads && (
                    <p className="mt-1 text-sm text-red-600">Please add team leads before creating clients</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={newClient.status}
                    onChange={(e) => setNewClient({...newClient, status: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Add Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Client Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Edit Client</h2>
            <form onSubmit={handleEditClient}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client ID</label>
                  <input
                    type="text"
                    value={selectedClient.clientId}
                    disabled
                    className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={selectedClient.name}
                    onChange={(e) => setSelectedClient({...selectedClient, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={selectedClient.email}
                    onChange={(e) => setSelectedClient({...selectedClient, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company</label>
                  <input
                    type="text"
                    value={selectedClient.company}
                    onChange={(e) => setSelectedClient({...selectedClient, company: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <input
                    type="text"
                    value={selectedClient.contactPerson}
                    onChange={(e) => setSelectedClient({...selectedClient, contactPerson: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    type="tel"
                    value={selectedClient.phone}
                    onChange={(e) => setSelectedClient({...selectedClient, phone: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <textarea
                    value={selectedClient.address}
                    onChange={(e) => setSelectedClient({...selectedClient, address: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Assigned Team Lead</label>
                  <select
                    value={selectedClient.assignedTeamLead}
                    onChange={(e) => setSelectedClient({...selectedClient, assignedTeamLead: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    required
                  >
                    <option value="">Select Team Lead</option>
                    {loadingTeamLeads ? (
                      <option value="" disabled>Loading team leads...</option>
                    ) : teamLeads.length === 0 ? (
                      <option value="" disabled>No team leads available</option>
                    ) : (
                      teamLeads.map((lead) => (
                        <option key={lead.id} value={lead.id}>
                          {lead.firstName} {lead.lastName} - {lead.designation || 'Team Lead'}
                        </option>
                      ))
                    )}
                  </select>
                  {teamLeads.length === 0 && !loadingTeamLeads && (
                    <p className="mt-1 text-sm text-red-600">Please add team leads before editing clients</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={selectedClient.status}
                    onChange={(e) => setSelectedClient({...selectedClient, status: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Update Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManagement; 