import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, serverTimestamp, arrayUnion, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
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
 
const EmployeeAssignedTickets = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newResponse, setNewResponse] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef(null);
  const [filterStatus, setFilterStatus] = useState('All Tickets');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusCounts, setStatusCounts] = useState({
    Open: 0,
    'In Progress': 0,
    Resolved: 0,
    Closed: 0
  });
 
  // Add messagesContainerRef for scrolling
  const messagesContainerRef = useRef(null);
 
  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          // setUserData(userDoc.data());
        }
      }
      setLoading(false);
    };
 
    fetchUserData();
  }, []);
 
  // Listen for tickets assigned to this employee
  useEffect(() => {
    const auth = getAuth();
    const currentUser = auth.currentUser;
 
    if (!currentUser) {
      setTickets([]);
      console.warn("Employee not authenticated, cannot fetch assigned tickets.");
      setLoading(false);
      return;
    }
 
    const ticketsQuery = query(
      collection(db, 'tickets'),
      where('assignedTo', '==', currentUser.uid)
    );
 
    const unsubscribe = onSnapshot(ticketsQuery, (snapshot) => {
      const ticketList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketList);
     
      // Update status counts
      const counts = {
        Open: 0,
        'In Progress': 0,
        Resolved: 0,
        Closed: 0
      };
      ticketList.forEach(ticket => {
        counts[ticket.status] = (counts[ticket.status] || 0) + 1;
      });
      setStatusCounts(counts);
     
      console.log('EmployeeAssignedTickets: onSnapshot received tickets:', ticketList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching assigned tickets:", error);
      setLoading(false);
    });
 
    return () => unsubscribe();
  }, []);
 
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedTicket?.adminResponses, selectedTicket?.employeeResponses, selectedTicket?.customerResponses]);
 
  // Enhanced scroll to bottom function
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      requestAnimationFrame(() => {
        container.scrollTop = container.scrollHeight;
      });
    }
  };
 
  // Scroll to bottom when messages change
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
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
     
      const newResponse = {
        message: message.trim(),
        timestamp: new Date(),
        sender: 'employee',
        senderId: getAuth().currentUser.uid
      };
     
      await updateDoc(ticketRef, {
        employeeResponses: arrayUnion(newResponse),
        lastUpdated: serverTimestamp()
      });
     
      setTickets(prevTickets =>
        prevTickets.map(t =>
          t.id === ticketId
            ? { ...t, employeeResponses: [...(t.employeeResponses || []), newResponse] }
            : t
        )
      );
     
      setSelectedTicket(prev =>
        prev && prev.id === ticketId
          ? { ...prev, employeeResponses: [...(prev.employeeResponses || []), newResponse] }
          : prev
      );
     
      setNewResponse('');
    } catch (error) {
      console.error('Error sending response:', error);
      console.log('Tickets state after sending response:', tickets);
      console.log('Selected ticket state after sending response:', selectedTicket);
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
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-amber-100 text-amber-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
 
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-amber-100 text-amber-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
 
  const getFileIcon = (file) => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'application':
        if (file.type.includes('pdf')) return <FileText className="w-4 h-4" />;
        return <File className="w-4 h-4" />;
      default: return <File className="w-4 h-4" />;
    }
  };
 
  const updateTicketStatus = async (ticketId, newStatus) => {
    console.log(`updateTicketStatus called for ticketId: ${ticketId}, newStatus: ${newStatus}`); // Debug log
    try {
      const ticketRef = doc(db, 'tickets', ticketId);
      const ticketDoc = await getDoc(ticketRef);
      const ticketData = ticketDoc.data();
     
      // Optimistically update local state BEFORE Firestore update
      setTickets(prevTickets =>
        prevTickets.map(t =>
          t.id === ticketId ? { ...t, status: newStatus, lastUpdated: new Date() } : t
        )
      );
      setSelectedTicket(prev => prev && prev.id === ticketId ? { ...prev, status: newStatus, lastUpdated: new Date() } : prev);
 
      // If status is being changed to Closed, generate report
      if (newStatus === 'Closed') {
        console.log('Ticket is being closed, preparing report...'); // Debug log
        const completionTime = new Date();
        const startTime = ticketData.assignedAt?.toDate() || ticketData.created.toDate();
        const timeToComplete = completionTime - startTime;
       
        // Create report data
        const reportData = {
          ticketId: ticketId,
          ticketNumber: ticketData.ticketNumber,
          subject: ticketData.subject,
          completedBy: {
            id: ticketData.assignedTo,
            name: ticketData.assignedToName,
            role: ticketData.assignedToRole
          },
          startTime: startTime,
          completionTime: completionTime,
          timeToComplete: timeToComplete,
          project: ticketData.project,
          priority: ticketData.priority,
          createdAt: serverTimestamp()
        };
 
        // Add report to reports collection
        await addDoc(collection(db, 'ticketReports'), reportData);
        console.log('Report added to ticketReports collection:', reportData); // Debug log
 
        // Send notification to next level in hierarchy
        let notificationTo = null;
        if (ticketData.assignedToRole === 'employee') {
          // If employee completed, notify manager
          notificationTo = 'manager';
        } else if (ticketData.assignedToRole === 'manager') {
          // If manager completed, notify supermanager
          notificationTo = 'supermanager';
        } else if (ticketData.assignedToRole === 'supermanager') {
          // If supermanager completed, notify C-suite
          notificationTo = 'csuite';
        }
 
        if (notificationTo) {
          await addDoc(collection(db, 'notifications'), {
            type: 'ticket_completed',
            ticketId: ticketId,
            ticketNumber: ticketData.ticketNumber,
            subject: ticketData.subject,
            completedBy: {
              id: ticketData.assignedTo,
              name: ticketData.assignedToName,
              role: ticketData.assignedToRole
            },
            timeToComplete: timeToComplete,
            notificationTo: notificationTo,
            createdAt: serverTimestamp(),
            read: false
          });
        }
      }
 
      // Update ticket status in Firestore
      await updateDoc(ticketRef, {
        status: newStatus,
        lastUpdated: serverTimestamp()
      });
 
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };
 
  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
   
    if (filterStatus === 'All Tickets') return matchesSearch;
    return matchesSearch && ticket.status === filterStatus;
  });
 
  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <Loader2 className="animate-spin text-4xl text-blue-600" />
    </div>
  );
 
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">My Assigned Tickets</h1>
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
              <span className="text-gray-500 bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">
                ({filteredTickets.length})
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
 
        {tickets.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <Mail className="text-gray-400 w-16 h-16 mx-auto mb-4" />
            <p className="text-xl font-semibold text-gray-700">No tickets assigned to you yet.</p>
            <p className="text-gray-500 mt-2">Check back later or contact your manager if you expected tickets.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tickets List */}
            <div className="lg:col-span-1 space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                    selectedTicket?.id === ticket.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="text-gray-900 font-medium truncate">{ticket.subject}</h3>
                      </div>
                      <p className="text-sm text-gray-500 mt-1 flex items-center">
                        <User className="w-4 h-4 mr-1" />
                        {ticket.customer} • {formatMessageTime(ticket.created)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={ticket.status}
                        onChange={(e) => {
                          console.log(`EmployeeAssignedTickets: onChange triggered for ticket ${ticket.id}. Raw event target value: ${e.target.value}`); // New debug log for raw value
                          // e.stopPropagation(); // Keeping this commented out
                          const selectedValue = e.target.value; // Explicitly capture value
                          console.log(`EmployeeAssignedTickets: Value of selectedValue immediately after assignment: ${selectedValue}`); // NEW DEBUG LOG
                          console.log(`EmployeeAssignedTickets: Attempting to update status for ticket ${ticket.id} to: ${selectedValue}`); // Debug log with captured value
                          updateTicketStatus(ticket.id, selectedValue);
                        }}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                        // onClick removed entirely
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Closed">Closed</option>
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
 
                                        {/* Chat Section */}
            {selectedTicket && (
              <div className="lg:col-span-2 bg-white rounded-lg shadow-lg flex flex-col h-[550px]">
               <div className="p-2 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center justify-between">
              <h2 className="flex justify-center items-center text-lg font-semibold text-white">Communication Thread</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-white hover:text-blue-200 transition-colors p-1"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
         
            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                  <div className="bg-gray-50 rounded-xl w-40 h-16 p-1">
                  {/* <h3 className="font-semibold text-gray-900 mb-1">Attachments</h3> */}
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
          </div>
                                      {/* Communication Thread */}
                <div className="flex-1 flex flex-col min-h-0">
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-gray-50/50 to-white"
                    style={{
                      scrollBehavior: 'smooth',
                      maxHeight: 'calc(100vh - 28rem)'
                    }}
                  >
                    {(() => {
                      const allMessages = [
                        {
                          type: 'customer',
                          message: selectedTicket.description,
                          timestamp: selectedTicket.created,
                          isInitial: true,
                          attachments: selectedTicket.attachments || []
                        },
                        ...(selectedTicket.adminResponses || []).map(response => ({
                          type: 'admin',
                          message: response.message,
                          timestamp: response.timestamp,
                          attachments: response.attachments || []
                        })),
                        ...(selectedTicket.customerResponses || []).map(response => ({
                          type: 'customer',
                          message: response.message,
                          timestamp: response.timestamp,
                          attachments: response.attachments || []
                        })),
                        ...(selectedTicket.employeeResponses || []).map(response => ({
                          type: 'employee',
                          message: response.message,
                          timestamp: response.timestamp,
                          sender: response.sender || 'Employee',
                          senderId: response.senderId,
                          attachments: response.attachments || []
                        }))
                      ].sort((a, b) => {
                        const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
                        const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
                        return timeA - timeB;
                      });
 
                      return allMessages.map((msg, index) => (
                        <div
                          key={index}
                          className={`flex ${msg.type === 'admin' || msg.type === 'employee' ? 'justify-end' : 'justify-start'} mb-4`}
                        >
                          <div className={`max-w-[75%] ${msg.type === 'admin' || msg.type === 'employee' ? 'order-2' : 'order-1'}`}>
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
                                    : msg.type === 'employee'
                                    ? msg.sender || 'Employee'
                                    : msg.isInitial
                                    ? 'Customer Initial Request'
                                    : 'Customer'
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
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-3 space-y-2">
                                  {msg.attachments.map((file, fileIndex) => (
                                    <div key={fileIndex} className="flex items-center space-x-2 text-white/80 text-xs bg-black/20 p-2 rounded-lg">
                                      {getFileIcon(file)}
                                      <span>{file.name}</span>
                                      <a
                                        href={file.data}
                                        download={file.name}
                                        className="ml-auto text-white/90 hover:text-white"
                                        onClick={(e) => e.stopPropagation()} // Prevent bubbling to message div
                                      >
                                        <Download className="w-4 h-4" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ));
                    })()}
                    <div ref={messagesEndRef} />
                  </div>
 
                  {/* Response Input */}
                  <div className="p-4 border-t border-gray-200 bg-white flex items-center space-x-3">
                    <textarea
                      value={newResponse}
                      onChange={(e) => setNewResponse(e.target.value)}
                      placeholder="Type your response..."
                      rows="1"
                      className="flex-1 resize-none border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    ></textarea>
                    <button
                      onClick={() => sendResponse(selectedTicket.id, newResponse)}
                      disabled={isSending || !newResponse.trim()}
                      className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${
                        isSending || !newResponse.trim()
                          ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5" />
                      )}
                      <span>{isSending ? 'Sending...' : 'Send'}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
 
export default EmployeeAssignedTickets;