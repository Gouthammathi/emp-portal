import React, { useState } from 'react';

const holidayData = {
  "2025": {
    "January": [
      { date: "01", day: "Wed", name: "🎉 New Year's Day" },
      { date: "14", day: "Tue", name: "🌾 Sankranti/Pongal" },
    ],
    "February": [
      { date: "26", day: "Wed", name: "🙏 Maha Shivaratri" },
    ],
    "March": [
      { date: "14", day: "Fri", name: "🎨 Holi" },
    ],
    "April": [],
    "May": [
      { date: "01", day: "Thu", name: "👷 May Day" },
    ],
    "June": [],
    "July": [],
    "August": [
      { date: "15", day: "Fri", name: "🇮🇳 Independence Day" },
      { date: "27", day: "Wed", name: "🐘 Ganesh Chaturthi" },
    ],
    "September": [],
    "October": [
      { date: "02", day: "Wed", name: "🙏 Gandhi Jayanti" },
      { date: "24", day: "Thu", name: "🎉 Dussehra" },
    ],
    "November": [],
    "December": [
      { date: "25", day: "Wed", name: "🎄 Christmas" },
    ],
  }
};

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function HolidayCalendar() {
  const [calendarType, setCalendarType] = useState("Holiday Calendar");
  const [selectedYear, setSelectedYear] = useState("2025");
  const [searchTerm, setSearchTerm] = useState("");

  const renderHolidays = () => {
    return months.map((month) => {
      const holidays = holidayData[selectedYear]?.[month] || [];

      const filteredHolidays = holidays.filter((holiday) =>
        holiday.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Skip months with no matching holidays
      if (filteredHolidays.length === 0 && searchTerm) return null;

      return (
        <div
          key={month}
          className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 p-4 border border-gray-200 flex flex-col justify-between"
        >
          <h2 className="text-xl font-semibold text-orange-400 mb-3">{month.toUpperCase()} {selectedYear}</h2>
          {filteredHolidays.length > 0 ? (
            filteredHolidays.map((holiday, index) => (
              <div key={index} className="text-gray-700 mb-2">
                <div className="text-lg font-bold">{holiday.date}</div>
                <div className="text-sm text-gray-700">{holiday.day} - {holiday.name}</div>
              </div>
            ))
          ) : (
            <p className="text-gray-400 italic">No Holidays</p>
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-6 min-h-screen bg-white from-blue-50 to-purple-100">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">{calendarType}</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="🔍 Search holidays..."
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-400 text-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            value={calendarType}
            onChange={(e) => setCalendarType(e.target.value)}
          >
            <option>Holiday Calendar</option>
            <option>Leave Calendar</option>
          </select>

          <select
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-orange-400"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="2025">2025</option>
            <option value="2024">2024</option>
          </select>
        </div>
      </div>

      {calendarType === "Holiday Calendar" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {renderHolidays()}
        </div>
      ) : (
        <div className="text-gray-600 text-center mt-20 text-lg">
          📝 Leave Calendar feature coming soon!
        </div>
      )}
    </div>
  );
}

export default HolidayCalendar;
