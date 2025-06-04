import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { FaUserPlus, FaUsers, FaTicketAlt, FaEdit, FaTrash, FaSearch, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; // Import Firebase auth

// Assuming PREDEFINED_PROJECTS is defined similarly to Employees.jsx
const PREDEFINED_PROJECTS = [
  {
    name: 'VMM',
    description: 'Variable Message Management System Project'
  },
  {
    name: 'Daikin',
    description: 'Daikin Air Conditioning Systems Project'
  },
  {
    name: 'Danfoss',
    description: 'Danfoss Industrial Solutions Project'
  }
];

const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false); // Keep for potential future use, though tile click will open edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamLeads, setTeamLeads] = useState([]); // Keep if assigning team lead to client is still needed
  const [filterStatus, setFilterStatus] = useState('all'); // Keep if filtering by status is still needed
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    password: '',
    assignedProject: '',
  });

  const [newClientFormData, setNewClientFormData] = useState({
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
    // No assignedProject here as it will be assigned after creation/edit
  });

  const auth = getAuth(); // Initialize Firebase Auth

  useEffect(() => {
    fetchClients();
    fetchTeamLeads(); // Keep if assigning team lead is still needed
  }, []);

  const fetchTeamLeads = async () => {
    try {
      const teamLeadsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'manager')
      );
      const snapshot = await getDocs(teamLeadsQuery);
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTeamLeads(leads);
    } catch (error) {
      console.error('Error fetching team leads:', error);
      toast.error('Failed to load team leads');
    }
  };

  const fetchClients = async () => {
    try {
      const clientsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'client')
      );
      const snapshot = await getDocs(clientsQuery);
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
      // 1. Create user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, newClientFormData.email, newClientFormData.password);
      const user = userCredential.user;

      // 2. Save additional client information to Firestore 'users' collection
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid, // Store auth UID as well
        email: user.email,
        clientId: newClientFormData.clientId, // Use the provided client ID
        name: newClientFormData.name, // Assuming name is a single field now based on previous forms
        company: newClientFormData.company,
        contactPerson: newClientFormData.contactPerson,
        phone: newClientFormData.phone,
        address: newClientFormData.address,
        assignedTeamLead: newClientFormData.assignedTeamLead,
        status: newClientFormData.status,
        role: 'client', // Set role explicitly
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // assignedProject will be set via edit modal
      });

      toast.success('Client added successfully');
      // setShowAddModal(false); // Removed to keep modal open
      // Reset form data
      setNewClientFormData({
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
      });
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error adding client:', error);
      // Provide specific error messages for common auth errors
      if (error.code === 'auth/email-already-in-use') {
        toast.error('Error: The email address is already in use by another account.');
      } else if (error.code === 'auth/invalid-email') {
         toast.error('Error: The email address is not valid.');
      } else if (error.code === 'auth/weak-password') {
         toast.error('Error: The password is too weak.');
      } else {
        toast.error(`Failed to add client: ${error.message}`);
      }
    }
  };

  const handleEditClient = async (e) => {
    e.preventDefault();
    try {
      const clientRef = doc(db, 'users', selectedClient.id);
      const updateData = {
        name: editFormData.name,
        email: editFormData.email,
        assignedProject: editFormData.assignedProject,
        updatedAt: new Date().toISOString()
      };

      // Handle password update separately if provided
      if (editFormData.password) {
         // Note: Updating password via Firebase Admin SDK is required for users not currently logged in
         // This front-end approach using updatePassword with the client's current session might not work
         // for an admin editing another user's password unless the admin is impersonating the user
         // or using cloud functions/backend. For simplicity here, we'll include a note.
         // A robust solution would involve triggering a backend function.
         console.warn("Password update from admin UI for another user typically requires Firebase Admin SDK or a backend function.");
         // In a real app, you'd likely call a backend function here
         // updateData.password = editFormData.password; // DO NOT do this directly for security
      }

      await updateDoc(clientRef, updateData);

      toast.success('Client updated successfully');
      setShowEditModal(false);
      fetchClients(); // Refresh the list
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (window.confirm('Are you sure you want to delete this client? This will permanently remove their user account.')) {
      try {
        // To fully delete a user, you need to delete them from Firebase Auth AND Firestore.
        // Deleting from Auth typically requires the Firebase Admin SDK or a backend function.
        // This front-end code will only delete the Firestore document.
        console.warn("Deleting user from Firebase Auth typically requires Firebase Admin SDK or a backend function.");
        // In a real app, you'd likely call a backend function here to delete the Auth user as well.

        await deleteDoc(doc(db, 'users', clientId));
        toast.success('Client deleted successfully');
        fetchClients(); // Refresh the list
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error('Failed to delete client');
      }
    }
  };

  const handleTileClick = (client) => {
    setSelectedClient(client);
    setEditFormData({
      name: client.name || client.firstName || '', // Account for potential firstName/lastName fields
      email: client.email || '',
      password: '', // Don't pre-fill password for security
      assignedProject: client.assignedProject || '',
      // Copy other fields if needed for editing
      // company: client.company || '',
      // contactPerson: client.contactPerson || '',
      // phone: client.phone || '',
      // address: client.address || '',
      // assignedTeamLead: client.assignedTeamLead || '',
      // status: client.status || 'active',
    });
    setShowEditModal(true);
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.assignedProject?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Assuming you still want to filter by status if applicable to client user documents
    const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading clients...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Client Management</h1>
        {/* Button to open Add New Client modal */}
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
        {/* Keep status filter if client user documents have a status field */}
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

      {/* Clients Grid (Tiles) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">No clients found.</div>
        ) : (
          filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => handleTileClick(client)}
            >
              <div className="flex items-center mb-4">
                {/* Assuming client user documents have a 'name' and potentially 'image' */}
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-bold mr-4">
                   {client.name ? client.name[0] : '?'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{client.name || 'N/A'}</h3>
                  {/* Assuming client user documents have an 'email' */}
                  <p className="text-sm text-gray-600">{client.email || 'N/A'}</p>
                </div>
              </div>
              <div className="text-sm text-gray-700 space-y-2">
                 {/* Displaying relevant client details from user document */}
                 <p><strong>Client ID:</strong> {client.clientId || client.empId || 'N/A'}</p>
                 <p><strong>Company:</strong> {client.company || 'N/A'}</p>
                 <p><strong>Assigned Project:</strong> {client.assignedProject || 'Not Assigned'}</p>
                 {/* Displaying status if available in user document */}
                 <p><strong>Status:</strong> <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {client.status || 'N/A'}
                 </span></p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Add New Client</h2>
            <form onSubmit={handleAddClient} className="space-y-6">
              {/* Client ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                <input
                  type="text"
                  name="clientId"
                  value={newClientFormData.clientId}
                  onChange={(e) => setNewClientFormData({...newClientFormData, clientId: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  required
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={newClientFormData.name}
                  onChange={(e) => setNewClientFormData({...newClientFormData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={newClientFormData.email}
                  onChange={(e) => setNewClientFormData({...newClientFormData, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={newClientFormData.password}
                  onChange={(e) => setNewClientFormData({...newClientFormData, password: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  required
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  name="company"
                  value={newClientFormData.company}
                  onChange={(e) => setNewClientFormData({...newClientFormData, company: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  required
                />
              </div>

              {/* Contact Person */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={newClientFormData.contactPerson}
                  onChange={(e) => setNewClientFormData({...newClientFormData, contactPerson: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={newClientFormData.phone}
                  onChange={(e) => setNewClientFormData({...newClientFormData, phone: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                />
              </div>

              {/* Address */}
              <div className="col-span-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={newClientFormData.address}
                  onChange={(e) => setNewClientFormData({...newClientFormData, address: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  rows="3"
                />
              </div>

              {/* Assigned Team Lead */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Team Lead</label>
                <select
                  name="assignedTeamLead"
                  value={newClientFormData.assignedTeamLead}
                  onChange={(e) => setNewClientFormData({...newClientFormData, assignedTeamLead: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                >
                  <option value="">Select Team Lead</option>
                  {teamLeads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={newClientFormData.status}
                  onChange={(e) => setNewClientFormData({...newClientFormData, status: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-6">Edit Client: {selectedClient.name || selectedClient.firstName || 'N/A'}</h2> {/* Also check firstName */}
            <form onSubmit={handleEditClient} className="space-y-6">
              {/* Client ID - Display Only */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                <input
                  type="text"
                  value={selectedClient.clientId || selectedClient.empId || 'N/A'}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2"
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  required
                />
              </div>

              {/* Password - Optional Update */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  name="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({...editFormData, password: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                  placeholder="Enter new password if changing"
                />
              </div>

              {/* Assigned Project */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Project</label>
                <select
                  name="assignedProject"
                  value={editFormData.assignedProject}
                  onChange={(e) => setEditFormData({...editFormData, assignedProject: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                >
                  <option value="">Select Project</option>
                  {PREDEFINED_PROJECTS.map((project) => (
                    <option key={project.name} value={project.name}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Keep Team Lead and Status if needed in client user document */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Team Lead</label>
                <select
                  value={editFormData.assignedTeamLead}
                  onChange={(e) => setEditFormData({...editFormData, assignedTeamLead: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                >
                  <option value="">Select Team Lead</option>
                  {teamLeads.map((lead) => (
                    <option key={lead.id} value={lead.id}>
                      {lead.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div> */}

              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={() => handleDeleteClient(selectedClient.id)}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Delete Client
                </button>
                <div className="flex gap-4">
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
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* Delete Confirmation (Optional - can be triggered from tile click context menu or separate button in modal) */}
       {/* {showDeleteModal && selectedClient && ( ... )} */}
    </div>
  );
};

export default ClientManagement; 