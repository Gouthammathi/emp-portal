import React, { useState, useEffect } from 'react';
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
  Settings,
  Trash2,
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
  TrendingUp,
  Phone
} from 'lucide-react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, serverTimestamp, where, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import orgChartData from '../../data/orgchart.json';

function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newResponse, setNewResponse] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [responseError, setResponseError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All Tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState('Classic View');
  const [activeTab, setActiveTab] = useState('tickets');
  const [statusCounts, setStatusCounts] = useState({
    Open: 0,
    'In Progress': 0,
    Resolved: 0,
    Closed: 0
  });
  const [userRole, setUserRole] = useState(null);
  const [userProject, setUserProject] = useState(null);
  const [userEmpId, setUserEmpId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [employeeNames, setEmployeeNames] = useState({});

  // Function to fetch registered team members based on manager's empId and orgchart
  const fetchRegisteredTeamMembers = async (managerEmpId) => {
      if (!managerEmpId) return [];
     
      try {
        // Find all employees who have this manager's empId as their managerId in orgchart
        const orgChartTeamMembers = orgChartData.organizationChart.filter(
          emp => String(emp.managerId) === String(managerEmpId)
        );

        if (orgChartTeamMembers.length === 0) {
          console.log("No team members found in orgchart for managerEmpId:", managerEmpId);
          return [];
        }

        // Check which of these employees are registered in the database
        const registeredTeamMembers = [];
       
        for (const member of orgChartTeamMembers) {
          // Check if employee is registered in users collection by empId
          const userQuery = query(
            collection(db, "users"),
            where("empId", "==", member.empId)
          );
          const userSnapshot = await getDocs(userQuery);
         
          if (!userSnapshot.empty) {
            // Employee is registered, add their data including Firestore document ID (Auth UID)
            const userData = userSnapshot.docs[0].data();
            registeredTeamMembers.push({
              id: userSnapshot.docs[0].id, // Firebase Auth UID
              ...member, // Data from orgchart (employeeName, empId, etc.)
              ...userData, // Data from users collection (role, assignedProject, etc.)
              isRegistered: true
            });
          }
        }
        // console.log("Fetched registered team members using orgchart:", registeredTeamMembers);
        return registeredTeamMembers;

      } catch (error) {
        console.error("Error fetching registered team members:", error);
        return [];
      }
  };

  // Initialize with Firestore: Fetch user data (role, project, and empId)
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
     
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
         
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserRole(userData.role);
            setUserProject(userData.assignedProject);
            setUserEmpId(userData.empId); // Fetch and set user's empId
          } else {
             console.warn("User document not found for UID:", user.uid);
             setUserRole(null);
             setUserProject(null);
             setUserEmpId(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
           setUserRole(null);
           setUserProject(null);
           setUserEmpId(null);
        }
      }
    };

    fetchUserData();
  }, []); // Run once on component mount

  // Set up ticket listener based on user role and project/assignedTo
  useEffect(() => {
    if (!userRole) {
        setTickets([]);
        setStatusCounts({ Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 });
        return; // Wait for user role to be fetched
    }
    // If user is manager or client, wait for project too
    if ((userRole === 'manager' || userRole === 'client') && !userProject) {
         setTickets([]);
         setStatusCounts({ Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 });
         return;
    }

    let q;
    if (userRole === 'admin') {
      // Admin sees all tickets
      q = query(collection(db, 'tickets'), orderBy('created', 'desc'));
    } else if (userRole === 'manager' && userProject) {
      // Manager sees tickets for their assigned project
      q = query(
        collection(db, 'tickets'),
        where('project', '==', userProject),
        orderBy('created', 'desc')
      );
    } else if (userRole === 'employee') {
      // Employee sees only tickets assigned to them
      const currentUser = getAuth().currentUser;
       if (!currentUser) {
           setTickets([]);
           setStatusCounts({ Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 });
           console.warn("Employee not authenticated, cannot fetch assigned tickets.");
           return;
       }
      q = query(
        collection(db, 'tickets'),
        where('assignedTo', '==', currentUser.uid),
        orderBy('created', 'desc')
      );
    } else if (userRole === 'client' && userProject) {
      // Client sees all tickets for their assigned project
      q = query(
        collection(db, 'tickets'),
        where('project', '==', userProject),
        orderBy('created', 'desc')
      );
    } else {
      // For other roles or if no project is assigned (and not admin), show no tickets
       console.log("No ticket query for role:", userRole, " and project:", userProject);
      setTickets([]);
      setStatusCounts({
        Open: 0,
        'In Progress': 0,
        Resolved: 0,
        Closed: 0
      });
      return;
    }

    console.log('TicketsPage: Setting up onSnapshot for query:', q);
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const ticketsData = [];
      const counts = {
        Open: 0,
        'In Progress': 0,
        Resolved: 0,
        Closed: 0
      };

      querySnapshot.forEach((doc) => {
        const ticket = { id: doc.id, ...doc.data() };
        ticketsData.push(ticket);
        counts[ticket.status] = (counts[ticket.status] || 0) + 1;
      });

      setTickets(ticketsData);
      setStatusCounts(counts);
    });

    // Cleanup listener on component unmount or when dependencies change
    return () => unsubscribe();
  }, [userRole, userProject]); // Rerun effect when userRole or userProject changes

  // Add useEffect to fetch team members when user is a manager and userEmpId is set
  useEffect(() => {
      if (userRole === 'manager' && userEmpId) {
        // Use the extracted function to fetch team members
        fetchRegisteredTeamMembers(userEmpId)
            .then(members => {
                setTeamMembers(members);
                 console.log("Fetched registered team members for manager:", userEmpId, members);
            })
            .catch(error => {
                console.error('Error fetching team members:', error);
                setTeamMembers([]); // Clear team members on error
            });
      } else {
          setTeamMembers([]); // Clear team members if not manager or userEmpId not set
      }
  }, [userRole, userEmpId]); // Rerun effect when userRole or userEmpId changes

  // Add useEffect to fetch employee names when team members are fetched
  useEffect(() => {
    const fetchEmployeeNames = async () => {
      const names = {};
      for (const member of teamMembers) {
        const userDocRef = doc(db, 'users', member.id);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          const userData = userDocSnap.data();
          names[member.id] = { name: member.employeeName, email: userData.email, phone: userData.phone };
        }
      }
      setEmployeeNames(names);
    };

    fetchEmployeeNames();
  }, [teamMembers]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Open': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'In Progress': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'Closed': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-700 bg-red-100 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Low': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Open': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'In Progress': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'Resolved': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'Closed': return 'text-gray-700 bg-gray-100 border-gray-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };
  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        status: newStatus
      });
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const toggleStar = async (ticketId) => {
    const ticket = tickets.find(t => t.id === ticketId);
    try {
      await updateDoc(doc(db, 'tickets', ticketId), {
        starred: !ticket.starred
      });
    } catch (error) {
      console.error('Error toggling star:', error);
    }
  };

  const deleteTicket = async (ticketId) => {
    try {
      await deleteDoc(doc(db, 'tickets', ticketId));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(null);
      }
    } catch (error) {
      console.error('Error deleting ticket:', error);
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());  
   
    if (activeTab === 'starred') {
      return matchesSearch && ticket.starred;
    }
   
    if (filterStatus === 'All Tickets') return matchesSearch;
    return matchesSearch && ticket.status === filterStatus;
  });

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    // Format time as HH:mm
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // If today, just show time
    if (date.toDateString() === now.toDateString()) {
      return timeStr;
    }
    // If yesterday, show "Yesterday"
    else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeStr}`;
    }
    // If this year, show date and time
    else if (date.getFullYear() === now.getFullYear()) {
      return `${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })} ${timeStr}`;
    }
    // If different year, show full date and time
    else {
      return `${date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })} ${timeStr}`;
    }
  };

  const getDueDateText = (priority, created) => {
    const createdDate = created?.toDate?.() || new Date(created);
    let endOfDay, twoDaysLater, fiveDaysLater;
   
    switch (priority) {
      case 'High':
        // For high priority, due by end of day
        endOfDay = new Date(createdDate);
        endOfDay.setHours(23, 59, 59);
        return `Due by ${endOfDay.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
     
      case 'Medium':
        // For medium priority, due in 2 days
        twoDaysLater = new Date(createdDate);
        twoDaysLater.setDate(twoDaysLater.getDate() + 2);
        return `Due in 2 days (${twoDaysLater.toLocaleDateString()})`;
     
      case 'Low':
        // For low priority, due in 5 days
        fiveDaysLater = new Date(createdDate);
        fiveDaysLater.setDate(fiveDaysLater.getDate() + 5);
        return `Due in 5 days (${fiveDaysLater.toLocaleDateString()})`;
     
      default:
        return 'No due date set';
    }
  };

  const renderTicketCard = (ticket) => {
    if (view === 'Compact View') {
      return (
        <div
          key={ticket.id}
          className={`group relative bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer ${
            selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-300' : ''
          }`}
          onClick={() => setSelectedTicket(ticket)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
                <Mail className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 truncate max-w-xs">{ticket.subject}</h3>
                <p className="text-sm text-gray-500">{ticket.customer}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Assign to dropdown for Managers (Team Leads) */}
              {userRole === 'manager' && (
                <select
                  value={ticket.assignedTo || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    assignTicketToTeamMember(ticket.id, e.target.value);
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Assign to team member</option>
                  <option value="unassign">Unassign Ticket</option>
                  {teamMembers.map((member) => (
                    // Use member.id (Auth UID) as the value and member.employeeName/empId for display
                    <option key={member.id} value={member.id}>
                      {member.employeeName} ({member.empId})
                    </option>
                  ))}
                </select>
              )}
              {/* Display Assigned Team Member for Employees - Visible only if assigned */}
               {userRole === 'employee' && ticket.assignedTo && (
                   <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                       Assigned to: {teamMembers.find(member => member.id === ticket.assignedTo)?.employeeName || 'N/A'}
                   </span>
               )}

              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Classic View Rendering (similar logic)
    return (
      <div
        key={ticket.id}
        className={`group relative bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer ${
          selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500 bg-blue-50/50 border-blue-300' : ''
        }`}
        onClick={() => setSelectedTicket(ticket)}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4 flex-1">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <h3 className="font-semibold text-gray-900 text-lg">{ticket.subject}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                  <User className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Client Name</p>
                    <p className="text-gray-700 font-medium">{ticket.customer}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Email</p>
                    <p className="text-gray-700 font-medium">{ticket.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                  <Phone className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Phone</p>
                    <p className="text-gray-700 font-medium">{ticket.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Project</p>
                    <p className="text-gray-700 font-medium">{ticket.project}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="text-gray-700 font-medium">{new Date(ticket.created?.toDate()).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-500">Due Date</p>
                    <p className="text-gray-700 font-medium">{getDueDateText(ticket.priority, ticket.created)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
         
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(ticket.status)}
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
           
            {userRole === 'manager' && (
                <select
                  value={ticket.assignedTo || ''}
                  onChange={(e) => {
                    e.stopPropagation();
                    assignTicketToTeamMember(ticket.id, e.target.value);
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Assign to team member</option>
                  <option value="unassign">Unassign Ticket</option>
                   {teamMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.employeeName} ({member.empId})
                    </option>
                  ))}
                </select>
            )}
             {/* Display Assigned Team Member for Employees - Visible only if assigned */}
               {userRole === 'employee' && ticket.assignedTo && (
                   <span className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 flex items-center space-x-1">
                       <User className="w-4 h-4" />
                       <span>Assigned: {teamMembers.find(member => member.id === ticket.assignedTo)?.employeeName || 'N/A'}</span>
                   </span>
               )}
           
            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getPriorityColor(ticket.priority)}`}>
              {ticket.priority}
            </span>
           
            <Star
              className={`w-5 h-5 cursor-pointer transition-colors ${
                ticket.starred ? 'text-yellow-500 fill-current' : 'text-gray-300 hover:text-yellow-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                toggleStar(ticket.id);
              }}
            />
           
            {userRole === 'client' && (
              <Trash2
                className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this ticket?')) {
                    deleteTicket(ticket.id);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const sendResponse = async (ticketId, message) => {
    if (!message.trim()) return;
   
    setIsSending(true);
    setResponseError(null);
   
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const ticket = tickets.find(t => t.id === ticketId);
     
      const newResponse = {
        message: message.trim(),
        timestamp: new Date()
      };
     
      await updateDoc(ticketRef, {
        adminResponses: [...(ticket.adminResponses || []), newResponse],
        lastUpdated: serverTimestamp()
      });
     
      // Update local state
      setSelectedTicket(prev => ({
        ...prev,
        adminResponses: [...(prev.adminResponses || []), newResponse]
      }));
     
      setNewResponse('');
    } catch (error) {
      console.error('Error sending response:', error);
      setResponseError('Failed to send response. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Add function to assign ticket to team member
  const assignTicketToTeamMember = async (ticketId, teamMemberId) => {
    try {
      // If 'unassign' is selected, clear the assignment
      if (teamMemberId === 'unassign') {
         await updateDoc(doc(db, 'tickets', ticketId), {
           assignedTo: null,
           assignedToName: null,
           assignedAt: null,
           status: 'Open' // Or change status as appropriate for unassigned
         });
         return; // Exit the function after unassigning
      }

      // Find the team member's data to get their name
      const assignedTeamMember = teamMembers.find(member => member.id === teamMemberId);
      const assignedToName = assignedTeamMember ? assignedTeamMember.employeeName : 'Unknown';

      await updateDoc(doc(db, 'tickets', ticketId), {
        assignedTo: teamMemberId,
        assignedToName: assignedToName, // Store the assigned team member's name
        assignedAt: serverTimestamp(),
        status: 'In Progress'
      });
    } catch (error) {
      console.error('Error assigning ticket:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tickets</h1>
                
              </div>
            </div>
           
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-4">
          {/* Sidebar */}
          <div className="w-48 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'tickets'
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                   <Mail className="w-5 h-5" />
                  <span>All Tickets</span>
                  <span className={`ml-auto text-sm px-2 py-1 rounded-full ${
                    activeTab === 'tickets' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {statusCounts.Open + statusCounts['In Progress']}
                  </span>
                </button>
               
                <button
                  onClick={() => setActiveTab('starred')}
                  className={`w-full flex items-center space-x-3 p-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === 'starred'
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Star className="w-5 h-5" />
                  <span>Starred</span>
                  <span className={`ml-auto text-sm px-2 py-1 rounded-full ${
                    activeTab === 'starred' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {tickets.filter(t => t.starred).length}
                  </span>
                </button>
                {/* <button
                  onClick={() => setActiveTab('calendar')}
                  className={`w-full flex items-center space-x-3 p-2.5 rounded-lg ${
                    activeTab === 'calendar' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Calendar className="w-5 h-5" />
                  <span className="font-medium">Calendar</span>
                </button> */}
              </div>
               {/* Status Overview */}
               <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Status Overview</h3>
                <div className="space-y-3">
                  {Object.entries(statusCounts).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(status)}
                        <span className="text-sm text-gray-700">{status}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'calendar' ? (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Tickets</h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="text-sm font-medium text-gray-600">March 2024</span>
                    <button className="p-2 hover:bg-gray-100 rounded-lg">
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                  {Array.from({ length: 35 }, (_, i) => {
                    const date = new Date(2024, 2, i - 3);
                    const dayTickets = tickets.filter(ticket => {
                      const ticketDate = ticket.dueDate?.toDate();
                      return ticketDate &&
                             ticketDate.getDate() === date.getDate() &&
                             ticketDate.getMonth() === date.getMonth() &&
                             ticketDate.getFullYear() === date.getFullYear();
                    });
                   
                    return (
                      <div
                        key={i}
                        className={`min-h-[80px] p-2 border rounded-lg ${
                          date.getMonth() === 2 ? 'bg-white' : 'bg-gray-50'
                        }`}
                      >
                        <div className="text-sm text-gray-500 mb-1">{date.getDate()}</div>
                        {dayTickets.map(ticket => (
                          <div
                            key={ticket.id}
                            className="text-xs p-1 mb-1 rounded bg-blue-50 text-blue-600 truncate cursor-pointer"
                            onClick={() => setSelectedTicket(ticket)}
                          >
                            {ticket.subject}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <>
                {/* Toolbar */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-3">
                        <Star className="w-6 h-6 text-blue-600" />
                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="text-xl font-bold bg-transparent border-none outline-none cursor-pointer text-gray-900"
                        >
                          <option>All Tickets</option>
                          <option>Open</option>
                          <option>In Progress</option>
                          <option>Resolved</option>
                          <option>Closed</option>
                        </select>
                        <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">({filteredTickets.length})</span>
                      </div>
                    </div>
                   
                    <div className="flex items-center space-x-4">
                     
                      <select
                        value={view}
                        onChange={(e) => setView(e.target.value)}
                        className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option>Classic View</option>
                        <option>Compact View</option>
                      </select>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tickets ...."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
                </div>

                {/* Tickets List */}
                <div className="space-y-4">
                  {filteredTickets.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-gray-400" />
                  </div>
                      <p className="text-lg font-semibold text-gray-900 mb-2">No tickets found</p>
                      <p className="text-gray-500">
                        {searchTerm ? 'Try adjusting your search terms' : 'New tickets will appear here'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredTickets.map(renderTicketCard)}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ticket Detail Panel */}
      {selectedTicket && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-gray-200 shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-white hover:text-blue-200 transition-colors p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
         
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-6">
            <div className='grid grid-cols-2 gap-4'>
            <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
                  <p className="text-gray-700">{selectedTicket.customer}</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Subject</h3>
                <p className="text-gray-700">{selectedTicket.subject}</p>
              </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Priority</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedTicket.priority)}`}>
                    {selectedTicket.priority}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Project</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(selectedTicket.project)}`}>
                    {selectedTicket.project}
                  </span>
                </div>
            </div>
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                  <div className="space-y-2">
                    {selectedTicket.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            {file.type.includes('image') ? (
                              <Image className="w-4 h-4 text-blue-600" />
                            ) : file.type.includes('video') ? (
                              <Video className="w-4 h-4 text-purple-600" />
                            ) : file.type.includes('pdf') ? (
                              <FileText className="w-4 h-4 text-red-600" />
                            ) : (
                              <File className="w-4 h-4 text-gray-600" />
                            )}
                            </div>
                            <div className="flex items-center space-x-2">
                         
                        </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.type.includes('image') && (
                            <button
                              className="text-gray-400 hover:text-blue-500"
                              onClick={() => {
                                const newWindow = window.open();
                                newWindow.document.write(`
                                  <html>
                                    <head>
                                      <title>${file.name}</title>
                                      <style>
                                        body { margin: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f3f4f6; }
                                        img { max-width: 100%; max-height: 90vh; object-fit: contain; }
                                      </style>
                                    </head>
                                    <body>
                                      <img src="${file.data}" alt="${file.name}" />
                                    </body>
                                  </html>
                                `);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            className="text-gray-400 hover:text-blue-500"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.data;
                              link.download = file.name;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
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
                  {/* Combine and sort all messages */}
                  {(() => {
                    const allMessages = [
                      // Initial ticket message
                      {
                        type: 'customer',
                        message: selectedTicket.description,
                        timestamp: selectedTicket.created,
                        isInitial: true
                      },
                      // Admin responses
                      ...(selectedTicket.adminResponses || []).map(response => ({
                        type: 'admin',
                        message: response.message,
                        timestamp: response.timestamp
                      })),
                      // Customer responses
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
                        sender: response.sender || 'Employee', // Use sender name if available, default to Employee
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
  className={`flex ${msg.type === 'admin' ? 'justify-end' : 'justify-start'} mb-4`}
>
  <div className={`max-w-[75%] ${msg.type === 'admin' ? 'order-2' : 'order-1'}`}>
    <div className={`rounded-2xl px-4 py-3 shadow-lg ${
      msg.type === 'admin' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white' :
      msg.type === 'employee' ? 'bg-blue-500 text-white' :
      'bg-white border border-gray-200 text-gray-800'
    }`}>
      <div className="flex items-center justify-between mb-2">
        <span className={`text-xs font-semibold ${
          msg.type === 'admin' ? 'text-green-100' :
          msg.type === 'employee' ? 'text-blue-100' :
          'text-gray-500'
        }`}>
          {msg.type === 'admin'
            ? 'Admin'
            : msg.type === 'employee' ? msg.sender : (msg.isInitial ? 'Initial Request' : 'Client Response')
          }
        </span>
        <span className={`text-xs ${
          msg.type === 'admin' ? 'text-green-100' :
          msg.type === 'employee' ? 'text-blue-100' :
          'text-gray-400'
        }`}>
          {formatMessageTime(msg.timestamp)}
        </span>
      </div>
      <p className={`text-sm leading-relaxed ${
        msg.type === 'admin' || msg.type === 'employee' ? 'text-white' : 'text-gray-700'
      }`}>
        {msg.message}
      </p>
    </div>
  </div>
  {msg.type === 'admin' || msg.type === 'employee' ? (
    <div className="w-8 h-8 bg-gradient-to-r  flex items-center justify-center ml-3 order-1 flex-shrink-0">
      {/* <User className="w-4 h-4 text-white" /> */}
    </div>
  ) : (
    <div className="w-8 h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center mr-3 order-2 flex-shrink-0">
      <MessageSquare className="w-4 h-4 text-white" />
    </div>
  )}
</div>
                    ));
                  })()}
                </div>
              </div>

             
            </div>
          </div>

          {/* Response Input */}
          <div className="p-4 border-t bg-white sticky bottom-0">
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
                onClick={() => sendResponse(selectedTicket.id, newResponse)}
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
      )}
    </div>
  );
}

export default TicketsPage;
