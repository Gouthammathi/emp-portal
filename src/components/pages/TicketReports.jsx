import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  Clock,
  User,
  Tag,
  Search,
  Filter,
  ChevronDown,
  Download
} from 'lucide-react';
import { collection, query, onSnapshot, orderBy, where, getDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { getAuth } from 'firebase/auth';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function TicketReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('All');
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().role);
          console.log('Fetched user role:', userDoc.data().role);
        }
      } else {
        console.log('No authenticated user found.');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userRole) {
      console.log('User role not yet determined, skipping report fetch.');
      return;
    }

    let q;
    console.log('Attempting to fetch reports for role:', userRole);

    if (userRole === 'admin') {
      // Admin sees all reports
      q = query(collection(db, 'ticketReports'), orderBy('createdAt', 'desc'));
    } else if (userRole === 'manager') {
      // Manager sees reports for their team members
      q = query(
        collection(db, 'ticketReports'),
        where('completedBy.role', 'in', ['employee', 'team_lead']),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'supermanager') {
      // Supermanager sees reports for managers and their team members
      q = query(
        collection(db, 'ticketReports'),
        where('completedBy.role', 'in', ['manager', 'employee', 'team_lead']),
        orderBy('createdAt', 'desc')
      );
    } else if (userRole === 'csuite') {
      // C-suite sees all reports
      q = query(collection(db, 'ticketReports'), orderBy('createdAt', 'desc'));
    } else if (userRole === 'employee' || userRole === 'team_lead') {
      // Employees and team leads see their own reports
      const auth = getAuth();
      const userId = auth.currentUser?.uid;
      if (userId) {
        q = query(
          collection(db, 'ticketReports'),
          where('completedBy.id', '==', userId),
          orderBy('createdAt', 'desc')
        );
      }
    } else {
      setReports([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportsData = [];
      const projectSet = new Set();

      snapshot.forEach((doc) => {
        const report = { id: doc.id, ...doc.data() };
        reportsData.push(report);
        if (report.project) {
          projectSet.add(report.project);
        }
      });

      setReports(reportsData);
      setProjects(['All', ...Array.from(projectSet).sort()]);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching reports:', error);
      setError('Failed to load reports');
      setLoading(false);
    });

    console.log('Firestore query setup for role:', userRole, q);

    return () => unsubscribe();
  }, [userRole]);

  const formatTimeToComplete = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    if (filterProject === 'All') return matchesSearch;
    return matchesSearch && report.project === filterProject;
  });

  const handleDownloadExcel = () => {
    const dataToExport = filteredReports.map(report => ({
      'Ticket Number': report.ticketNumber,
      'Subject': report.subject,
      'Completed By (Name)': report.completedBy.name,
      'Completed By (Role)': report.completedBy.role,
      'Start Time': formatDate(report.startTime),
      'Completion Time': formatDate(report.completionTime),
      'Time to Complete': formatTimeToComplete(report.timeToComplete),
      'Project': report.project,
      'Priority': report.priority
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ticket Reports');
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'ticket_reports.xlsx');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Ticket Reports</h1>
                <p className="text-sm text-gray-500">View ticket completion reports and performance metrics</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <div className="relative">
                <Filter className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  {projects.map(project => (
                    <option key={project} value={project}>{project}</option>
                  ))}
                </select>
                <ChevronDown className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <button
              onClick={handleDownloadExcel}
              className="px-6 py-2 rounded-lg font-medium bg-blue-600 text-white flex items-center space-x-2 hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="w-5 h-5" />
              <span>Download as Excel</span>
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-200">
            {filteredReports.length === 0 ? (
              <div className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No reports found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <div key={report.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{report.subject}</h3>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {report.ticketNumber}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Completed By</p>
                            <p className="font-medium">{report.completedBy.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Time to Complete</p>
                            <p className="font-medium">{formatTimeToComplete(report.timeToComplete)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Completed On</p>
                            <p className="font-medium">{formatDate(report.completionTime)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">Project</p>
                            <p className="font-medium">{report.project}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        // TODO: Implement report download functionality
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketReports; 