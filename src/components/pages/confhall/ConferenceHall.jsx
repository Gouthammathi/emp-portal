import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, onSnapshot, Timestamp, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../firebase';
import { FaCalendarAlt, FaClock, FaUsers, FaCheck, FaTimes, FaInfoCircle } from 'react-icons/fa';
import { RiDeleteBin6Line } from "react-icons/ri";

// TimeSlotGrid component for visualizing time slots
const TimeSlotGrid = ({ bookings, date }) => {
  const timeSlots = [];
  const startHour = 9; // 9 AM
  const endHour = 19; // 7 PM

  // Generate time slots with 30-minute intervals
  for (let hour = startHour; hour < endHour; hour++) {
    // Add 30-minute slots
    const timeSlotsForHour = [
      {
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${hour.toString().padStart(2, '0')}:30`
      },
      {
        start: `${hour.toString().padStart(2, '0')}:30`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`
      }
    ];

    timeSlotsForHour.forEach(slot => {
      const isBooked = bookings.some(booking => {
        const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
        const bookingEnd = new Date(`${booking.date}T${booking.endTime}`);
        const slotStart = new Date(`${date}T${slot.start}`);
        const slotEnd = new Date(`${date}T${slot.end}`);
       
        return (
          (slotStart >= bookingStart && slotStart < bookingEnd) ||
          (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
          (slotStart <= bookingStart && slotEnd >= bookingEnd)
        );
      });

      timeSlots.push({
        start: slot.start,
        end: slot.end,
        isBooked,
        booking: isBooked ? bookings.find(booking => {
          const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
          const bookingEnd = new Date(`${booking.date}T${booking.endTime}`);
          const slotStart = new Date(`${date}T${slot.start}`);
          const slotEnd = new Date(`${date}T${slot.end}`);
         
          return (
            (slotStart >= bookingStart && slotStart < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (slotStart <= bookingStart && slotEnd >= bookingEnd)
          );
        }) : null
      });
    });
  }

  // Group consecutive slots
  const groupedSlots = [];
  let currentGroup = null;

  timeSlots.forEach((slot, index) => {
    if (!currentGroup) {
      currentGroup = {
        start: slot.start,
        end: slot.end,
        isBooked: slot.isBooked,
        booking: slot.booking
      };
    } else if (
      currentGroup.isBooked === slot.isBooked &&
      currentGroup.booking?.id === slot.booking?.id &&
      currentGroup.end === slot.start
    ) {
      currentGroup.end = slot.end;
    } else {
      groupedSlots.push(currentGroup);
      currentGroup = {
        start: slot.start,
        end: slot.end,
        isBooked: slot.isBooked,
        booking: slot.booking
      };
    }

    if (index === timeSlots.length - 1) {
      groupedSlots.push(currentGroup);
    }
  });

  return (
    <div className="grid grid-cols-1 gap-2">
      {groupedSlots.map((slot, index) => (
        <div
          key={`${slot.start}-${slot.end}`}
          className={`p-3 rounded-lg border ${
            slot.isBooked
              ? 'bg-red-100 border-red-300'
              : 'bg-green-100 border-green-300'
          }`}
        >
          <div className="flex justify-between items-center">
            <span className="font-medium">{slot.start} - {slot.end}</span>
            {slot.isBooked && slot.booking && (
              <div className="text-sm text-gray-600">
                Booked by: {slot.booking.requestedByName}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

function ConferenceHall() {
  const [userData, setUserData] = useState(null);
  const [requests, setRequests] = useState([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    endTime: '',
   
   
    purpose: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('requests'); // requests, schedule, availability
  const [showStartTimeDropdown, setShowStartTimeDropdown] = useState(false);
  const [showEndTimeDropdown, setShowEndTimeDropdown] = useState(false);
  const [timeSlotError, setTimeSlotError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      console.log('Starting user data fetch...');
      const auth = getAuth();
      const user = auth.currentUser;
     
      console.log('Current auth user:', user);
     
      if (!user) {
        console.log('No authenticated user found');
        setError('No user logged in. Please log in to continue.');
        setLoading(false);
        return;
      }

      try {
        console.log('Attempting to fetch user document with UID:', user.uid);
        // First try to get the user document directly using the UID
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
       
        if (userDoc.exists()) {
          const firestoreData = userDoc.data();
          const userData = {
            uid: user.uid,
            email: firestoreData.email,
            firstName: firestoreData.firstName,
            lastName: firestoreData.lastName,
            role: firestoreData.role,
            empId: firestoreData.empId
          };
          console.log('User document found by UID:', userData);
          setUserData(userData);
        } else {
          console.log('User document not found by UID, trying email query...');
          // If not found by direct reference, try querying
          const userQuery = query(collection(db, "users"), where("email", "==", user.email));
          const querySnapshot = await getDocs(userQuery);
         
          if (!querySnapshot.empty) {
            const firestoreData = querySnapshot.docs[0].data();
            const userData = {
              uid: user.uid,
              email: firestoreData.email,
              firstName: firestoreData.firstName,
              lastName: firestoreData.lastName,
              role: firestoreData.role,
              empId: firestoreData.empId
            };
            console.log('User document found by email:', userData);
            setUserData(userData);
          } else {
            console.log('User document not found by email either');
            setError('User data not found. Please try logging in again.');
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to fetch user data. Please try again.');
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!userData) return;

    console.log('Setting up requests listener for user:', userData.uid);
   
    // For HR, we need to listen to all requests to show in schedule and availability
    const requestsQuery = userData.role === 'hr'
      ? query(collection(db, "conferenceHallRequests"))
      : query(
          collection(db, "conferenceHallRequests"),
          where("requestedBy", "==", userData.uid || '')
        );

    console.log('Setting up requests query with:', {
      role: userData.role,
      uid: userData.uid,
      queryField: userData.role === 'hr' ? 'all' : 'requestedBy',
      queryValue: userData.role === 'hr' ? 'all' : userData.uid
    });

    const unsubscribe = onSnapshot(requestsQuery, (snapshot) => {
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      console.log('Received updated requests data:', requestsData);
      setRequests(requestsData);
    }, (error) => {
      console.error('Error in requests subscription:', error);
      setError('Failed to load requests. Please try again.');
    });

    return () => unsubscribe();
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
   
    // Clear time slot error when user changes input
    if (name === 'date' || name === 'startTime' || name === 'endTime') {
      setTimeSlotError(null);
    }
  };

  // Add new function to check time slot availability
  const checkTimeSlotAvailability = async (date, startTime, endTime) => {
    const conflictsQuery = query(
      collection(db, "conferenceHallRequests"),
      where("status", "==", "approved"),
      where("date", "==", date)
    );
   
    const conflictsSnapshot = await getDocs(conflictsQuery);
    const conflicts = conflictsSnapshot.docs.map(doc => doc.data());
   
    const hasConflict = conflicts.some(booking => {
      const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
      const bookingEnd = new Date(`${booking.date}T${booking.endTime}`);
      const requestStart = new Date(`${date}T${startTime}`);
      const requestEnd = new Date(`${date}T${endTime}`);
     
      return (
        (requestStart >= bookingStart && requestStart < bookingEnd) ||
        (requestEnd > bookingStart && requestEnd <= bookingEnd) ||
        (requestStart <= bookingStart && requestEnd >= bookingEnd)
      );
    });

    if (hasConflict) {
      const conflict = conflicts.find(booking => {
        const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
        const bookingEnd = new Date(`${booking.date}T${booking.endTime}`);
        const requestStart = new Date(`${date}T${startTime}`);
        const requestEnd = new Date(`${date}T${endTime}`);
       
        return (
          (requestStart >= bookingStart && requestStart < bookingEnd) ||
          (requestEnd > bookingStart && requestEnd <= bookingEnd) ||
          (requestStart <= bookingStart && requestEnd >= bookingEnd)
        );
      });

      setTimeSlotError(`This time slot is already booked by ${conflict.requestedByName} (${conflict.startTime} - ${conflict.endTime})`);
      return false;
    }
   
    setTimeSlotError(null);
    return true;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!userData) {
      console.log('No user data available');
      setError('Please wait while we load your user data...');
      setLoading(false);
      return;
    }

    if (!userData.uid) {
      console.log('No user ID available');
      setError('User data is incomplete. Please try logging in again.');
      setLoading(false);
      return;
    }

    try {
      // Check time slot availability before submitting
      const isAvailable = await checkTimeSlotAvailability(
        formData.date,
        formData.startTime,
        formData.endTime
      );

      if (!isAvailable) {
        setLoading(false);
        return;
      }

      const requestData = {
        ...formData,
        requestedBy: userData.uid,
        requestedByName: `${userData.firstName} ${userData.lastName}`,
        status: 'pending',
        createdAt: Timestamp.now(),
        role: userData.role
      };

      console.log('Creating request with data:', requestData);

      const docRef = await addDoc(collection(db, "conferenceHallRequests"), requestData);
      console.log('Request submitted successfully with ID:', docRef.id);
     
      // Verify the data was stored
      const storedDoc = await getDoc(docRef);
      if (storedDoc.exists()) {
        console.log('Verified stored data:', storedDoc.data());
      } else {
        console.error('Failed to verify stored data');
      }
     
      setShowRequestForm(false);
      setFormData({
        date: '',
        startTime: '',
        endTime: '',
        purpose: ''
      });
    } catch (err) {
      console.error('Error submitting request:', err);
      setError('Failed to submit request. Please try again.');
    }
    setLoading(false);
  };

  const handleApproveRequest = async (requestId) => {
    try {
      setLoading(true);
      const requestRef = doc(db, "conferenceHallRequests", requestId);
      const requestDoc = await getDoc(requestRef);
     
      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }

      const requestData = requestDoc.data();
      console.log('Approving request:', requestData);
     
      // Check for conflicts with existing approved bookings
      const conflictsQuery = query(
        collection(db, "conferenceHallRequests"),
        where("status", "==", "approved"),
        where("date", "==", requestData.date)
      );
     
      const conflictsSnapshot = await getDocs(conflictsQuery);
      const conflicts = conflictsSnapshot.docs.map(doc => doc.data());
      console.log('Checking for conflicts with:', conflicts);
     
      const hasConflict = conflicts.some(booking => {
        const bookingStart = new Date(`${booking.date}T${booking.startTime}`);
        const bookingEnd = new Date(`${booking.date}T${booking.endTime}`);
        const requestStart = new Date(`${requestData.date}T${requestData.startTime}`);
        const requestEnd = new Date(`${requestData.date}T${requestData.endTime}`);
       
        return (
          (requestStart >= bookingStart && requestStart < bookingEnd) ||
          (requestEnd > bookingStart && requestEnd <= bookingEnd) ||
          (requestStart <= bookingStart && requestEnd >= bookingEnd)
        );
      });

      if (hasConflict) {
        console.log('Conflict detected with existing booking');
        setError('This time slot conflicts with an existing booking. Please choose a different time.');
        setLoading(false);
        return;
      }

      const updateData = {
        status: 'approved',
        approvedAt: Timestamp.now(),
        approvedBy: userData.uid,
        approvedByName: `${userData.firstName} ${userData.lastName}`
      };

      console.log('Updating request with data:', updateData);
      await updateDoc(requestRef, updateData);
     
      // Verify the update
      const updatedDoc = await getDoc(requestRef);
      if (updatedDoc.exists()) {
        console.log('Verified updated data:', updatedDoc.data());
        // Switch to schedule tab if in HR dashboard
        if (userData.role === 'hr') {
          setActiveTab('schedule');
        }
      } else {
        console.error('Failed to verify updated data');
      }
     
      setError(null);
    } catch (err) {
      console.error('Error approving request:', err);
      setError('Failed to approve request. Please try again.');
    }
    setLoading(false);
  };

  const handleRejectRequest = async (requestId) => {
    try {
      setLoading(true);
      const requestRef = doc(db, "conferenceHallRequests", requestId);
      const requestDoc = await getDoc(requestRef);
     
      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }

      const requestData = requestDoc.data();
      console.log('Rejecting request:', requestData);

      const updateData = {
        status: 'rejected',
        rejectedAt: Timestamp.now(),
        rejectedBy: userData.uid,
        rejectedByName: `${userData.firstName} ${userData.lastName}`
      };

      console.log('Updating request with data:', updateData);
      await updateDoc(requestRef, updateData);
     
      // Verify the update
      const updatedDoc = await getDoc(requestRef);
      if (updatedDoc.exists()) {
        console.log('Verified updated data:', updatedDoc.data());
      } else {
        console.error('Failed to verify updated data');
      }
     
      setError(null);
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError('Failed to reject request. Please try again.');
    }
    setLoading(false);
  };

  const handleDeleteRequest = async (requestId) => {
    try {
      setLoading(true);
      const requestRef = doc(db, "conferenceHallRequests", requestId);
     
      // First get the request data to show confirmationlo'
      const requestDoc = await getDoc(requestRef);
      if (!requestDoc.exists()) {
        throw new Error('Request not found');
      }

      const requestData = requestDoc.data();
     
      // Show confirmation dialog
      if (window.confirm(`Are you sure you want to delete your request for "${requestData}" on ${new Date(requestData.date).toLocaleDateString()}?`)) {
        await deleteDoc(requestRef);
        console.log('Request deleted successfully');
        setError(null);
      }
    } catch (err) {
      console.error('Error deleting request:', err);
      setError('Failed to delete request. Please try again.');
    }
    setLoading(false);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  const isHR = userData?.role === 'hr';
  const isManager = userData?.role === 'manager';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Conference Hall Management</h1>
          {!isHR && (
            <button
              onClick={() => setShowRequestForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Request
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'requests'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {isHR ? 'Pending Requests' : 'My Requests'}
            </button>
            {(!isManager || isHR) && (
              <>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'schedule'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Schedule
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'availability'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Availability
                </button>
              </>
            )}
          </nav>
        </div>

        {/* Request Form Modal */}
        {showRequestForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-lg">
              <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">New Conference Hall Request</h2>
              <form onSubmit={handleSubmitRequest} className="space-y-5">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        name="startTime"
                        value={formData.startTime}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStartTimeDropdown(!showStartTimeDropdown)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showStartTimeDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-48 overflow-y-auto">
                          {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30","18:00","18:30","19:00","19:30","20:00","20:30","21:00","21:30","22:00","22:30","23:00","23:30","24:00"].map((time) => (
                          <div
                            key={time}
                            onClick={() => {
                              handleInputChange({ target: { name: "startTime", value: time } });
                              setShowStartTimeDropdown(false);
                            }}
                            className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                          >
                            {new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <div className="relative">
                      <input
                        type="time"
                        name="endTime"
                        value={formData.endTime}
                        onChange={handleInputChange}
                        required
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEndTimeDropdown(!showEndTimeDropdown)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {showEndTimeDropdown && (
                        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-300 max-h-48 overflow-y-auto">
                          {["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"].map((time) => (
                            <div
                              key={time}
                              onClick={() => {
                                handleInputChange({ target: { name: "endTime", value: time } });
                                setShowEndTimeDropdown(false);
                              }}
                              className="px-3 py-2 text-sm hover:bg-blue-50 cursor-pointer"
                            >
                              {new Date(`1970-01-01T${time}:00`).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Purpose</label>
                  <textarea
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleInputChange}
                    required
                    rows="3"
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Time Slot Error Message */}
                {timeSlotError && (
                  <div className="text-red-600 text-sm mt-2 bg-red-50 p-2 rounded">
                    {timeSlotError}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowRequestForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || timeSlotError}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition ${
                      (loading || timeSlotError) ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          request.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : request.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                        {(isHR || !isHR) && (
                          <button
                            onClick={() => handleDeleteRequest(request.id)}
                            className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="Delete request"
                            disabled={loading}
                          >
                            <RiDeleteBin6Line />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="flex items-center text-sm text-gray-600">
                          <FaCalendarAlt className="mr-2" />
                          {new Date(request.date).toLocaleDateString()}
                        </p>
                        <p className="flex items-center text-sm text-gray-600">
                          <FaClock className="mr-2" />
                          {request.startTime} - {request.endTime}
                        </p>
                        <p className="flex items-center text-sm text-gray-600">
                          <FaUsers className="mr-2" />
                          {request.members} members
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Requested by:</span> {request.requestedByName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Role:</span> {request.role}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Purpose:</span> {request.purpose}
                        </p>
                      </div>
                    </div>
                  </div>
                  {isHR && request.status === 'pending' && (
                    <div className="ml-4 flex flex-col space-y-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                        disabled={loading}
                      >
                        <FaCheck className="mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                        disabled={loading}
                      >
                        <FaTimes className="mr-2" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {requests.length === 0 && (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FaInfoCircle className="mx-auto text-gray-400 text-4xl mb-2" />
                <p className="text-gray-500">No requests found</p>
              </div>
            )}
          </div>
        )}

        {(!isManager || isHR) && activeTab === 'schedule' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Today's Schedule</h3>
              <div className="space-y-4">
                {requests
                  .filter(request =>
                    request.status === 'approved' &&
                    new Date(request.date).toDateString() === new Date().toDateString()
                  )
                  .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
                  .map(request => (
                    <div key={request.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-gray-500">Requested by: {request.requestedByName}</p>
                              <p className="text-sm text-gray-500">Time: {request.startTime} - {request.endTime}</p>
                              <p className="text-sm text-gray-500">Purpose: {request.purpose}</p>
                            </div>
                            {isHR && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete this booking?\n\nTime: ${request.startTime} - ${request.endTime}\nBooked by: ${request.requestedByName}`)) {
                                      handleDeleteRequest(request.id);
                                    }
                                  }}
                                  className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors"
                                  title="Delete booking"
                                  disabled={loading}
                                >
                                  <RiDeleteBin6Line className="w-5 h-5" />
                                </button>
                              </div>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 mt-2">
                            Approved by: {request.approvedByName}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                {requests.filter(request =>
                  request.status === 'approved' &&
                  new Date(request.date).toDateString() === new Date().toDateString()
                ).length === 0 && (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <FaInfoCircle className="mx-auto text-gray-400 text-4xl mb-2" />
                    <p className="text-gray-500">No bookings scheduled for today</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {(!isManager || isHR) && activeTab === 'availability' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-lg mb-4">Room Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Today's Time Slots</h4>
                  <TimeSlotGrid
                    bookings={requests.filter(request =>
                      request.status === 'approved' &&
                      new Date(request.date).toDateString() === new Date().toDateString()
                    )}
                    date={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-3">Upcoming Bookings</h4>
                  <div className="space-y-3">
                    {requests
                      .filter(request =>
                        request.status === 'approved' &&
                        new Date(`${request.date}T${request.startTime}`) > new Date()
                      )
                      .sort((a, b) => new Date(`${a.date}T${a.startTime}`) - new Date(`${b.date}T${b.startTime}`))
                      .slice(0, 3)
                      .map(request => (
                        <div key={request.id} className="border-l-2 border-blue-500 pl-3 py-2">
                          <p className="font-medium text-gray-800">
                            {new Date(request.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {request.startTime} - {request.endTime}
                          </p>
                          <p className="text-sm text-gray-500">
                            Booked by: {request.requestedByName}
                          </p>
                        </div>
                      ))}
                    {requests.filter(request =>
                      request.status === 'approved' &&
                      new Date(`${request.date}T${request.startTime}`) > new Date()
                    ).length === 0 && (
                      <p className="text-gray-500">No upcoming bookings</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default ConferenceHall;
