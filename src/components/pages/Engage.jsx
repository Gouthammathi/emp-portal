import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
 
const Engage = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [kudos, setKudos] = useState([]);
  const [polls, setPolls] = useState([]);
  const [newKudos, setNewKudos] = useState({ to: '', message: '' });
  const [newPoll, setNewPoll] = useState({ question: '', options: ['', ''] });
  const [showKudosForm, setShowKudosForm] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'birthdays', 'anniversaries', 'kudos', 'polls'
 
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
 
    const fetchData = async () => {
      try {
        // Fetch employees
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const allEmployees = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(allEmployees);
 
        // Fetch kudos with ordering
        const kudosQuery = query(collection(db, 'kudos'), orderBy('timestamp', 'desc'));
        const kudosSnapshot = await getDocs(kudosQuery);
        const allKudos = kudosSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setKudos(allKudos);
 
        // Fetch polls with ordering
        const pollsQuery = query(collection(db, 'polls'), orderBy('timestamp', 'desc'));
        const pollsSnapshot = await getDocs(pollsQuery);
        const allPolls = pollsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPolls(allPolls);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoadingData(false);
    };
 
    fetchData();
  }, [user, navigate]);
 
  const getTodaysBirthdays = () => {
    const today = new Date();
    return employees.filter(emp => {
      if (!emp.dateOfBirth) return false;
      const dob = new Date(emp.dateOfBirth);
      return dob.getMonth() === today.getMonth() && dob.getDate() === today.getDate();
    });
  };
 
  const getTodaysAnniversaries = () => {
    const today = new Date();
    return employees.filter(emp => {
      if (!emp.joiningDate) return false;
      const doj = new Date(emp.joiningDate);
      return doj.getMonth() === today.getMonth() && doj.getDate() === today.getDate();
    });
  };
 
  const handleKudosSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'kudos'), {
        ...newKudos,
        from: user.uid,
        timestamp: serverTimestamp(),
      });
      setNewKudos({ to: '', message: '' });
      setShowKudosForm(false);
    } catch (error) {
      console.error('Error adding kudos:', error);
    }
  };
 
  const handlePollSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'polls'), {
        ...newPoll,
        createdBy: user.uid,
        timestamp: serverTimestamp(),
        votes: {},
      });
      setNewPoll({ question: '', options: ['', ''] });
      setShowPollForm(false);
    } catch (error) {
      console.error('Error adding poll:', error);
    }
  };
 
  if (loading || loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
 
  const birthdays = getTodaysBirthdays();
  const anniversaries = getTodaysAnniversaries();
  const currentEmployee = employees.find(emp => emp.id === user.uid);
 
  const renderContent = () => {
    switch (activeTab) {
      case 'birthdays':
        return (
          <div className="space-y-4">
            {birthdays.map(emp => (
              <div key={emp.id} className="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-orange-800">{emp.name}</h3>
                  <p className="text-sm text-gray-600">Employee ID: {emp.empId || 'N/A'}</p>
                  <p className="text-sm text-gray-600">DOB: {new Date(emp.dateOfBirth).toLocaleDateString()}</p>
                  <div className="mt-4">
                    <p className="text-orange-700 font-medium">🎉 Happy Birthday! 🎉</p>
                    <p className="text-sm text-gray-600 mt-2">Wishing you a day filled with happiness and a year filled with joy!</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'anniversaries':
        return (
          <div className="space-y-4">
            {anniversaries.map(emp => (
              <div key={emp.id} className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg shadow-lg">
                <div className="text-center">
                  <h3 className="text-xl font-bold text-blue-800">{emp.name}</h3>
                  <p className="text-sm text-gray-600">Employee ID: {emp.empId || 'N/A'}</p>
                  <p className="text-sm text-gray-600">Joined: {new Date(emp.joiningDate).toLocaleDateString()}</p>
                  <div className="mt-4">
                    <p className="text-blue-700 font-medium">🎊 Congratulations! 🎊</p>
                    <p className="text-sm text-gray-600 mt-2">Thank you for your dedication and commitment to our team!</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      case 'kudos':
        return (
          <div className="space-y-4">
            {kudos.map(kudo => {
              const employee = employees.find(emp => emp.id === kudo.to);
              const sender = employees.find(emp => emp.id === kudo.from);
              return (
                <div key={kudo.id} className="bg-green-50 p-4 rounded-lg shadow">
                  <p className="font-medium text-green-800">To: {employee?.name || 'Unknown'} ({employee?.empId || 'N/A'})</p>
                  <p className="text-gray-600 mt-2">{kudo.message}</p>
                  <p className="text-sm text-gray-500 mt-2">From: {sender?.name || 'Anonymous'}</p>
                </div>
              );
            })}
          </div>
        );
      case 'polls':
        return (
          <div className="space-y-4">
            {polls.map(poll => {
              const creator = employees.find(emp => emp.id === poll.createdBy);
              return (
                <div key={poll.id} className="bg-purple-50 p-4 rounded-lg shadow">
                  <h3 className="font-medium text-purple-800 mb-2">{poll.question}</h3>
                  <div className="space-y-2">
                    {poll.options.map((option, index) => (
                      <div key={index} className="flex items-center">
                        <input
                          type="radio"
                          name={`poll-${poll.id}`}
                          className="mr-2"
                        />
                        <span>{option}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Created by: {creator?.name || 'Anonymous'}</p>
                </div>
              );
            })}
          </div>
        );
      default:
        return (
          <div className="space-y-8">
            {/* Today's Celebrations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-orange-600 mb-4">🎂 Today's Birthdays</h2>
                {birthdays.length > 0 ? (
                  <div className="space-y-4">
                    {birthdays.map(emp => (
                      <div key={emp.id} className="bg-gradient-to-r from-orange-100 to-orange-200 p-6 rounded-lg shadow-lg">
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-orange-800">{emp.name}</h3>
                          <p className="text-sm text-gray-600">Employee ID: {emp.empId || 'N/A'}</p>
                          <p className="text-sm text-gray-600">DOB: {new Date(emp.dateOfBirth).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No birthdays today.</p>
                )}
              </div>
 
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-blue-600 mb-4">🎉 Today's Work Anniversaries</h2>
                {anniversaries.length > 0 ? (
                  <div className="space-y-4">
                    {anniversaries.map(emp => (
                      <div key={emp.id} className="bg-gradient-to-r from-blue-100 to-blue-200 p-6 rounded-lg shadow-lg">
                        <div className="text-center">
                          <h3 className="text-xl font-bold text-blue-800">{emp.name}</h3>
                          <p className="text-sm text-gray-600">Employee ID: {emp.empId || 'N/A'}</p>
                          <p className="text-sm text-gray-600">Joined: {new Date(emp.joiningDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No work anniversaries today.</p>
                )}
              </div>
            </div>
 
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-green-600 mb-4">👏 Recent Kudos</h2>
                <div className="space-y-4">
                  {kudos.slice(0, 3).map(kudo => {
                    const employee = employees.find(emp => emp.id === kudo.to);
                    const sender = employees.find(emp => emp.id === kudo.from);
                    return (
                      <div key={kudo.id} className="bg-green-50 p-4 rounded-lg shadow">
                        <p className="font-medium text-green-800">To: {employee?.name || 'Unknown'}</p>
                        <p className="text-gray-600 mt-2">{kudo.message}</p>
                        <p className="text-sm text-gray-500 mt-2">From: {sender?.name || 'Anonymous'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
 
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-semibold text-purple-600 mb-4">📊 Active Polls</h2>
                <div className="space-y-4">
                  {polls.slice(0, 3).map(poll => {
                    const creator = employees.find(emp => emp.id === poll.createdBy);
                    return (
                      <div key={poll.id} className="bg-purple-50 p-4 rounded-lg shadow">
                        <h3 className="font-medium text-purple-800 mb-2">{poll.question}</h3>
                        <div className="space-y-2">
                          {poll.options.map((option, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="radio"
                                name={`poll-${poll.id}`}
                                className="mr-2"
                              />
                              <span>{option}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Created by: {creator?.name || 'Anonymous'}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };
 
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Activities</h2>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              📋 All Activities
            </button>
            <button
              onClick={() => setActiveTab('birthdays')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'birthdays' ? 'bg-orange-100 text-orange-600' : 'hover:bg-gray-100'
              }`}
            >
              🎂 Birthdays
            </button>
            <button
              onClick={() => setActiveTab('anniversaries')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'anniversaries' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              🎉 Work Anniversaries
            </button>
            <button
              onClick={() => setActiveTab('kudos')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'kudos' ? 'bg-green-100 text-green-600' : 'hover:bg-gray-100'
              }`}
            >
              👏 Kudos
            </button>
            <button
              onClick={() => setActiveTab('polls')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === 'polls' ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100'
              }`}
            >
              📊 Polls
            </button>
          </nav>
        </div>
      </div>
 
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 mb-8 text-white shadow-lg">
            <h1 className="text-3xl font-bold mb-2">Welcome, {currentEmployee?.name || 'Team Member'}!</h1>
            <p className="text-lg opacity-90">Stay connected with your team through celebrations, kudos, and polls.</p>
          </div>
 
          {/* Quick Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowKudosForm(!showKudosForm)}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              {showKudosForm ? 'Cancel Kudos' : 'Send Kudos'}
            </button>
            <button
              onClick={() => setShowPollForm(!showPollForm)}
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow-md transition-colors"
            >
              {showPollForm ? 'Cancel Poll' : 'Create Poll'}
            </button>
          </div>
 
          {/* Forms Section */}
          <div className="mb-8">
            {showKudosForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                <h2 className="text-2xl font-semibold text-green-600 mb-4">Send Kudos</h2>
                <form onSubmit={handleKudosSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select
                      value={newKudos.to}
                      onChange={(e) => setNewKudos({ ...newKudos, to: e.target.value })}
                      className="p-2 border rounded focus:ring-2 focus:ring-green-500"
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.empId || 'N/A'})</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newKudos.message}
                      onChange={(e) => setNewKudos({ ...newKudos, message: e.target.value })}
                      placeholder="Write your kudos message"
                      className="p-2 border rounded focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <button type="submit" className="mt-4 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                    Send Kudos
                  </button>
                </form>
              </div>
            )}
 
            {showPollForm && (
              <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                <h2 className="text-2xl font-semibold text-purple-600 mb-4">Create Poll</h2>
                <form onSubmit={handlePollSubmit}>
                  <input
                    type="text"
                    value={newPoll.question}
                    onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
                    placeholder="Enter your poll question"
                    className="w-full p-2 border rounded mb-4 focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  {newPoll.options.map((option, index) => (
                    <input
                      key={index}
                      type="text"
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...newPoll.options];
                        newOptions[index] = e.target.value;
                        setNewPoll({ ...newPoll, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                      className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  ))}
                  <button type="submit" className="mt-4 bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600">
                    Create Poll
                  </button>
                </form>
              </div>
            )}
          </div>
 
          {/* Content Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
 
export default Engage;
 