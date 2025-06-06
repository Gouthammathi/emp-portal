import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaFileUpload, FaSave, FaEye, FaTimes } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { db, auth, storage } from '../../firebase';
import { useNavigate, useParams } from 'react-router-dom';
import orgChartData from '../../data/orgchart.json';

// Helper function to upload file
const uploadReceiptFile = async (file) => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');

  const filePath = `receipts/${user.uid}/${Date.now()}_${file.name}`;
  const fileRef = ref(storage, filePath);

  await uploadBytes(fileRef, file); // Firebase SDK handles CORS
  const downloadURL = await getDownloadURL(fileRef);

  return downloadURL;
};

const ReimbursementRequest = () => {
  const { empId: viewEmpId } = useParams(); // Get employee ID from URL if viewing team member
  const [employeeInfo, setEmployeeInfo] = useState({
    empId: '',
    name: '',
    requestDate: new Date().toISOString().split('T')[0],
    managerId: '',
    superManagerId: '',
    cid: '',
    role: ''
  });
  const [justification, setJustification] = useState('');
  const [entries, setEntries] = useState([{ date: '', description: '', amount: '', category: '', otherCategory: '', receipt: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [draftId, setDraftId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [savedData, setSavedData] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [reimbursements, setReimbursements] = useState([]);
  const [isManager, setIsManager] = useState(false);
  const navigate = useNavigate();

  const categories = ['Travel', 'Food','Accomodation', 'Office Supplies', 'Training', 'Software', 'Other'];

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          setError('User not found');
          setLoading(false);
          return;
        }

        const userData = userDoc.data();
        const role = userData.role || 'employee';
        setIsManager(role === 'manager');

        // If viewing a team member's reimbursements
        if (viewEmpId) {
          // Verify if the current user is authorized to view this employee's data
          if (role === 'manager') {
            const teamMemberDoc = await getDoc(doc(db, 'users', viewEmpId));
            if (!teamMemberDoc.exists()) {
              setError('Team member not found');
              setLoading(false);
              return;
            }

            const teamMemberData = teamMemberDoc.data();
            if (teamMemberData.managerId !== user.uid) {
              setError('Unauthorized to view this team member\'s data');
              setLoading(false);
              return;
            }

            // Set team member's info
            setEmployeeInfo({
              empId: teamMemberData.empId || '',
              name: `${teamMemberData.firstName || ''} ${teamMemberData.lastName || ''}`.trim(),
              requestDate: new Date().toISOString().split('T')[0],
              managerId: user.uid,
              superManagerId: userData.superManagerId || '',
              cid: userData.cid || '',
              role: 'employee'
            });
            setIsViewMode(true);

            // Fetch team member's reimbursements
            const reimbursementsQuery = query(
              collection(db, 'reimbursements'),
              where('empId', '==', teamMemberData.empId),
              where('status', 'in', ['pending', 'approved', 'rejected'])
            );
            const reimbursementsSnapshot = await getDocs(reimbursementsQuery);
            if (!reimbursementsSnapshot.empty) {
              const reimbursements = reimbursementsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              }));
              setSavedData(reimbursements);
            }
          } else {
            setError('Unauthorized to view team member data');
            setLoading(false);
            return;
          }
        } else {
          // Normal employee view
          setEmployeeInfo(prev => ({
            ...prev,
            empId: userData.empId || '',
            name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
            role: role
          }));

          // Fetch manager hierarchy based on role
          if (role === 'employee') {
            if (userData.managerId) {
              const managerDoc = await getDoc(doc(db, 'users', userData.managerId));
              if (managerDoc.exists()) {
                const managerData = managerDoc.data();
                setEmployeeInfo(prev => ({
                  ...prev,
                  managerId: userData.managerId,
                  superManagerId: managerData.superManagerId || '',
                  cid: managerData.cid || ''
                }));
              }
            }
          } else if (role === 'manager') {
            if (userData.superManagerId) {
              const superManagerDoc = await getDoc(doc(db, 'users', userData.superManagerId));
              if (superManagerDoc.exists()) {
                const superManagerData = superManagerDoc.data();
                setEmployeeInfo(prev => ({
                  ...prev,
                  superManagerId: userData.superManagerId,
                  cid: superManagerData.cid || ''
                }));
              }
            }
          } else if (role === 'superManager') {
            setEmployeeInfo(prev => ({
              ...prev,
              cid: userData.cid || ''
            }));
          }

          // Check for existing draft
          const draftsQuery = query(
            collection(db, 'reimbursements'),
            where('empId', '==', userData.empId),
            where('status', '==', 'draft')
          );
          const draftsSnapshot = await getDocs(draftsQuery);
          if (!draftsSnapshot.empty) {
            const draft = draftsSnapshot.docs[0];
            setDraftId(draft.id);
            const draftData = draft.data();
            setEntries(draftData.entries || [{ date: '', description: '', amount: '', category: '', otherCategory: '', receipt: null }]);
            setJustification(draftData.justification || '');
          }

          // If user is a manager, fetch their team's reimbursements
          if (role === 'manager') {
            await fetchTeamReimbursements(user.uid);
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load employee information');
      }
      setLoading(false);
    };

    fetchUserData();
  }, [viewEmpId]);

  useEffect(() => {
    if (showPreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showPreview]);

  const addEntry = () => setEntries([...entries, { date: '', description: '', amount: '', category: '', otherCategory: '', receipt: null }]);
  const removeEntry = (index) => setEntries(entries.filter((_, i) => i !== index));

  const handleEntryChange = (index, field, value) => {
    const newEntries = [...entries];
    newEntries[index][field] = value;
    // Clear otherCategory when category is not "Other"
    if (field === 'category' && value !== 'Other') {
      newEntries[index].otherCategory = '';
    }
    setEntries(newEntries);
  };

  const handleFileChange = (index, file) => {
    const newEntries = [...entries];
    newEntries[index].receipt = file;
    setEntries(newEntries);
  };

  const validateForm = () => {
    for (const entry of entries) {
      if (!entry.date || !entry.description || !entry.amount || !entry.category) return false;
      if (entry.category === 'Other' && !entry.otherCategory) return false;
    }
    const { empId, name, requestDate } = employeeInfo;
    return empId && name && requestDate;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Process entries to handle file uploads
      const processedEntries = await Promise.all(entries.map(async (entry) => {
        const processedEntry = { ...entry };
        
        // Use otherCategory if category is "Other"
        if (entry.category === 'Other') {
          processedEntry.category = entry.otherCategory;
        }
        
        if (entry.receipt instanceof File) {
          try {
            const downloadURL = await uploadReceiptFile(entry.receipt);
            processedEntry.receipt = {
              name: entry.receipt.name,
              url: downloadURL
            };
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            processedEntry.receipt = {
              name: entry.receipt.name,
              error: 'Failed to upload file'
            };
          }
        }
        
        return processedEntry;
      }));

      const reimbursementData = {
        ...employeeInfo,
        justification,
        entries: processedEntries,
        status: 'draft',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        userId: auth.currentUser.uid
      };

      if (draftId) {
        await updateDoc(doc(db, 'reimbursements', draftId), reimbursementData);
        setSuccess('Draft updated successfully');
      } else {
        const docRef = await addDoc(collection(db, 'reimbursements'), reimbursementData);
        setDraftId(docRef.id);
        setSuccess('Draft saved successfully');
      }
    } catch (err) {
      console.error('Error saving draft:', err);
      setError('Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = async () => {
    if (!draftId) {
      setError('Please save the form first before viewing');
      return;
    }

    try {
      const docRef = doc(db, 'reimbursements', draftId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setSavedData(docSnap.data());
        setShowPreview(true);
      } else {
        setError('Draft not found');
      }
    } catch (err) {
      console.error('Error fetching draft:', err);
      setError('Failed to load draft');
    }
  };

  const fetchTeamReimbursements = async (managerId) => {
    try {
      // First get all team members
      const teamQuery = query(
        collection(db, 'users'),
        where('managerId', '==', managerId)
      );
      const teamSnapshot = await getDocs(teamQuery);
      
      if (!teamSnapshot.empty) {
        const teamMemberIds = teamSnapshot.docs.map(doc => doc.data().empId);
        
        // Then get all reimbursements for team members
        const reimbursementsQuery = query(
          collection(db, 'reimbursements'),
          where('empId', 'in', teamMemberIds),
          where('status', 'in', ['pending', 'approved', 'rejected'])
        );
        
        const reimbursementsSnapshot = await getDocs(reimbursementsQuery);
        const reimbursementsData = reimbursementsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setReimbursements(reimbursementsData);
      }
    } catch (error) {
      console.error('Error fetching team reimbursements:', error);
      setError('Failed to load team reimbursements');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Get current user data to ensure we have the correct manager information
      const user = auth.currentUser;
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        throw new Error('User data not found');
      }
      const userData = userDoc.data();

      // Process entries to handle file uploads
      const processedEntries = await Promise.all(entries.map(async (entry) => {
        const processedEntry = { ...entry };
        
        // Use otherCategory if category is "Other"
        if (entry.category === 'Other') {
          processedEntry.category = entry.otherCategory;
        }
        
        if (entry.receipt instanceof File) {
          try {
            const downloadURL = await uploadReceiptFile(entry.receipt);
            processedEntry.receipt = {
              name: entry.receipt.name,
              url: downloadURL
            };
          } catch (uploadError) {
            console.error('Error uploading file:', uploadError);
            processedEntry.receipt = {
              name: entry.receipt.name,
              error: 'Failed to upload file'
            };
          }
        }
        
        return processedEntry;
      }));

      // Calculate total amount
      const totalAmount = processedEntries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

      const reimbursementData = {
        empId: userData.empId,
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        justification,
        entries: processedEntries,
        status: 'pending',
        submittedAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        userId: user.uid,
        managerId: userData.managerId, // This is crucial for manager to find the reimbursement
        superManagerId: userData.superManagerId,
        cid: userData.cid,
        role: userData.role,
        totalAmount: totalAmount,
        employeeEmail: userData.email,
        department: userData.department
      };

      let docRef;
      if (draftId) {
        await updateDoc(doc(db, 'reimbursements', draftId), reimbursementData);
        docRef = draftId;
      } else {
        const newDoc = await addDoc(collection(db, 'reimbursements'), reimbursementData);
        docRef = newDoc.id;
      }

      // Create a notification for the manager
      if (userData.managerId) {
        const notificationData = {
          type: 'reimbursement',
          status: 'pending',
          reimbursementId: docRef,
          employeeId: user.uid,
          employeeName: `${userData.firstName} ${userData.lastName}`.trim(),
          amount: totalAmount,
          createdAt: serverTimestamp(),
          read: false,
          message: `New reimbursement request from ${userData.firstName} ${userData.lastName} for ₹${totalAmount}`
        };

        await addDoc(collection(db, 'notifications'), {
          ...notificationData,
          userId: userData.managerId // This ensures the notification goes to the manager
        });
      }
      
      setSuccess('Reimbursement request submitted successfully');
      setEntries([{ date: '', description: '', amount: '', category: '', otherCategory: '', receipt: null }]);
      setJustification('');
      setDraftId(null);
      navigate('/dashboard');
    } catch (err) {
      console.error('Error submitting reimbursement:', err);
      setError('Failed to submit reimbursement request');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add function to fetch reimbursements for manager
  const fetchManagerReimbursements = async (managerId) => {
    try {
      const reimbursementsQuery = query(
        collection(db, 'reimbursements'),
        where('managerId', '==', managerId),
        where('status', 'in', ['pending', 'approved', 'rejected']),
        orderBy('submittedAt', 'desc')
      );
      
      const reimbursementsSnapshot = await getDocs(reimbursementsQuery);
      const reimbursementsData = reimbursementsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setReimbursements(reimbursementsData);
    } catch (error) {
      console.error('Error fetching manager reimbursements:', error);
      setError('Failed to load reimbursements');
    }
  };

  const PreviewView = () => {
    if (!savedData) return null;

    // Calculate total amount
    const totalAmount = savedData.entries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0);

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
        background: 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(8px) saturate(180%)',
        WebkitBackdropFilter: 'blur(8px) saturate(180%)',
      }}>
        <div className="bg-white bg-opacity-80 rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto z-50 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">Reimbursement Request Preview</h2>
            <button
              onClick={() => setShowPreview(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{savedData.empId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Employee Name</p>
                  <p className="font-medium">{savedData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Request Date</p>
                  <p className="font-medium">{savedData.requestDate}</p>
                </div>
              </div>
            </div>

            {/* Expense Entries */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Expense Entries</h3>
                <span className="text-lg font-bold text-blue-700">Total: ₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="space-y-4">
                {savedData.entries.map((entry, index) => (
                  <div key={index} className="border-b pb-4 last:border-b-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-medium">{entry.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{entry.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="font-medium">{entry.description}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Amount</p>
                        <p className="font-medium">₹{entry.amount}</p>
                      </div>
                      {entry.receipt && (
                        <div className="col-span-2">
                          <p className="text-sm text-gray-600">Receipt</p>
                          <a 
                            href={entry.receipt.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {entry.receipt.name}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Justification */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Justification</h3>
              <p className="whitespace-pre-wrap">{savedData.justification}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-8 lg:px-12">
      {showPreview && <PreviewView />}
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isViewMode ? 'Team Member Reimbursements' : 'Reimbursement Request'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isViewMode ? 'View and manage team member reimbursement requests' : 'Submit your expense reimbursement request here'}
          </p>
        </div>

        {isViewMode ? (
          // Team member reimbursements view
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Reimbursement History</h2>
            {savedData && savedData.length > 0 ? (
              <div className="space-y-6">
                {savedData.map((reimbursement) => (
                  <div key={reimbursement.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Request #{reimbursement.id}</h3>
                        <p className="text-sm text-gray-600">Submitted: {reimbursement.submittedAt?.toDate().toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        reimbursement.status === 'approved' ? 'bg-green-100 text-green-800' :
                        reimbursement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reimbursement.status.charAt(0).toUpperCase() + reimbursement.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium">₹{reimbursement.totalAmount || reimbursement.entries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{reimbursement.entries[0]?.category}</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          setSavedData(reimbursement);
                          setShowPreview(true);
                        }}
                        className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <FaEye className="mr-2" /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No reimbursement requests found</p>
            )}
          </div>
        ) : (
          // Regular reimbursement form
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Employee Info */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">Employee Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={employeeInfo.empId}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                  <input
                    type="text"
                    value={employeeInfo.name}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Request</label>
                  <input
                    type="date"
                    value={employeeInfo.requestDate}
                    readOnly
                    className="w-full border rounded px-3 py-2 bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Expense Entries */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-800">Expense Summary</h2>
                <button type="button" onClick={addEntry} className="text-blue-600 hover:underline flex items-center">
                  <FaPlus className="mr-2" /> Add Entry
                </button>
              </div>
              <div className="space-y-6">
                {entries.map((entry, index) => (
                  <div key={index} className="bg-gray-50 p-6 rounded-md relative">
                    {index > 0 && (
                      <button type="button" onClick={() => removeEntry(index)} className="absolute top-4 right-4 text-red-600 hover:text-red-800">
                        <FaTrash />
                      </button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <InputField type="date" label="Date" value={entry.date} onChange={(e) => handleEntryChange(index, 'date', e.target.value)} />
                      <InputField label="Description" value={entry.description} onChange={(e) => handleEntryChange(index, 'description', e.target.value)} />
                      <InputField 
                        type="number" 
                        label="Amount" 
                        value={entry.amount} 
                        onChange={(e) => handleEntryChange(index, 'amount', e.target.value)}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select value={entry.category} onChange={(e) => handleEntryChange(index, 'category', e.target.value)} className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2">
                          <option value="">Select Category</option>
                          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                        {entry.category === 'Other' && (
                          <input
                            type="text"
                            value={entry.otherCategory}
                            onChange={(e) => handleEntryChange(index, 'otherCategory', e.target.value)}
                            placeholder="Please specify category"
                            className="mt-2 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                            required
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Receipt</label>
                        <div className="flex items-center space-x-2">
                          <label className="flex items-center text-blue-600 cursor-pointer">
                            <FaFileUpload className="mr-2" /> Upload
                            <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleFileChange(index, e.target.files[0])} />
                          </label>
                          {entry.receipt && <span className="text-sm text-gray-600">{entry.receipt.name}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Justification */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Justification</h2>
              <textarea 
                value={justification} 
                onChange={(e) => setJustification(e.target.value)} 
                rows={4} 
                className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2"
                placeholder="Please provide justification for these expenses..."
              ></textarea>
            </div>

            {/* Messages */}
            {error && <div className="text-red-600 text-sm font-medium">{error}</div>}
            {success && <div className="text-green-600 text-sm font-medium">{success}</div>}

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={handleSave}
                disabled={isSubmitting}
                className="flex items-center px-4 py-2 text-sm bg-green-600 text-white border border-transparent rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50"
              >
                <FaSave className="mr-2" /> Save Draft
              </button>
              <button 
                type="button" 
                onClick={handleView}
                disabled={!draftId || isSubmitting}
                className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white border border-transparent rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                <FaEye className="mr-2" /> View Draft
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center px-6 py-2 text-sm text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}

        {/* Show team reimbursements for managers */}
        {isManager && !isViewMode && (
          <div className="bg-white p-8 rounded-lg shadow-lg mt-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Team Reimbursements</h2>
            {reimbursements.length > 0 ? (
              <div className="space-y-6">
                {reimbursements.map((reimbursement) => (
                  <div key={reimbursement.id} className="border rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">Request #{reimbursement.id}</h3>
                        <p className="text-sm text-gray-600">
                          Employee: {reimbursement.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Submitted: {reimbursement.submittedAt?.toDate().toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        reimbursement.status === 'approved' ? 'bg-green-100 text-green-800' :
                        reimbursement.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {reimbursement.status.charAt(0).toUpperCase() + reimbursement.status.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-medium">₹{reimbursement.totalAmount || reimbursement.entries.reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="font-medium">{reimbursement.entries[0]?.category}</p>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        onClick={() => {
                          setSavedData(reimbursement);
                          setShowPreview(true);
                        }}
                        className="flex items-center px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        <FaEye className="mr-2" /> View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-4">No reimbursement requests found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, value, onChange, type = 'text', className = '' }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input 
      type={type} 
      value={value} 
      onChange={onChange} 
      className={`block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 ${className}`}
      required 
      step={type === 'number' ? '0.01' : undefined}
    />
  </div>
);

export default ReimbursementRequest;
