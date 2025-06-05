import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSearchPlus, FaSearchMinus, FaRedo, FaTimes, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

function AdminOrgChart() {
  const [orgData, setOrgData] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrgData();
  }, []);

  const fetchOrgData = async () => {
    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Build the organization tree
      const treeData = buildOrgTree(users);
      setOrgData(treeData);
      
      // Set the root node as expanded by default
      if (treeData) {
        setExpandedNodes(new Set([treeData.empId]));
      }
    } catch (error) {
      console.error('Error fetching org chart:', error);
      toast.error('Failed to load organization chart');
    } finally {
      setLoading(false);
    }
  };

  const buildOrgTree = (users) => {
    const map = {};
    const roots = [];

    // First pass: create a map of all nodes
    users.forEach(user => {
      map[user.empId] = {
        ...user,
        name: `${user.firstName} ${user.lastName}`,
        title: user.designation,
        children: [],
        image: `/image/Employee/${user.empId}.jpg`
      };
    });

    // Second pass: build the tree
    users.forEach(user => {
      if (user.managerId) {
        const parent = map[user.managerId];
        if (parent) {
          parent.children.push(map[user.empId]);
        }
      } else {
        roots.push(map[user.empId]);
      }
    });

    return roots[0]; // Return the root node
  };

  const handleEditEmployee = async () => {
    try {
      const userRef = doc(db, 'users', selectedPerson.id);
      await updateDoc(userRef, {
        firstName: selectedPerson.firstName,
        lastName: selectedPerson.lastName,
        designation: selectedPerson.title,
        managerId: selectedPerson.managerId,
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Employee updated successfully');
      setShowEditModal(false);
      fetchOrgData();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      const userRef = doc(db, 'users', selectedPerson.id);
      await updateDoc(userRef, {
        status: 'inactive',
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Employee deleted successfully');
      setShowDeleteModal(false);
      fetchOrgData();
    } catch (error) {
      console.error('Error deleting employee:', error);
      toast.error('Failed to delete employee');
    }
  };

  const toggleNode = (empId) => {
    const newSet = new Set(expandedNodes);
    newSet.has(empId) ? newSet.delete(empId) : newSet.add(empId);
    setExpandedNodes(newSet);
  };

  const PersonNode = ({ person }) => {
    return (
      <div className="relative group">
        <div
          onClick={() => setSelectedPerson(person)}
          className="flex items-center cursor-pointer hover:scale-105 transition-transform bg-white border-2 border-blue-500 rounded-lg shadow-lg p-4 w-64 min-h-[80px] space-x-3 hover:shadow-xl"
        >
          <div className="flex-shrink-0">
            <img
              src={person.image || '/images/default-user.png'}
              alt={person.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
            />
          </div>
          <div className="flex flex-col justify-center flex-grow overflow-hidden">
            <p className="font-semibold text-sm text-gray-800 truncate" title={person.name}>
              {person.name}
            </p>
            <p className="text-xs text-gray-600 truncate" title={person.title}>
              {person.title}
            </p>
            <p className="text-xs text-gray-500 truncate">ID: {person.empId}</p>
          </div>
        </div>
        
        {/* Admin Controls */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPerson(person);
              setShowEditModal(true);
            }}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <FaEdit />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPerson(person);
              setShowDeleteModal(true);
            }}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <FaTrash />
          </button>
        </div>
      </div>
    );
  };

  const OrgTree = ({ person, level = 0 }) => {
    const isExpanded = expandedNodes.has(person.empId);
    const hasChildren = person.children && person.children.length > 0;

    return (
      <div className="flex flex-col items-center relative">
        <div className="flex flex-col items-center">
          <PersonNode person={person} />
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(person.empId);
              }}
              className="mt-1 text-white bg-gray-300 hover:bg-gray-400 px-2 py-0.5 rounded-full text-xs shadow"
            >
              {person.children.length}
            </button>
          )}
        </div>

        {hasChildren && isExpanded && (
          <>
            <div className="h-6 w-1 bg-blue-400 mt-1" />
            <div className="mt-2 flex flex-wrap justify-center gap-6">
              {person.children.map((child, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 h-4 w-1 bg-blue-400" />
                  <OrgTree person={child} level={level + 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800">
          <span className="text-blue-600">🧭</span> Organization Chart
        </h1>
      </div>

      <div className="relative h-[85vh] overflow-hidden border rounded-xl bg-white shadow-xl">
        <TransformWrapper
          initialScale={0.6}
          minScale={0.3}
          maxScale={2}
          centerOnInit
          wheel={{ step: 0.1 }}
          panning={{ disabled: false }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <div className="absolute top-4 right-4 z-50 flex flex-col space-y-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
                <button 
                  onClick={() => zoomIn()} 
                  className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Zoom In"
                >
                  <FaSearchPlus size={20} />
                </button>
                <button 
                  onClick={() => zoomOut()} 
                  className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Zoom Out"
                >
                  <FaSearchMinus size={20} />
                </button>
                <button 
                  onClick={() => resetTransform()} 
                  className="p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Reset View"
                >
                  <FaRedo size={20} />
                </button>
              </div>

              <TransformComponent wrapperStyle={{ width: "100%", height: "100%" }}>
                <div className="flex justify-center items-start min-w-max min-h-full p-8">
                  {orgData && <OrgTree person={orgData} />}
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {/* Edit Employee Modal */}
      {showEditModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="First Name"
                className="w-full p-2 border rounded"
                value={selectedPerson.firstName}
                onChange={(e) => setSelectedPerson({ ...selectedPerson, firstName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="w-full p-2 border rounded"
                value={selectedPerson.lastName}
                onChange={(e) => setSelectedPerson({ ...selectedPerson, lastName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Designation"
                className="w-full p-2 border rounded"
                value={selectedPerson.title}
                onChange={(e) => setSelectedPerson({ ...selectedPerson, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Manager ID"
                className="w-full p-2 border rounded"
                value={selectedPerson.managerId}
                onChange={(e) => setSelectedPerson({ ...selectedPerson, managerId: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEditEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Delete Employee</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedPerson.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrgChart; 