import React, { useState } from 'react';
import { FaUser, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Static org chart data extracted from the image (partial for brevity)
const orgData = [
  {
    empId: '111001',
    name: 'Rajshri Rama Krishna Walse',
    managerId: null,
    children: [
      {
        empId: '111002',
        name: 'CHITTEPU LAKSHMI CHENNA KESAVA REDDY',
        managerId: '111001',
        children: [
          { empId: '111006', name: 'Gade Sambi Reddy', managerId: '111002', children: [] },
          { empId: '111008', name: 'Anirudh Teppala', managerId: '111002', children: [] },
          // ... more direct reports
        ]
      },
      {
        empId: '111003',
        name: 'Syama Sundara Reddy Obulapuram',
        managerId: '111001',
        children: [
          { empId: '111045', name: 'Isvaiah Lyagala', managerId: '111003', children: [] },
          { empId: '111046', name: 'Amareswhar', managerId: '111003', children: [] },
          // ... more direct reports
        ]
      },
      // ... more direct reports from the image
    ]
  }
  // ... more top-level managers if any
];

const getRoleColor = (level) => {
  // Color by level for visual distinction
  switch (level) {
    case 0: return 'bg-orange-100 border-orange-500 text-orange-700';
    case 1: return 'bg-blue-100 border-blue-500 text-blue-700';
    case 2: return 'bg-green-100 border-green-500 text-green-700';
    default: return 'bg-gray-100 border-gray-400 text-gray-700';
  }
};

const OrgNode = ({ node, level = 0 }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;
  return (
    <div className="flex flex-col items-center">
      <div className={`relative p-4 rounded-lg border-2 ${getRoleColor(level)} shadow-lg min-w-[220px] mb-2`}>
        <div className="flex items-center space-x-3">
          <FaUser className="w-6 h-6" />
          <div>
            <h3 className="font-semibold">{node.name}</h3>
            <p className="text-xs opacity-60">ID: {node.empId}</p>
          </div>
          {hasChildren && (
            <button onClick={() => setExpanded(e => !e)} className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors">
              {expanded ? <FaChevronUp className="w-4 h-4" /> : <FaChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="mt-2 flex space-x-4">
          {node.children.map(child => (
            <OrgNode key={child.empId} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const OrgChartPage = () => (
  <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
    <div className="max-w-6xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-orange-600 mb-2">Organization Chart</h1>
        <p className="text-gray-600">Visual representation of the company hierarchy</p>
      </div>
      <div className="overflow-x-auto flex justify-center">
        {orgData.map(root => (
          <OrgNode key={root.empId} node={root} />
        ))}
      </div>
    </div>
  </div>
);

export default OrgChartPage; 