import React, { useState, useEffect } from 'react';
import { FaUserCircle, FaSearchPlus, FaSearchMinus, FaRedo, FaTimes, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { toast } from 'react-toastify';

// Initial org chart data from CSV
const initialOrgData = [
  { empId: "111001", name: "Rajshri Rama Krishna Walse", title: "Top Level Manager", managerId: null },
  { empId: "111002", name: "CHITTEPU LAKSHMI CHENNA KESAVA REDDY", title: "CEO", managerId: "111001" },
  { empId: "111003", name: "Syama Sundara Reddy Obulapuram", title: "COO", managerId: "111001" },
  { empId: "111004", name: "Muralidhar Reddy Nara", title: "CTO", managerId: "111001" },
  { empId: "111005", name: "Hari Nadha Reddy Andluru", title: "Senior Solution Architect", managerId: "111001" },
  { empId: "111087", name: "G P Subba Reddy", title: "Senior Solution Architect", managerId: "111001" },
  { empId: "111088", name: "Radha Krishna Battu", title: "CFO", managerId: "111001" },
  { empId: "111047", name: "Nigama Ambala", title: "Consultant", managerId: "111087" },
  { empId: "111007", name: "Pothukuchi Surya Annapurna Santhy Kamal", title: "Recruitment Head", managerId: "111003" },
  { empId: "111015", name: "SUBBA RAM REDDY JEEREDDY", title: "HR Manager", managerId: "111003" },
  { empId: "111045", name: "Isvaiah Lyagala", title: "Consultant", managerId: "111003" },
  { empId: "111062", name: "Dodla Sai Kumar", title: "Digital Marketing Executive", managerId: "111003" },
  { empId: "111006", name: "Gade Sambi Reddy", title: "Consultant", managerId: "111002" },
  { empId: "111016", name: "Anirudh Teppala", title: "Associate Consultant", managerId: "111002" },
  { empId: "111031", name: "Chandra Sekhar . K", title: "Associate Consultant", managerId: "111002" },
  { empId: "111078", name: "Amareshwar", title: "Associate Consultant", managerId: "111002" },
  { empId: "111082", name: "MAQBOOL HUSSAIN SYED", title: "Associate Consultant", managerId: "111002" },
  { empId: "111014", name: "Mandapati Vajra Reddy", title: "Lead Consultant", managerId: "111004" },
  { empId: "111028", name: "Susmitha.P", title: "Lead Consultant", managerId: "111004" },
  { empId: "111012", name: "Nikhileswar Reddy G", title: "Lead Consultant", managerId: "111005" },
  { empId: "111024", name: "RAJESH.N", title: "Consultant", managerId: "111047" },
  { empId: "111025", name: "Sreedhar Sreeram", title: "Consultant", managerId: "111047" },
  { empId: "111041", name: "Jadapalli Devendra Goud", title: "Consultant", managerId: "111047" },
  { empId: "111042", name: "Madupu Gayathri", title: "Consultant", managerId: "111047" },
  { empId: "111043", name: "Gaddam Hashitha Reddy", title: "Consultant", managerId: "111047" },
  { empId: "111048", name: "Pydikondala priyathama subhash", title: "Consultant", managerId: "111047" },
  { empId: "111049", name: "Ramya Pasala", title: "Consultant", managerId: "111047" },
  { empId: "111051", name: "Paloju Srilekha", title: "Consultant", managerId: "111047" },
  { empId: "111054", name: "Naveen Kumar Reddy Malireddy", title: "Consultant", managerId: "111047" },
  { empId: "111055", name: "Ramesh Pasuvula", title: "Consultant", managerId: "111047" },
  { empId: "111057", name: "Uday Deepak Burela", title: "Consultant", managerId: "111047" },
  { empId: "111066", name: "Bhavani Thumkunta", title: "Associate Consultant", managerId: "111047" },
  { empId: "111072", name: "Sailaja Konudula", title: "Associate Consultant", managerId: "111047" },
  { empId: "111076", name: "Moola Muni Swetha", title: "Associate Consultant", managerId: "111047" },
  { empId: "111077", name: "Vanguri Chakradhar Reddy", title: "Associate Consultant", managerId: "111047" },
  { empId: "111080", name: "Donthireddy Niharika", title: "Associate Consultant", managerId: "111047" },
  { empId: "111021", name: "Dharani Obulreddy", title: "Consultant", managerId: "111028" },
  { empId: "111023", name: "Viswanadhuni Lakshmi Kalyani", title: "Consultant", managerId: "111028" },
  { empId: "111029", name: "Venkata Viswam .R", title: "Lead Consultant", managerId: "111028" },
  { empId: "111032", name: "Jyothi Konda", title: "Consultant", managerId: "111028" },
  { empId: "111046", name: "Neeraja Chinnimilli", title: "Consultant", managerId: "111028" },
  { empId: "111050", name: "Kasireddy Sivakalyani", title: "Consultant", managerId: "111028" },
  { empId: "111069", name: "Penthala Harsha Vardhan", title: "Associate Consultant", managerId: "111028" },
  { empId: "111071", name: "Nithin Reddy Gangadasari", title: "Associate Consultant", managerId: "111028" },
  { empId: "222001", name: "Ganesh Dhanasri", title: "Intern", managerId: "111028" },
  { empId: "222002", name: "Geetha Sandesh N", title: "Intern", managerId: "111028" },
  { empId: "222003", name: "Goutham Mathi", title: "Intern", managerId: "111028" },
  { empId: "222004", name: "Pachigolla Navya", title: "Intern", managerId: "111028" },
  { empId: "111064", name: "Akhila kakarla", title: "Associate Consultant", managerId: "111014" },
  { empId: "111065", name: "Manikanteswara Reddy Mukkamalla", title: "Associate Consultant", managerId: "111014" },
  { empId: "111009", name: "Ajay Rajashekhar Gundinahole", title: "Functional Consultant", managerId: "111012" },
  { empId: "111010", name: "Shravan Kumar kharwar", title: "Senior Functional Consultant", managerId: "111012" },
  { empId: "111017", name: "Gaurav Bhargav Patil", title: "Associate Consultant", managerId: "111012" },
  { empId: "111018", name: "Gangadasari Lakshmi Narasimha Reddy", title: "Functional Consultant", managerId: "111012" },
  { empId: "111019", name: "Prathibha Polagari", title: "Functional Consultant", managerId: "111012" },
  { empId: "111020", name: "Sai Kumar Thalikota", title: "Associate Consultant", managerId: "111012" },
  { empId: "111035", name: "Poojitha Bandaru", title: "Associate Consultant", managerId: "111012" },
  { empId: "111037", name: "Aswartha Narayanamma Vulindala", title: "Consultant", managerId: "111012" },
  { empId: "111038", name: "Harish Bathala", title: "Associate Consultant", managerId: "111012" },
  { empId: "111044", name: "Hemanth Kumar Reddy Bollapu", title: "Consultant", managerId: "111012" },
  { empId: "111056", name: "Chandra Sekhara Reddy Chittepu", title: "Consultant", managerId: "111012" },
  { empId: "111061", name: "Parameswar Reddy Obulreddy", title: "Associate Consultant", managerId: "111012" },
  { empId: "111063", name: "Nara Sai Hemanth Reddy", title: "Associate Consultant", managerId: "111012" },
  { empId: "111067", name: "Dinesh Reddy S.", title: "Associate Consultant", managerId: "111012" },
  { empId: "111068", name: "Ganesh Gunde", title: "Associate Consultant", managerId: "111012" },
  { empId: "111073", name: "Pachharapalle Siva Nageswara Reddy", title: "Associate Consultant", managerId: "111012" },
  { empId: "111074", name: "Thota Lakshminarasimha Udaya Bhaskar", title: "Associate Consultant", managerId: "111012" },
  { empId: "111075", name: "Vijay Kumar M", title: "Associate Consultant", managerId: "111012" },
  { empId: "111079", name: "Kavya Penugonda", title: "Associate Consultant", managerId: "111012" }
];

function AdminOrgChart() {
  const [orgData, setOrgData] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(["111001"]));
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    title: '',
    empId: '',
    managerId: '',
    image: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeOrgChart = async () => {
      try {
        // Check if org chart data exists in Firestore
        const orgChartRef = collection(db, 'orgChart');
        const snapshot = await getDocs(orgChartRef);
        
        if (snapshot.empty) {
          // If no data exists, initialize with CSV data
          const batch = db.batch();
          initialOrgData.forEach(employee => {
            const docRef = doc(orgChartRef);
            batch.set(docRef, {
              ...employee,
              image: `/image/Employee/${employee.empId}.jpg`
            });
          });
          await batch.commit();
          toast.success('Organization chart initialized successfully');
        }
        
        // Fetch the data
        await fetchOrgData();
      } catch (error) {
        console.error('Error initializing org chart:', error);
        toast.error('Failed to initialize organization chart');
        setLoading(false);
      }
    };

    initializeOrgChart();
  }, []);

  const fetchOrgData = async () => {
    try {
      const orgChartRef = collection(db, 'orgChart');
      const snapshot = await getDocs(orgChartRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Convert flat data to tree structure
      const treeData = buildOrgTree(data);
      setOrgData(treeData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching org chart:', error);
      toast.error('Failed to load organization chart');
      setLoading(false);
    }
  };

  const buildOrgTree = (data) => {
    const map = {};
    const roots = [];

    // First pass: create a map of all nodes
    data.forEach(item => {
      map[item.empId] = { ...item, children: [] };
    });

    // Second pass: build the tree
    data.forEach(item => {
      if (item.managerId) {
        const parent = map[item.managerId];
        if (parent) {
          parent.children.push(map[item.empId]);
        }
      } else {
        roots.push(map[item.empId]);
      }
    });

    return roots[0]; // Return the root node
  };

  const handleAddEmployee = async () => {
    try {
      const orgChartRef = collection(db, 'orgChart');
      await addDoc(orgChartRef, newEmployee);
      toast.success('Employee added successfully');
      setShowAddModal(false);
      setNewEmployee({
        name: '',
        title: '',
        empId: '',
        managerId: '',
        image: ''
      });
      fetchOrgData();
    } catch (error) {
      console.error('Error adding employee:', error);
      toast.error('Failed to add employee');
    }
  };

  const handleEditEmployee = async () => {
    try {
      const orgChartRef = collection(db, 'orgChart');
      const q = query(orgChartRef, where('empId', '==', selectedPerson.empId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = doc(db, 'orgChart', snapshot.docs[0].id);
        await updateDoc(docRef, selectedPerson);
        toast.success('Employee updated successfully');
        setShowEditModal(false);
        fetchOrgData();
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      toast.error('Failed to update employee');
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      const orgChartRef = collection(db, 'orgChart');
      const q = query(orgChartRef, where('empId', '==', selectedPerson.empId));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const docRef = doc(db, 'orgChart', snapshot.docs[0].id);
        await deleteDoc(docRef);
        toast.success('Employee deleted successfully');
        setShowDeleteModal(false);
        fetchOrgData();
      }
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
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus /> Add Employee
        </button>
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

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 border rounded"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Title"
                className="w-full p-2 border rounded"
                value={newEmployee.title}
                onChange={(e) => setNewEmployee({ ...newEmployee, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Employee ID"
                className="w-full p-2 border rounded"
                value={newEmployee.empId}
                onChange={(e) => setNewEmployee({ ...newEmployee, empId: e.target.value })}
              />
              <input
                type="text"
                placeholder="Manager ID"
                className="w-full p-2 border rounded"
                value={newEmployee.managerId}
                onChange={(e) => setNewEmployee({ ...newEmployee, managerId: e.target.value })}
              />
              <input
                type="text"
                placeholder="Image URL"
                className="w-full p-2 border rounded"
                value={newEmployee.image}
                onChange={(e) => setNewEmployee({ ...newEmployee, image: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {showEditModal && selectedPerson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Edit Employee</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-2 border rounded"
                value={selectedPerson.name}
                onChange={(e) => setSelectedPerson({ ...selectedPerson, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Title"
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
              <input
                type="text"
                placeholder="Image URL"
                className="w-full p-2 border rounded"
                value={selectedPerson.image}
                onChange={(e) => setSelectedPerson({ ...selectedPerson, image: e.target.value })}
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