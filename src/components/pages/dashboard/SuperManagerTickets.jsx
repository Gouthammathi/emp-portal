import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot, doc, getDoc, updateDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaTicketAlt, FaUser, FaProjectDiagram, FaClock, FaCheck, FaTimes } from 'react-icons/fa';
import {
  Mail,
  Filter,
  Search,
  MoreHorizontal,
  Star,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Minus,
  Eye,
  MessageSquare,
  File,
  FileText,
  Image,
  Video,
  Download,
  Send,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  Bell,
  Home,
  BarChart3,
  Users,
  Activity,
  Zap,
  TrendingUp
} from 'lucide-react';

const SuperManagerTickets = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newResponse, setNewResponse] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [responseError, setResponseError] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState('All Tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    Open: 0,
    'In Progress': 0,
    Resolved: 0,
    Closed: 0
  });
  const [projects, setProjects] = useState([]);
  const [managers, setManagers] = useState({});
  const [selectedProject, setSelectedProject] = useState('All Projects');
  const [selectedManager, setSelectedManager] = useState('All Managers');
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('list');
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [selectedTicketDetails, setSelectedTicketDetails] = useState(null);
  const [showCommunicationThread, setShowCommunicationThread] = useState(false);
  const [selectedTicketForThread, setSelectedTicketForThread] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setError("Please log in to view tickets");
        setLoading(false);
        return;
      }

      try {
        // Get current user's data using the auth UID
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          setError("User data not found");
          setLoading(false);
          return;
        }

        const userData = userDocSnap.data();
        console.log("Super Manager Data:", userData);
        
        // Verify that the user is a super manager
        if (userData.role !== 'supermanager') {
          setError("Access denied. Only super managers can view this page.");
          setLoading(false);
          return;
        }

        // Find all managers under this super manager using superManagerId
        const managersQuery = query(
          collection(db, "users"),
          where("superManagerId", "==", userData.empId),
          where("role", "==", "manager"),
          where("status", "==", "active")
        );
        
        const managersSnapshot = await getDocs(managersQuery);
        const managersData = {};
        const managerProjects = new Set();
        
        managersSnapshot.forEach(doc => {
          const managerData = doc.data();
          managersData[doc.id] = {
            name: `${managerData.firstName} ${managerData.lastName}`,
            project: managerData.assignedProject,
            empId: managerData.empId,
            uid: doc.id
          };
          if (managerData.assignedProject) {
            managerProjects.add(managerData.assignedProject);
          }
        });

        console.log("Managers under Super Manager:", managersData);
        console.log("Manager Projects:", Array.from(managerProjects));
        setManagers(managersData);

        if (Object.keys(managersData).length === 0) {
          console.log("No managers found under this super manager");
          setTickets([]);
          setLoading(false);
          return;
        }

        // Set up real-time listener for tickets
        const ticketsQuery = query(
          collection(db, "tickets"),
          where("project", "in", Array.from(managerProjects))
        );

        const unsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
          const ticketsData = [];
          snapshot.forEach(doc => {
            const ticket = doc.data();
            // Find the manager who owns this project
            const projectManager = Object.values(managersData).find(
              manager => manager.project === ticket.project
            );
            
            if (projectManager) {
              ticketsData.push({
                id: doc.id,
                ...ticket,
                managerName: projectManager.name,
                project: projectManager.project,
                managerEmpId: projectManager.empId
              });
            }
          });
          
          console.log("Final tickets data:", ticketsData);
          setTickets(ticketsData);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error loading tickets: " + error.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique projects from tickets and update state
  useEffect(() => {
    const uniqueProjects = ['All Projects', ...new Set(tickets.map(ticket => ticket.project))];
    setProjects(uniqueProjects);
  }, [tickets]);

  // Filter tickets based on selected project and status
  useEffect(() => {
    const filtered = tickets.filter(ticket => {
      const projectMatch = selectedProject === 'All Projects' || ticket.project === selectedProject;
      const statusMatch = filterStatus === 'All Tickets' || ticket.status === filterStatus;
      return projectMatch && statusMatch;
    });
    setFilteredTickets(filtered);
  }, [tickets, selectedProject, filterStatus]);

  // Group tickets by project
  const groupedTickets = filteredTickets.reduce((acc, ticket) => {
    if (!acc[ticket.project]) {
      acc[ticket.project] = [];
    }
    acc[ticket.project].push(ticket);
    return acc;
  }, {});

  const sendResponse = async (ticketId, message) => {
    if (!message.trim()) return;
   
    setIsSending(true);
    setResponseError(null);
   
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const ticket = tickets.find(t => t.id === ticketId);
     
      const newResponse = {
        message: message.trim(),
        timestamp: new Date(),
        sender: 'super_manager',
        senderId: getAuth().currentUser.uid,
        senderRole: 'supermanager'
      };
     
      await updateDoc(ticketRef, {
        adminResponses: arrayUnion(newResponse),
        lastUpdated: serverTimestamp()
      });
     
      // Update local state for selected ticket
      setSelectedTicketDetails(prev => ({
        ...prev,
        adminResponses: [...(prev.adminResponses || []), newResponse],
        lastUpdated: new Date()
      }));

      // Update local state for tickets list
      setTickets(prevTickets =>
        prevTickets.map(t =>
          t.id === ticketId
            ? {
                ...t,
                adminResponses: [...(t.adminResponses || []), newResponse],
                lastUpdated: new Date()
              }
            : t
        )
      );
     
      setNewResponse('');
    } catch (error) {
      console.error('Error sending response:', error);
      setResponseError('Failed to send response. Please try again.');
    } finally {
      setIsSending(false);
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

  const handleTicketClick = (ticket) => {
    setSelectedTicketDetails(ticket);
    setShowTicketDetails(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'Resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'Closed':
        return <XCircle className="w-5 h-5 text-gray-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'border-red-500 text-red-700 bg-red-50';
      case 'medium':
        return 'border-yellow-500 text-yellow-700 bg-yellow-50';
      case 'low':
        return 'border-green-500 text-green-700 bg-green-50';
      default:
        return 'border-gray-500 text-gray-700 bg-gray-50';
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Manager Tickets Overview</h1>

      {/* Debug Information */}
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <p>Total Tickets: {tickets.length}</p>
        <p>Filtered Tickets: {filteredTickets.length}</p>
        <p>Projects: {projects.join(', ')}</p>
     
        <p>Number of Managers: {Object.keys(managers).length}</p>
      </div>

      {Object.keys(managers).length === 0 ? (
        <div className="text-center text-gray-500 mt-8">
          No managers found under your supervision. Please contact the administrator if this is incorrect.
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select
              className="p-2 border rounded"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              {projects.map(project => (
                <option key={project} value={project}>
                  {project === 'All Projects' ? 'All Projects' : project}
                </option>
              ))}
            </select>

            <select
              className="p-2 border rounded"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="All Tickets">All Tickets</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          {/* Tickets List */}
          <div className="mt-6 space-y-6">
            {Object.entries(groupedTickets).map(([project, projectTickets]) => (
              <div key={project} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700">
                  <h2 className="text-xl font-semibold text-white">{project}</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {projectTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket)}
                      className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(ticket.status)}
                            <h3 className="text-gray-900 font-medium truncate">{ticket.subject}</h3>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {ticket.customer} • {formatMessageTime(ticket.created)}
                          </p>
                          {/* Display assignment details */}
                          {ticket.assignedTo && (
                            <p className="text-sm text-gray-500 mt-1 flex items-center">
                              <User className="w-4 h-4 mr-1" />
                              Assigned to: {ticket.assignedToName}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <select
                            value={ticket.status}
                            onChange={(e) => {
                              e.stopPropagation();
                              updateTicketStatus(ticket.id, e.target.value);
                            }}
                            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <option>Open</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                            <option>Closed</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 mt-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Ticket Details Modal */}
          {showTicketDetails && selectedTicketDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedTicketDetails.subject}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedTicketDetails.status)}`}>
                          {selectedTicketDetails.status}
                        </span>
                        <span className="text-gray-500">#{selectedTicketDetails.ticketNumber}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowTicketDetails(false);
                        setSelectedTicketDetails(null);
                      }}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-12rem)]">
                  <div className="space-y-6">
                    {/* Ticket Information */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-4">Ticket Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500">Project</p>
                          <p className="font-medium">{selectedTicketDetails.project}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Manager</p>
                          <p className="font-medium">{managers[selectedTicketDetails.managerId]?.name || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Created</p>
                          <p className="font-medium">{formatMessageTime(selectedTicketDetails.created)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Last Updated</p>
                          <p className="font-medium">{formatMessageTime(selectedTicketDetails.lastUpdated)}</p>
                        </div>
                        {selectedTicketDetails.assignedTo && (
                          <div>
                            <p className="text-sm text-gray-500">Assigned To</p>
                            <p className="font-medium">{selectedTicketDetails.assignedToName}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                      <p className="text-gray-600 whitespace-pre-wrap">{selectedTicketDetails.description}</p>
                    </div>

                    {/* Attachments */}
                    {selectedTicketDetails.attachments && selectedTicketDetails.attachments.length > 0 && (
                      <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <h3 className="font-semibold text-gray-900 mb-4">Attachments</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                          {selectedTicketDetails.attachments.map((attachment, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                {attachment.type.startsWith('image/') ? (
                                  <Image className="w-8 h-8 text-blue-500" />
                                ) : attachment.type.startsWith('video/') ? (
                                  <Video className="w-8 h-8 text-blue-500" />
                                ) : (
                                  <FileText className="w-8 h-8 text-blue-500" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                                  <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                                </div>
                                <button
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Communication Thread */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="font-semibold text-gray-900 mb-4 text-center">Communication Thread</h3>
                      <div className="space-y-4">
                        {(() => {
                          const allMessages = [
                            // Initial ticket message
                            {
                              type: 'customer',
                              message: selectedTicketDetails.description,
                              timestamp: selectedTicketDetails.created,
                              isInitial: true
                            },
                            // Admin responses
                            ...(selectedTicketDetails.adminResponses || []).map(response => ({
                              type: 'admin',
                              message: response.message,
                              timestamp: response.timestamp,
                              sender: response.sender || 'Manager',
                              senderRole: response.senderRole || 'manager'
                            })),
                            // Customer responses
                            ...(selectedTicketDetails.customerResponses || []).map(response => ({
                              type: 'customer',
                              message: response.message,
                              timestamp: response.timestamp
                            })),
                            // Employee responses
                            ...(selectedTicketDetails.employeeResponses || []).map(response => ({
                              type: 'employee',
                              message: response.message,
                              timestamp: response.timestamp,
                              sender: response.sender || 'Employee',
                              senderId: response.senderId
                            }))
                          ].sort((a, b) => {
                            const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
                            const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
                            return timeA - timeB;
                          });

                          return allMessages.map((msg, index) => (
                            <div
                              key={index}
                              className={`flex ${msg.type === 'customer' ? 'justify-start' : 'justify-end'}`}
                            >
                              <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                  msg.type === 'customer'
                                    ? 'bg-white border border-gray-200'
                                    : msg.type === 'admin'
                                    ? 'bg-blue-100'
                                    : msg.type === 'employee'
                                    ? 'bg-green-100'
                                    : 'bg-gray-100'
                                }`}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className={`text-xs font-medium ${
                                    msg.type === 'customer'
                                      ? 'text-gray-600'
                                      : msg.type === 'admin'
                                      ? 'text-blue-600'
                                      : msg.type === 'employee'
                                      ? 'text-green-600'
                                      : 'text-gray-600'
                                  }`}>
                                    {msg.type === 'customer' 
                                      ? selectedTicketDetails.customer
                                      : msg.type === 'admin'
                                      ? (msg.senderRole === 'supermanager' || msg.sender === 'super_manager' ? 'Project Manager' : 'Team Lead')
                                      : msg.type === 'employee'
                                      ? msg.sender || 'Employee'
                                      : 'Unknown'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatMessageTime(msg.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">{msg.message}</p>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>

                    {/* Response Input */}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <div className="space-y-2">
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="3"
                          placeholder="Type your response here..."
                          value={newResponse}
                          onChange={(e) => setNewResponse(e.target.value)}
                          disabled={isSending}
                        />
                        {responseError && (
                          <p className="text-red-600 text-sm">{responseError}</p>
                        )}
                        <button
                          onClick={() => sendResponse(selectedTicketDetails.id, newResponse)}
                          disabled={isSending || !newResponse.trim()}
                          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors ${
                            isSending || !newResponse.trim()
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-blue-600 hover:bg-blue-700 text-white'
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
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SuperManagerTickets; 