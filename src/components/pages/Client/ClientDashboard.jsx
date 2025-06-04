import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  MessageSquare,
  Send,
  User,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Paperclip,
  Trash2,
  RefreshCw,
  Calendar,
  Tag,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, getDoc, where, orderBy } from 'firebase/firestore';
import { db } from '../../../firebase';
import { getAuth, signOut } from 'firebase/auth';
import { fetchUserNamesByIds } from '../../../utils/userUtils';

function ClientDashboard() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [newResponse, setNewResponse] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [assignedEmployeeNames, setAssignedEmployeeNames] = useState({});

  const handleLogout = async () => {
    try {
      await signOut(getAuth());
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  useEffect(() => {
    console.log('ClientDashboard: useEffect running.');
    const auth = getAuth();
    const currentUser = auth.currentUser;
    let unsubscribe = null; // Variable to hold the unsubscribe function
  
    const setupListener = async () => {
      if (!currentUser) {
        setError('User not authenticated.');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch client's assigned project
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
      
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          const project = userData.assignedProject || null;

          if (project) {
              // Query tickets for the assigned project
              const q = query(
                  collection(db, 'tickets'),
                  where('project', '==', project),
                  orderBy('created', 'desc')
              );
            
              // Set up the snapshot listener
              console.log('ClientDashboard: Setting up onSnapshot for query:', q);
              unsubscribe = onSnapshot(q,
                  async (querySnapshot) => {
                    console.log('ClientDashboard: onSnapshot triggered. Snapshot size:', querySnapshot.size);
                    console.log('ClientDashboard: onSnapshot snapshot data:', querySnapshot.docs.map(doc => doc.data()));
                    try {
                      const ticketsData = [];
                      const assignedToIds = new Set(); // Collect unique assignedTo IDs
                      querySnapshot.forEach((doc) => {
                        const data = doc.data();
                        ticketsData.push({
                          id: doc.id,
                          subject: data.subject || 'No Subject',
                          description: data.description || 'No Description',
                          status: data.status || 'Open',
                          created: data.created || null,
                          dueDate: data.dueDate || null,
                          ticketNumber: data.ticketNumber || `TKT-${doc.id}`,
                          adminResponses: data.adminResponses || [],
                          customerResponses: data.customerResponses || [],
                          employeeResponses: data.employeeResponses || [],
                          customer: data.customer || 'Unknown',
                          project: data.project || 'General',
                          assignedTo: data.assignedTo || null // Include assignedTo
                        });
                        if (data.assignedTo) {
                          assignedToIds.add(data.assignedTo);
                        }
                      });

                      // Fetch assigned employee names
                      if (assignedToIds.size > 0) {
                        const names = await fetchUserNamesByIds(Array.from(assignedToIds));
                        setAssignedEmployeeNames(names);
                      } else {
                        setAssignedEmployeeNames({});
                      }

                      // Sort tickets by created date in memory
                      ticketsData.sort((a, b) => {
                        const dateA = a.created?.toDate?.() || new Date(a.created);
                        const dateB = b.created?.toDate?.() || new Date(b.created);
                        return dateB - dateA;
                      });
                      setTickets(ticketsData);
                      setError(null);
                      setIsLoading(false);
                    } catch (err) {
                      console.error('Error processing tickets:', err);
                      setError('Error processing tickets. Please try again.');
                      setIsLoading(false);
                    }
                  },
                  (error) => {
                    console.error('Firestore error:', error);
                    setError('Error connecting to the server. Please try again.');
                    setIsLoading(false);
                  }
              );

          } else {
              // If no project is assigned, show no tickets
              setTickets([]);
              setError('No project assigned. Unable to load tickets.');
              setIsLoading(false);
          }

        } else {
          // Handle case where user doc doesn't exist
           setError('Client data not found.');
           setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        setError('Error loading client data. Please try again.');
        setIsLoading(false);
      }
    };

    setupListener();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };

  }, []);

  // Enhanced scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      // Use requestAnimationFrame to ensure DOM is updated
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedTicket) {
      // Use setTimeout to ensure messages are rendered
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    } else {
      // If no ticket is selected, no need to scroll
    }
  }, [selectedTicket?.adminResponses, selectedTicket?.customerResponses, selectedTicket?.employeeResponses, selectedTicket?.id]);

  // Effect to update selectedTicket when tickets list changes
  useEffect(() => {
    console.log('ClientDashboard: Update selectedTicket effect running.');
    console.log('ClientDashboard: Current selectedTicket at start:', selectedTicket);
    console.log('ClientDashboard: Current selectedTicket?.id:', selectedTicket?.id);
    console.log('ClientDashboard: Current tickets array in effect:', tickets);
    if (selectedTicket) {
      const latestSelectedTicket = tickets.find(ticket => ticket.id === selectedTicket.id);
      console.log('ClientDashboard: latestSelectedTicket found in tickets:', latestSelectedTicket);
      if (latestSelectedTicket) {
        console.log('ClientDashboard: latestSelectedTicket.employeeResponses:', latestSelectedTicket.employeeResponses);
        // Always update selectedTicket with the latest data from tickets array
        setSelectedTicket(latestSelectedTicket);
        console.log('ClientDashboard: selectedTicket updated with latest data:', latestSelectedTicket);
      }
    }
  }, [tickets]); // Only depend on tickets array changes

  const sendResponse = async (ticketId, message) => {
    if (!message.trim()) return;
   
    setIsSending(true);
    setError(null);
   
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const ticket = tickets.find(t => t.id === ticketId);
     
      const newResponse = {
        message: message.trim(),
        timestamp: new Date(),
        sender: 'customer'
      };
     
      await updateDoc(ticketRef, {
        customerResponses: [...(ticket.customerResponses || []), newResponse],
        lastUpdated: serverTimestamp()
      });
     
      setSelectedTicket(prev => ({
        ...prev,
        customerResponses: [...(prev.customerResponses || []), newResponse]
      }));
     
      setNewResponse('');
     
      // Scroll to bottom after sending message
      setTimeout(() => {
        scrollToBottom();
      }, 150);
     
    } catch (error) {
      console.error('Error sending response:', error);
      setError('Failed to send response. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case 'Open':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'In Progress':
        return `${baseClasses} bg-amber-100 text-amber-800`;
      case 'Resolved':
        return `${baseClasses} bg-emerald-100 text-emerald-800`;
      case 'Closed':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (date.toDateString() === now.toDateString()) {
      return timeStr;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeStr}`;
    } else if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} ${timeStr}`;
    } else {
      return `${date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })} ${timeStr}`;
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterStatus === 'All') return matchesSearch;
    return matchesSearch && ticket.status === filterStatus;
  });

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Connection Error</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Loading Tickets</h2>
          <p className="text-gray-600 leading-relaxed">Please wait while we connect to the server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Bar */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Client Support Portal</h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Ticket List */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              {/* Search and Filter Header */}
              <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Tickets</h3>
                  <button
                    onClick={() => navigate('/clientform')}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center space-x-2 text-sm font-medium shadow-lg hover:shadow-xl"
                  >
                    <Plus className="w-4 h-4" />
                    <span>New Ticket</span>
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                    />
                  </div>
                  <div className="relative">
                    <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white appearance-none"
                    >
                      <option value="All">All Tickets</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Ticket List */}
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-20rem)] overflow-y-auto">
                {filteredTickets.length === 0 ? (
                  <div className="p-8 text-center">
                    <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No tickets found</p>
                    <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className={`p-6 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 cursor-pointer transition-all duration-200 ${
                        selectedTicket?.id === ticket.id ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-r-4 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold text-gray-900 truncate text-lg">{ticket.subject}</h3>
                            <span className={getStatusBadge(ticket.status)}>{ticket.status}</span>
                          </div>
                          <p className="text-gray-600 text-sm line-clamp-2 mb-3">{ticket.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatMessageTime(ticket.created)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Tag className="w-4 h-4" />
                              <span>{ticket.project}</span>
                            </div>
                            {ticket.assignedTo && assignedEmployeeNames[ticket.assignedTo] && (
                              <div className="flex items-center space-x-1 text-sm text-gray-500 mt-2">
                                <User className="w-4 h-4" />
                                <span>Assigned to: {assignedEmployeeNames[ticket.assignedTo]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ticket Details */}
          <div className="col-span-12 lg:col-span-7">
            {selectedTicket ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden h-[calc(100vh-12rem)] flex flex-col">
                {/* Ticket Header */}
                <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 flex-shrink-0">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTicket.subject}</h2>
                    <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Created {formatMessageTime(selectedTicket.created)}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Tag className="w-4 h-4" />
                        <span>{selectedTicket.project}</span>
                      </span>
                      <span className={getStatusBadge(selectedTicket.status)}>{selectedTicket.status}</span>
                    </div>
                  </div>
                </div>

                {/* Communication Thread */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50 flex-shrink-0">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">Communication Thread</h3>
                  </div> */}
                 
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white"
                    style={{
                      scrollBehavior: 'smooth',
                      maxHeight: 'calc(100vh - 32rem)'
                    }}
                  >
                    {(() => {
                      console.log('ClientDashboard: selectedTicket.adminResponses:', selectedTicket.adminResponses);
                      console.log('ClientDashboard: selectedTicket.customerResponses:', selectedTicket.customerResponses);
                      console.log('ClientDashboard: selectedTicket.employeeResponses:', selectedTicket.employeeResponses);
                      const allMessages = [
                        {
                          type: 'customer',
                          message: selectedTicket.description,
                          timestamp: selectedTicket.created,
                          isInitial: true
                        },
                        ...(selectedTicket.adminResponses || []).map(response => ({
                          type: 'admin',
                          message: response.message,
                          timestamp: response.timestamp
                        })),
                        ...(selectedTicket.customerResponses || []).map(response => ({
                          type: 'customer',
                          message: response.message,
                          timestamp: response.timestamp
                        })),
                        // Employee responses
                        ...(selectedTicket.employeeResponses || []).map(response => ({
                          type: 'employee',
                          message: response.message,
                          timestamp: response.timestamp,
                        }))
                      ].sort((a, b) => {
                        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
                        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
                        return timeA - timeB;
                      });

                      console.log('ClientDashboard: allMessages before rendering:', allMessages);
                      
                      return allMessages.map((msg, index) => (
                        console.log('ClientDashboard: Rendering message:', msg),
                        <div
                          key={index}
                          className={`flex ${msg.type === 'customer' ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          <div className={`max-w-[75%] ${msg.type === 'customer' ? 'order-2' : 'order-1'}`}>
                            <div className={`rounded-2xl px-4 py-3 shadow-lg ${
                              msg.type === 'customer'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                : msg.type === 'admin' || msg.type === 'employee' ? 'bg-white border border-gray-200 text-gray-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-xs font-semibold ${
                                  msg.type === 'customer' ? 'text-blue-100'
                                  : msg.type === 'admin' || msg.type === 'employee' ? 'text-gray-500'
                                  : 'text-gray-600'
                                }`}>
                                  {msg.type === 'customer'
                                    ? (msg.isInitial ? 'Initial Request' : 'Your Response')
                                    : msg.type === 'admin' || msg.type === 'employee' ? 'Support Team'
                                    : 'Unknown Sender'
                                  }
                                </span>
                                <span className={`text-xs ${
                                  msg.type === 'customer' ? 'text-blue-100' : 'text-gray-400'
                                }`}>
                                  {formatMessageTime(msg.timestamp)}
                                </span>
                              </div>
                              <p className={`text-sm leading-relaxed ${
                                msg.type === 'customer' ? 'text-white' : 'text-gray-700'
                              }`}>
                                {msg.message}
                              </p>
                            </div>
                          </div>
                          {msg.type === 'customer' ? (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center ml-3 order-1 flex-shrink-0">
                              <User className="w-4 h-4 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mr-3 order-2 flex-shrink-0">
                              <MessageSquare className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                    <div key={`${selectedTicket.adminResponses?.length}-${selectedTicket.customerResponses?.length}-${selectedTicket.employeeResponses?.length}`} ref={messagesEndRef} />
                  </div>
                </div>

                {/* Response Input */}
                <div className="p-6 border-t border-gray-200 bg-white flex-shrink-0">
                  <div className="space-y-4">
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                      rows="3"
                      placeholder="Type your response here..."
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      disabled={isSending}
                    />
                    {error && (
                      <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{error}</span>
                      </div>
                    )}
                    <button
                      onClick={() => sendResponse(selectedTicket.id, newResponse)}
                      disabled={isSending || !newResponse.trim()}
                      className={`w-full py-3 px-6 rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 font-medium ${
                        isSending || !newResponse.trim()
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                      }`}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          <span>Send Response</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center h-[calc(100vh-12rem)] flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                  <Mail className="w-10 h-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Ticket</h3>
                <p className="text-gray-500">Choose a ticket from the list to view details and communicate with support</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientDashboard;