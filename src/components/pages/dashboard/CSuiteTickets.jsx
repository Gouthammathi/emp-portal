import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db } from '../../../firebase';
import { getAuth } from 'firebase/auth';
import {
  Mail,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
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
  LogOut,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';

function CSuiteTickets() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [error, setError] = useState(null);
  const [newResponse, setNewResponse] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [groupedTickets, setGroupedTickets] = useState({});
  const [superManagerNames, setSuperManagerNames] = useState({});
  const [assignedToNames, setAssignedToNames] = useState({});
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (!currentUser) {
          setError('User not authenticated');
          setIsLoading(false);
          return;
        }

        // Fetch CSuite user data
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          setError('User data not found');
          setIsLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        console.log('CSuite user data:', userData);
        
        if (userData.role !== 'c-suite') {
          setError('Unauthorized access');
          setIsLoading(false);
          return;
        }

        // Fetch all super managers
        const superManagersQuery = query(
          collection(db, 'users'),
          where('role', '==', 'superManager'),
          where('isActive', '==', true)
        );
        const superManagersSnapshot = await getDocs(superManagersQuery);
        
        const superManagerUids = [];
        const superManagerNamesMap = {};
        
        // First, get all super managers and their empIds
        const superManagerEmpIds = new Set();
        superManagersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.empId) {
            superManagerEmpIds.add(data.empId);
          }
        });

        // Create a map of managerId to super manager details
        const managerToSuperManagerMap = {};
        superManagersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.empId) {
            managerToSuperManagerMap[data.empId] = {
              uid: doc.id,
              name: data.name || (data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : null)
            };
            // Also add to superManagerNamesMap directly
            if (managerToSuperManagerMap[data.empId].name) {
              superManagerNamesMap[doc.id] = managerToSuperManagerMap[data.empId].name;
              superManagerUids.push(doc.id);
            }
          }
        });

        // Only fetch team members if we have super manager empIds
        if (superManagerEmpIds.size > 0) {
          try {
            // Now fetch all users who have these empIds as their managerId
            const teamMembersQuery = query(
              collection(db, 'users'),
              where('managerId', 'in', Array.from(superManagerEmpIds))
            );
            const teamMembersSnapshot = await getDocs(teamMembersQuery);

            // Now process the team members to get super manager names
            teamMembersSnapshot.forEach(doc => {
              const data = doc.data();
              if (data.managerId && managerToSuperManagerMap[data.managerId]) {
                const superManager = managerToSuperManagerMap[data.managerId];
                if (superManager.name) {
                  superManagerNamesMap[superManager.uid] = superManager.name;
                  if (!superManagerUids.includes(superManager.uid)) {
                    superManagerUids.push(superManager.uid);
                  }
                }
              }
            });
          } catch (error) {
            console.error('Error fetching team members:', error);
            // Continue with the super manager names we already have
          }
        }
        
        console.log('Super Manager Names Map:', superManagerNamesMap);
        setSuperManagerNames(superManagerNamesMap);

        // Create a map of project to super manager IDs
        const projectSuperManagersMap = {};
        superManagersSnapshot.forEach(doc => {
          const data = doc.data();
          if (data.projects && Array.isArray(data.projects)) {
            data.projects.forEach(project => {
              if (!projectSuperManagersMap[project]) {
                projectSuperManagersMap[project] = new Set();
              }
              projectSuperManagersMap[project].add(doc.id);
            });
          }
        });
        console.log('Project to Super Managers Map:', projectSuperManagersMap);

        // Fetch all tickets
        const ticketsQuery = query(
          collection(db, 'tickets'),
          orderBy('created', 'desc')
        );
        
        const unsubscribe = onSnapshot(ticketsQuery, async (snapshot) => {
          const ticketsData = [];
          const assignedToIds = new Set();
          
          snapshot.forEach((doc) => {
            const data = doc.data();
            console.log('Ticket data:', doc.id, data);
            ticketsData.push({
              id: doc.id,
              ...data,
              created: data.created?.toDate?.(),
              dueDate: data.dueDate?.toDate?.(),
              lastUpdated: data.lastUpdated?.toDate?.(),
              adminResponses: data.adminResponses || [],
              customerResponses: data.customerResponses || [],
              employeeResponses: data.employeeResponses || [],
              assignedToName: data.assignedToName || 'Unknown'
            });
            
            if (data.assignedTo) {
              assignedToIds.add(data.assignedTo);
            }
          });

          console.log('Assigned To IDs:', Array.from(assignedToIds));

          // Fetch assigned to names
          const assignedToNamesMap = {};
          for (const assignedToId of assignedToIds) {
            try {
              const userDoc = await getDoc(doc(db, 'users', assignedToId));
              if (userDoc.exists()) {
                const userData = userDoc.data();
                console.log('Assigned To User data:', assignedToId, userData);
                // Use assignedToName from ticket if available, otherwise use user's name
                const userName = userData.name || (userData.firstName && userData.lastName ? `${userData.firstName} ${userData.lastName}` : null);
                if (userName) {
                  assignedToNamesMap[assignedToId] = userName;
                }
              }
            } catch (error) {
              console.error('Error fetching user data for ID:', assignedToId, error);
            }
          }
          
          console.log('Assigned To Names Map:', assignedToNamesMap);
          setAssignedToNames(assignedToNamesMap);

          // Group tickets by project and super manager
          const grouped = {};
          ticketsData.forEach(ticket => {
            const project = ticket.project || 'Unassigned';
            const superManagerIdsForProject = projectSuperManagersMap[project] || new Set();

            if (superManagerIdsForProject.size > 0) {
              superManagerIdsForProject.forEach(superManagerId => {
                if (superManagerNamesMap[superManagerId]) { // Only group if super manager name was fetched
                  if (!grouped[project]) {
                    grouped[project] = {};
                  }
                  if (!grouped[project][superManagerId]) {
                    grouped[project][superManagerId] = [];
                  }
                  grouped[project][superManagerId].push(ticket);
                }
              });
            } else {
              // Handle tickets with projects that have no assigned super manager
              if (!grouped[project]) {
                grouped[project] = {};
              }
              // Group these under a special key, e.g., 'Unassigned Super Manager'
              if (!grouped[project]['Unassigned Super Manager']) {
                grouped[project]['Unassigned Super Manager'] = [];
              }
              grouped[project]['Unassigned Super Manager'].push(ticket);
            }
          });

          console.log('Grouped Tickets:', grouped);
          setGroupedTickets(grouped);
          setTickets(ticketsData);
          setIsLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Error loading tickets. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };

  useEffect(() => {
    if (selectedTicket) {
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    }
  }, [selectedTicket?.adminResponses, selectedTicket?.customerResponses, selectedTicket?.employeeResponses, selectedTicket?.id]);

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
        sender: 'admin',
        senderId: getAuth().currentUser.uid,
        senderRole: 'csuite'
      };
     
      await updateDoc(ticketRef, {
        adminResponses: [...(ticket.adminResponses || []), newResponse],
        lastUpdated: serverTimestamp()
      });
     
      setSelectedTicket(prev => ({
        ...prev,
        adminResponses: [...(prev.adminResponses || []), newResponse]
      }));
     
      setNewResponse('');
     
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Error</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center space-x-2 font-medium shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Retry</span>
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
          <p className="text-gray-600 leading-relaxed">Please wait while we fetch the tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/csuite-dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">All Tickets</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div className="relative">
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
                >
                  <option value="All">All Status</option>
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Ticket List */}
          <div className="col-span-12 lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100 max-h-[calc(100vh-12rem)] overflow-y-auto">
                {Object.entries(groupedTickets).map(([project, superManagerTickets]) => (
                  <div key={project} className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">{project}</h3>
                    {Object.entries(superManagerTickets).map(([superManagerId, projectTickets]) => {
                      console.log('Rendering tickets for superManagerId:', superManagerId, 'Name:', superManagerNames[superManagerId]);
                      return (
                        <div key={superManagerId} className="mb-6">
                          {/* <h4 className="text-sm font-medium text-gray-600 mb-2">
                            Super Manager: {superManagerNames[superManagerId] || 'Unknown'}
                          </h4> */}
                          {projectTickets
                            .filter(ticket => {
                              const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                 ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
                              if (filterStatus === 'All') return matchesSearch;
                              return matchesSearch && ticket.status === filterStatus;
                            })
                            .map(ticket => {
                              console.log('Rendering ticket:', ticket.id, 'SuperManagerId from group:', superManagerId, 'SuperManager Name:', superManagerNames[superManagerId]);
                              console.log('Rendering ticket:', ticket.id, 'Assigned to:', ticket.assignedTo, 'Name:', assignedToNames[ticket.assignedTo]);
                              return (
                                <div
                                  key={ticket.id}
                                  className={`p-4 mb-2 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200 cursor-pointer ${
                                    selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : 'bg-white'
                                  }`}
                                  onClick={() => setSelectedTicket(ticket)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      {superManagerNames[superManagerId] && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Project Manager: {superManagerNames[superManagerId]}
                                        </p>
                                      )}
                                      <h5 className="text-sm font-semibold text-gray-800 truncate">{ticket.subject}</h5>
                                      <span className={getStatusBadge(ticket.status)}>{ticket.status}</span>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 ml-2" />
                                  </div>
                                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{ticket.description}</p>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <div className="flex items-center space-x-1">
                                      <Calendar className="w-4 h-4" />
                                      <span>{formatMessageTime(ticket.created)}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Tag className="w-4 h-4" />
                                      <span>{ticket.project}</span>
                                    </div>
                                    {ticket.assignedTo && (
                                      <div className="flex items-center space-x-1">
                                        <User className="w-4 h-4" />
                                        <span>Assigned to: {ticket.assignedToName || assignedToNames[ticket.assignedTo] || 'Unknown'}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      );
                    })}
                  </div>
                ))}
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
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white"
                    style={{
                      scrollBehavior: 'smooth',
                      maxHeight: 'calc(100vh - 32rem)'
                    }}
                  >
                    {(() => {
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
                          timestamp: response.timestamp,
                          senderRole: response.senderRole
                        })),
                        ...(selectedTicket.customerResponses || []).map(response => ({
                          type: 'customer',
                          message: response.message,
                          timestamp: response.timestamp
                        })),
                        ...(selectedTicket.employeeResponses || []).map(response => ({
                          type: 'employee',
                          message: response.message,
                          timestamp: response.timestamp,
                          senderRole: response.senderRole
                        }))
                      ].sort((a, b) => {
                        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
                        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
                        return timeA - timeB;
                      });

                      return allMessages.map((msg, index) => (
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
                                    ? (msg.isInitial ? 'Initial Request' : 'Customer')
                                    : msg.type === 'admin'
                                    ? (msg.senderRole === 'csuite' ? 'C-Suite' : 'Admin')
                                    : msg.type === 'employee'
                                    ? (msg.senderRole === 'superManager' ? 'Project Manager' :
                                       msg.senderRole === 'manager' ? 'Team Lead' :
                                       'Employee')
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
                    <div ref={messagesEndRef} />
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

export default CSuiteTickets;