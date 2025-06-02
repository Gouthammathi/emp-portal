import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../../firebase';
import { FaTicketAlt, FaClock, FaCheck, FaSpinner } from 'react-icons/fa';

const MyTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const ticketsQuery = query(
      collection(db, 'tickets'),
      where('assignedTo', '==', user.uid)
    );

    const unsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
      const ticketList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getFilteredTickets = () => {
    switch (activeTab) {
      case 'pending':
        return tickets.filter(ticket => ticket.status === 'pending');
      case 'in-progress':
        return tickets.filter(ticket => ticket.status === 'in-progress');
      case 'completed':
        return tickets.filter(ticket => ticket.status === 'completed');
      default:
        return tickets;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
              <p className="mt-1 text-sm text-gray-500">View and manage your assigned tickets</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FaTicketAlt className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8 border border-gray-100">
          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'all'
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Tickets
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setActiveTab('in-progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'in-progress'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                activeTab === 'completed'
                  ? 'bg-green-100 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {getFilteredTickets().length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
              <FaTicketAlt className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">You don't have any tickets in this category.</p>
            </div>
          ) : (
            getFilteredTickets().map((ticket) => (
              <div
                key={ticket.id}
                className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{ticket.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{ticket.description}</p>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <FaClock className="mr-1.5 h-4 w-4" />
                        Due: {new Date(ticket.dueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FaCheck className="mr-1.5 h-4 w-4" />
                        Priority: {ticket.priority}
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MyTickets; 