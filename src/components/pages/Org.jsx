import React, { useState } from 'react';
import { FaUserCircle, FaSearchPlus, FaSearchMinus, FaRedo, FaTimes } from 'react-icons/fa';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";



function Org() {
  const orgData = {
    name: "Rajshri Rama Krishna",
    title: "Founder & Chairman",
    empId: "111001",
    image: '/image/Employee/Emp-69.jpg',
    children: [
      {
        name: "Muralidhar Reddy",
        title: "CTO",
        empId: "111004",
        image: '/image/Employee/111004.jpg',

        children: [
          {name: "Susmitha.P",title: "Lead Cosultant",empId: "111028",image: '/image/Employee/111028.jpg',
            children: [
              {name: "Venkata Viswam .R",title: "Lead Consultant",empId: "111029",image: '/image/Employee/111029.jpg'},
              {name: "Viswandhuni Laxmi",title: "Consultant",empId: "111023",image:'/image/Employee/111023.jpg'},
              {name: "Dharani Obulreddy",title: "LConsultant",empId: "111021",image: '/image/Employee/111021.jpeg'},
              {name: "Jyothi Konda",title: " Consultant",empId: "111032",image:'/image/Employee/111032.jpg'},
              {name: "Neeraja chinnimilli",title: " Consultant",empId: "111046",image: '/image/Employee/111046.jpg'},
              {name: "kasireddy sivakalyani",title: "Consultant",empId: "111050",image: '/image/Employee/111050.jpg'},
              {name: "Pentahala Harsha Vardhan",title: "Associate Consultant",empId: "111069",image:'/image/Employee/111069.jpg'},
              {name: "Nithin Reddy",title: "AssociateConsultant",empId: "111071",image: '/image/Employee/111071.jpg'},
              {name: "Geetha Sandesh",title: "Intern",empId: "222002",image:'/image/Employee/222002.jpg'},
              {name: "Ganesh Dhanasri",title: "Intern",empId: "222001",image:'/image/Employee/222001.jpg'},
              {name: "Goutham Mathi",title: "Intern",empId: "222003",image:'/image/Employee/222003.jpg'},
              {name: "Pachigolla Navya",title: "Intern",empId: "222004",image: '/image/Employee/222004.jpg'}
            ]
          },
          {name: "Mandapati Vajara Reddy",title: "Lead Consultant",empId: "111014",image:'/image/Employee/111014.jpg',
            children: [
              {name: "Manikanteswara Reddy",title: "Associate Consultant",empId: "111065",image:'/image/Employee/111065.jpeg'},
              {name: "Akhila Kakarla",title: "Associate Consultant",empId: "111064",image:'/image/Employee/111064.jpg'}
            ]
          }
        ]
      },
      {
        name: "CK Reddy",
        title: "CEO",
        empId: "111002",
        image: '/image/Employee/111002.png',
        children: [
          { name: "Sambi Reddy", title: "Consultant", empId: "111006", image: '/image/Employee/111006.png' },
          { name: "Anirudh Tappela", title: "Associate Consultant", empId: "111016", image: '/image/Employee/111016.jpg' },
          { name: "Chandra Sekhar .K", title: "Associate Consultant", empId: "111031", image: '/image/Employee/111031.jpg' },
          { name: "Amareshwar", title: "Associate Consultant", empId: "111078", image:'/image/Employee/111078.jpg' },
          { name: "Maqbool Hussain", title: "Associate Consultant", empId: "111082", image: '/image/Employee/111082.jpg' }
        ]
      },
      {
        name: "Syam Reddy",
        title: "COO",
        empId: "111003",
        image: '/image/Employee/111003.png',
        children: [
          { name: "Subba Ram Reddy", title: "HR Manager", empId: "111015", image: '/image/Employee/111015.jpg' },
          { name: "Isiviah lyagala", title: "", empId: "111045", image: '/image/Employee/111045.jpg' },
          { name: "Pothukuchi Surya", title: "Recruitment Head", empId: "111007", image: '/image/Employee/111007.png' },
          { name: "Dodla Sai Kumar", title: "Digital Marketing Executive", empId: "111062", image:'/image/Employee/111062.jpg' }
        ]
      },
      {name: "Radha Krishna",title: "CFO",empId: "111088",image:''},
      {name: "Hari Reddy",title: "Senior Solution Architect",empId: "111005",image: '/image/Employee/111005.jpg',
        children: [
          {name: "Nikhileshwar Reddy G",title: "Lead Cosultant",empId: "111012",image:'/image/Employee/111012.jpg',
            children: [
              {name: "Poojitha Bandaru",title: "Associate Consultant",empId: "111035",image: '/image/Employee/111035.jpeg'},
              {name: "Aswartha Narayana",title: "Consultant",empId: "111037",image: '/image/Employee/111037.JPG'},
              {name: "Sai Kumar Thalikota",title: "Associate Consultant",empId: " 111020",image:'/image/Employee/111020.jpg'},
              {name: "Gaurav Bhargav Patil",title: "Associate Consultant",empId: "111017",image: '/image/Employee/111017'},
              {name: "Gangadasari Lakshmi ",title: " FUNCTIONAL CONSULTANT",empId: "111018",image: '/image/Employee/111018.jpg'},
              {name: "Ajay Rajashekar Gundinahole",title: "Functional Consultant",empId: "111009",image:'/image/Employee/111009.jpg' },
              {name: "Harish Bathala ",title: " Associate Consultant",empId: "111038",image:'/image/Employee/111038.jpg' },
              {name: "Prathibha Polagari",title: " Functional Consultant",empId: "111019",image:'/image/Employee/111019.jpg' },
              {name: "Hemanth Kumar Reddy Bollapu",title: "Consultant",empId: "111044",image:'/image/Employee/111044.jpg' },
              {name: "Chandra Sekhara Reddy Chittepu",title: "Consultant",empId: "111056",image: '/image/Employee/111056.jpg'},
              {name: "Shravan Kumar kharwar",title: "Senoir Functional Consultant",empId: "111010",image:'/image/Employee/111010.jpg' },
              {name: "Parameswar Reddy Obulreddy",title: "Associate Consultant",empId: "111061",image:'/image/Employee/111061.jpg' },
              {name: "Nara Sai Hemanth Reddy",title: "Associate Consultant",empId: "111063",image:'/image/Employee/111063.jpg' },
              {name: "Ganesh Gunde",title: "Associate Consultant",empId: "111068",image:'/image/Employee/111068.jpg' },
              {name: "Pachharapalle Siva Nageswara Reddy",title: "Associate Consultant",empId: "111073",image:'/image/Employee/111073.jpg' },
              {name: "Vijay Kumar M",title: "Associate Consultant",empId: "111075",image:'/image/Employee/111075.jpg' },
              {name: "Thota Lakshminarasimha Udaya Bhaskar",title: "Associate Consultant",empId: "111074",image:'/image/Employee/111074.jpg' },
              {name: "Dinesh Reddy S.",title: "Associate Consultant",empId: "111067",image:'/image/Employee/111067.jpg' },
              {name: "Kavya Penugonda",title: "Associate Consultant",empId: "111079",image:'/image/Employee/111079.jpg' },
            ]
          },
       
        ]
      },
      {
        name: "G P Subba Reddy",
        title: "Senior Solution Architect",
        empId: "111087",
        image: '',
        children: [
          {
            name: "Nigama Ambala",
            title: "Cosultant",
            empId: "111047",
            image: "emp-portal-main/public/ID Card Photos/ID Card Photos/111002.png",
            children: [
              {name: "Rajesh.N",title: "Consultant",empId: "111024",image: '/image/Employee/111024.jpg',},
              {name: "Sreedhar Sreeram",title: "Consultant",empId: "111025",image: '/image/Employee/111025.jpeg',},
              {name: "Gaddam Hashitha Reddy",title: "Consultant",empId: "111043",image: '/image/Employee/111043.jpg',},
              {name: "Madupu Gayathri",title: " Consultant",empId: "111042",image: '/image/Employee/111042.jpeg',},
              {name: "Jadapalli Devendra Goud",title: " Consultant",empId: "111041",image: '/image/Employee/111041.jpg',},
              {name: "P Priyathama Subhash",title: "Consultant",empId: "111048",image: '/image/Employee/111048.jpg',},
              {name: "Ramya Pasala",title: "Consultant",empId: "111049",image: '/image/Employee/111049.jpg'},
              {name: "Paloju Srilekha",title: "Consultant",empId: "111051",image: '/image/Employee/111051.jpeg',},
              {name: "Ramesh Pasuvula",title: "Consultant",empId: "111055",image: '/image/Employee/111055.jpg'},
              {name: "Naveen Kumar Reddy M",title: "Consultant",empId: "111054",image: '/image/Employee/111054.jpg',},
              {name: "Uday Deepak Burela",title: "Consultant",empId: "111057",image: '/image/Employee/111057.jpg',},
              {name: "Bhavani Thumkunta",title: " Associate Consultant",empId: "111066",image: '/image/Employee/111066.jpeg',},
              {name: "Moola Muni Swetha",title: " Associate Consultant",empId: "111076",image: '/image/Employee/111076.jpg',},
              {name: "Vanguri Chakradhar Reddy",title: " Associate Consultant",empId: "111077",image: '/image/Employee/111077.jpg',},
              {name: "Sailaja Konudula",title: " Associate Consultant",empId: "111072",image: '/image/Employee/111072.jpeg',},
              {name: "Donthireddy Niharika",title: " Associate Consultant",empId: "111080",image: '/image/Employee/111080.jpeg',},

              
            ]
          },
         
        ]
      }
    ]
  };
 
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set(["111001"]));
  const [zoomLevel, setZoomLevel] = useState(1);


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
    if (lower.includes("top level manager")) return "border-red-500";
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
   const getBackgroundColor = (title) => {
    const lower = title.toLowerCase();
    if (lower.includes("top level manager")) return "bg-red-50";
    if (lower.includes("cto") || lower.includes("ceo") || lower.includes("coo") || lower.includes("cfo") || lower.includes("architect")) return "bg-yellow-50";
    if (lower.includes("lead") || lower.includes("head")) return "bg-green-50";
    return "bg-blue-50";
  };


  const PersonNode = ({ person }) => {
    const borderColor = getBorderColor(person.title);
    const bgColor = getBackgroundColor(person.title);

    return (
      <div
        onClick={() => setSelectedPerson(person)}
        className={`flex items-center cursor-pointer hover:scale-105 transition-transform ${bgColor} border-2 ${borderColor} rounded-lg shadow-lg p-4 w-64 min-h-[80px] space-x-3 hover:shadow-xl`}
      >
        <div className="flex-shrink-0">
          <img
            src={person.image}
            alt={person.name}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/default-user.png"; 
            }}
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
    );
  };



  const OrgTree = ({ person, level = 0, parent = null }) => {
    const isExpanded = expandedNodes.has(person.empId);
    const hasChildren = person.children && person.children.length > 0;
    const connectorColor = getConnectorColor(level);

    const shouldUseRowLayout =
      person.name === "Rajshri Rama Krishna" ||
      person.name === "Muralidhar Reddy";

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
            <div
              className={`mt-2 ${
                shouldUseRowLayout
                  ? "flex flex-wrap justify-center gap-6"
                  : "flex flex-col items-center space-y-4"
              }`}
            >
              {person.children.map((child, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute top-0 left-1/2 transform -translate-x-1/2 h-4 w-1 ${connectorColor}`}
                  />
                  <OrgTree person={child} level={level + 1} parent={person} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
        <span className="text-blue-600">🧭</span> Organization Chart
      </h1>
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
                  <OrgTree person={orgData} />
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      </div>

      {selectedPerson && (
        <div className="fixed bottom-6 right-6 bg-white border border-gray-300 rounded-lg shadow-2xl p-5 w-80 z-50 animate-fade-in">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-gray-800">Person Details</h2>
            <button
              onClick={() => setSelectedPerson(null)}
              className="text-gray-500 hover:text-red-500 text-2xl font-bold transition-colors"
            >
              <FaTimes />
            </button>
          </div>
          <div className="flex flex-col items-center">
            <img
              src={selectedPerson.image}
              alt={selectedPerson.name}
              className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
            />
            <p className="text-center text-lg font-bold text-gray-800">{selectedPerson.name}</p>
            <p className="text-center text-gray-600">{selectedPerson.title}</p>
            <p className="text-center text-sm text-gray-500 mt-1">ID: {selectedPerson.empId}</p>
          </div>
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