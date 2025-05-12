import React, { useState } from 'react';
 
function Org() {
  const orgData = {
    name: "Rajshri Rama Krishna",
    title: "Founder & Chairman",
    empId: "111001",
    image: "https://via.placeholder.com/100",
    children: [
      {
        name: "Muralidhar Reddy",
        title: "CTO",
        empId: "111004",
        image: "https://via.placeholder.com/100",
        children: [
          {
            name: "Susmitha.P",
            title: "Lead Cosultant",
            empId: "111028",
            image: "https://via.placeholder.com/100",
            children: [
              {
                name: "Venkste Viswam .R",
                title: "Lead Consultant",
                empId: "111029",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Viswandhuni Laxmi",
                title: "Consultant",
                empId: "111029",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Dharani Obulreddy",
                title: "LConsultant",
                empId: "111021",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Jyothi Konda",
                title: " Consultant",
                empId: "111032",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Neeraja chinnimilli",
                title: " Consultant",
                empId: "111046",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "kasireddy sivakalyani",
                title: "Consultant",
                empId: "111050",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Pentahala Harsha Vardhan",
                title: "Associate Consultant",
                empId: "111069",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Nithin Reddy",
                title: "AssociateConsultant",
                empId: "111071",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Geetha Sandesh",
                title: "Intern",
                empId: "222002",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Ganesh Dhanasri",
                title: "Intern",
                empId: "222001",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Goutham Mathi",
                title: "Intern",
                empId: "222003",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Pachigolla Navya",
                title: "Intern",
                empId: "222004",
                image: "https://via.placeholder.com/100"
              }
            ]
          },
          {
            name: "Mandapati Vajara Reddy",
            title: "Lead Consultant",
            empId: "111014",
            image: "https://via.placeholder.com/100",
            children: [
              {
                name: "Manikanteswara Reddy",
                title: "Associate Consultant",
                empId: "111065",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Akhila Kakarla",
                title: "Associate Consultant",
                empId: "111064",
                image: "https://via.placeholder.com/100"
              }
            ]
          }
        ]
      },
      {
        name: "CK Reddy",
        title: "CEO",
        empId: "111002",
        image: "https://via.placeholder.com/100",
        children: [
          { name: "Sambi Reddy", title: "Consultant", empId: "111006", image: "https://via.placeholder.com/100" },
          { name: "Anirudh Tappela", title: "Associate Consultant", empId: "111016", image: "https://via.placeholder.com/100" },
          { name: "Chandra Sekhar .K", title: "Associate Consultant", empId: "111031", image: "https://via.placeholder.com/100" },
          { name: "Amareshwar", title: "Associate Consultant", empId: "111078", image: "https://via.placeholder.com/100" },
          { name: "Maqbool Hussain", title: "Associate Consultant", empId: "111082", image: "https://via.placeholder.com/100" }
        ]
      },
      {
        name: "Syam Reddy",
        title: "COO",
        empId: "111003",
        image: "https://via.placeholder.com/100",
        children: [
          { name: "Subba Ram Reddy", title: "HR Manager", empId: "111015", image: "https://via.placeholder.com/100" },
          { name: "Isiviah lyagala", title: "", empId: "111045", image: "https://via.placeholder.com/100" },
          { name: "Pothukuchi Surya", title: "Recruitment Head", empId: "111007", image: "https://via.placeholder.com/100" },
          { name: "Dodla Sai Kumar", title: "Digital Marketing Executive", empId: "111062", image: "https://via.placeholder.com/100" }
        ]
      },
      {
        name: "Radha Krishna",
        title: "CFO",
        empId: "111088",
        image: "https://via.placeholder.com/100",
 
      },
      {
        name: "Hari Reddy",
        title: "Senior Solution Architect",
        empId: "111007",
        image: "https://via.placeholder.com/100",
        children: [
          {
            name: "Nikhileshwar Reddy G",
            title: "Lead Cosultant",
            empId: "111012",
            image: "https://via.placeholder.com/100",
            children: [
              {
                name: "Poojitha Bandaru",
                title: "Lead Consultant",
                empId: "111035",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Aswartha Narayana",
                title: "Consultant",
                empId: "111037",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Sai Kumar Thalikota",
                title: "Associate Consultant",
                empId: " 111020",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Gaurav Bhargav Patil",
                title: "Associate Consultant",
                empId: "111017",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Gangadasari Lakshmi ",
                title: " FUNCTIONAL CONSULTANT",
                empId: "111018",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "kasireddy sivakalyani",
                title: "Consultant",
                empId: "111050",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Pentahala Harsha Vardhan",
                title: "Associate Consultant",
                empId: "111069",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Nithin Reddy",
                title: "AssociateConsultant",
                empId: "111071",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Geetha Sandesh",
                title: "Intern",
                empId: "222002",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Ganesh Dhanasri",
                title: "Intern",
                empId: "222001",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Goutham Mathi",
                title: "Intern",
                empId: "222003",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Pachigolla Navya",
                title: "Intern",
                empId: "222004",
                image: "https://via.placeholder.com/100"
              }
            ]
          },
       
        ]
      },
      {
        name: "G P Subba Reddy",
        title: "Senior Solution Architect",
        empId: "111010",
        image: "https://via.placeholder.com/100",
        children: [
          {
            name: "hi",
            title: "Lead Cosultant",
            empId: "111028",
            image: "https://via.placeholder.com/100",
            children: [
              {
                name: "Venkste Viswam .R",
                title: "Lead Consultant",
                empId: "111029",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Viswandhuni Laxmi",
                title: "Consultant",
                empId: "111029",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Dharani Obulreddy",
                title: "Consultant",
                empId: "111021",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Jyothi Konda",
                title: " Consultant",
                empId: "111032",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Neeraja chinnimilli",
                title: " Consultant",
                empId: "111046",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "kasireddy sivakalyani",
                title: "Consultant",
                empId: "111050",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Pentahala Harsha Vardhan",
                title: "Associate Consultant",
                empId: "111069",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Nithin Reddy",
                title: "AssociateConsultant",
                empId: "111071",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Geetha Sandesh",
                title: "Intern",
                empId: "222002",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Ganesh Dhanasri",
                title: "Intern",
                empId: "222001",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Goutham Mathi",
                title: "Intern",
                empId: "222003",
                image: "https://via.placeholder.com/100"
              },
              {
                name: "Pachigolla Navya",
                title: "Intern",
                empId: "222004",
                image: "https://via.placeholder.com/100"
              }
            ]
          },
         
        ]
      }
    ]
  };
 
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(["111001", "111002", "111004"]));
 
  const toggleNode = (empId) => {
    const newSet = new Set(expandedNodes);
    newSet.has(empId) ? newSet.delete(empId) : newSet.add(empId);
    setExpandedNodes(newSet);
  };
 
  const countDescendants = (person) => {
    if (!person.children) return 0;
    let count = person.children.length;
    person.children.forEach(child => {
      count += countDescendants(child);
    });
    return count;
  };
 
  const getBorderColor = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("founder") || lower.includes("chairman")) return "border-red-500";
    if (lower.includes("cto") || lower.includes("ceo") || lower.includes("coo") || lower.includes("cfo") || lower.includes("architect")) return "border-yellow-400";
    if (lower.includes("lead") || lower.includes("head")) return "border-green-500";
    return "border-blue-500";
  };
 
  const getConnectorColor = (level) => {
    if (level === 0) return "bg-red-400";
    if (level === 1) return "bg-yellow-400";
    if (level === 2) return "bg-green-400";
    return "bg-blue-400";
  };
 
  const PersonNode = ({ person }) => {
    const borderColor = getBorderColor(person.title);
    return (
      <div
        onClick={() => setSelectedPerson(person)}
        className={`flex items-center cursor-pointer hover:scale-105 transition-transform bg-white border ${borderColor} rounded-md shadow p-2 w-48 min-h-[60px] space-x-2`}
      >
        <img
          src={person.image}
          alt={person.name}
          className="w-8 h-8 rounded-full object-cover shadow"
        />
        <div className="flex flex-col justify-center">
          <p className="font-medium text-xs text-gray-800">{person.name}</p>
          <p className="text-[10px] text-gray-500">{person.title}</p>
          <p className="text-[10px] text-gray-400">ID: {person.empId}</p>
        </div>
      </div>
    );
  };
 
  const OrgTree = ({ person, level = 0 }) => {
    const isExpanded = expandedNodes.has(person.empId);
    const hasChildren = person.children && person.children.length > 0;
    const connectorColor = getConnectorColor(level);
 
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
              className="mt-1 text-white bg-gray-300 hover:bg-gray-300 px-2 py-0.5 rounded-full text-xs shadow"
            >
              {countDescendants(person)}
            </button>
          )}
        </div>
 
        {hasChildren && isExpanded && (
          <>
            <div className={`h-6 w-1 ${connectorColor} mt-1`} />
            <div className={`mt-2 ${level === 0 ? "flex flex-wrap justify-center gap-6" : "flex flex-col items-center space-y-4"}`}>
              {person.children.map((child, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute top-0 left-1/2 transform -translate-x-1/2 h-4 w-1 ${connectorColor}`} />
                  <OrgTree person={child} level={level + 1} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };
 
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-10">🧭 Organization Chart</h1>
      <div className="overflow-auto pb-16">
        <OrgTree person={orgData} />
      </div>
 
      {selectedPerson && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-300 rounded-lg shadow-2xl p-5 w-80 z-50 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Person Details</h2>
            <button
              onClick={() => setSelectedPerson(null)}
              className="text-gray-500 hover:text-red-500 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <img
            src={selectedPerson.image}
            alt={selectedPerson.name}
            className="w-20 h-20 rounded-full mx-auto mb-4"
          />
          <p className="text-center text-lg font-bold">{selectedPerson.name}</p>
          <p className="text-center text-gray-600">{selectedPerson.title}</p>
          <p className="text-center text-sm text-gray-500">ID: {selectedPerson.empId}</p>
        </div>
      )}
 
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
 
export default Org;