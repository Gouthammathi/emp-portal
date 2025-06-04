import * as XLSX from 'xlsx';
 
export const parseExcelFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
   
    reader.onload = (e) => {
      try {
        const data = e.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
       
        // First try with header: 1 to get raw data
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
       
        // Log the first few rows for debugging
        console.log('Excel Data:', jsonData.slice(0, 3));
 
        // Get headers from first row and clean them
        const headers = jsonData[0].map(header => {
          if (typeof header === 'string') {
            return header.trim().toLowerCase();
          }
          return '';
        });
 
        console.log('Headers:', headers);
 
        // Process data rows
        const mappedData = jsonData.slice(1).map(row => {
          const rowData = {};
         
          // Map each column to its corresponding field
          headers.forEach((header, index) => {
            const value = row[index];
           
            // Map the Excel column to our form field
            switch(header) {
              case 'first name':
              case 'firstname':
              case 'first_name':
                rowData.firstName = value || '';
                break;
              case 'last name':
              case 'lastname':
              case 'last_name':
                rowData.lastName = value || '';
                break;
              case 'email':
              case 'email address':
                rowData.email = value || '';
                break;
              case 'phone':
              case 'phone number':
              case 'contact number':
                rowData.phone = value || '';
                break;
              case 'employee id':
              case 'employeeid':
              case 'emp id':
              case 'emp_id':
                rowData.empId = value || '';
                break;
              case 'department':
                rowData.department = value || '';
                break;
              case 'designation':
              case 'job title':
                rowData.designation = value || '';
                break;
              case 'role':
              case 'position':
                rowData.role = mapRole(value || '');
                break;
              case 'status':
                rowData.status = value?.toLowerCase() || 'active';
                break;
              case 'joining date':
              case 'joiningdate':
              case 'date of joining':
                rowData.joiningDate = formatDate(value) || '';
                break;
              case 'date of birth':
              case 'dob':
              case 'birth date':
                rowData.dateOfBirth = formatDate(value) || '';
                break;
              case 'gender':
                rowData.gender = value?.toLowerCase() || '';
                break;
              case 'marital status':
              case 'maritalstatus':
                rowData.maritalStatus = value?.toLowerCase() || '';
                break;
              case 'blood group':
              case 'bloodgroup':
              case 'blood type':
                rowData.bloodGroup = value || '';
                break;
              case 'emergency contact':
              case 'emergencycontact':
              case 'emergency number':
                rowData.emergencyContact = value || '';
                break;
              case 'address':
                rowData.address = value || '';
                break;
              case 'education':
                rowData.education = value || '';
                break;
              case 'experience':
                rowData.experience = value || '';
                break;
              case 'skills':
                rowData.skills = value || '';
                break;
              case 'salary':
                rowData.salary = value || '';
                break;
              case 'account number':
              case 'accountnumber':
              case 'bank account':
                rowData.bankDetails = {
                  ...rowData.bankDetails,
                  accountNumber: value || ''
                };
                break;
              case 'bank name':
              case 'bankname':
                rowData.bankDetails = {
                  ...rowData.bankDetails,
                  bankName: value || ''
                };
                break;
              case 'ifsc code':
              case 'ifsccode':
              case 'ifsc':
                rowData.bankDetails = {
                  ...rowData.bankDetails,
                  ifscCode: value || ''
                };
                break;
            }
          });
 
          // Ensure bankDetails is properly structured
          if (!rowData.bankDetails) {
            rowData.bankDetails = {
              accountNumber: '',
              bankName: '',
              ifscCode: ''
            };
          }
 
          // Log the mapped data for debugging
          console.log('Mapped Row Data:', rowData);
 
          return rowData;
        });
 
        resolve(mappedData);
      } catch (error) {
        console.error('Excel parsing error:', error);
        reject(new Error('Error parsing Excel file: ' + error.message));
      }
    };
 
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      reject(new Error('Error reading file: ' + error.message));
    };
 
    reader.readAsBinaryString(file);
  });
};
 
// Helper function to map role names to our system roles
const mapRole = (role) => {
  const roleMap = {
    'employee': 'employee',
    'team lead': 'manager',
    'manager': 'supermanager',
    'hr': 'hr',
    'human resources': 'hr',
    'team leader': 'manager',
    'super manager': 'supermanager',
    'teamlead': 'manager',
    'teamleader': 'manager',
    'supermanager': 'supermanager',
    'humanresources': 'hr'
  };
 
  const normalizedRole = role.toLowerCase().trim();
  return roleMap[normalizedRole] || 'employee';
};
 
// Helper function to format dates
const formatDate = (date) => {
  if (!date) return '';
 
  // If it's already a string in YYYY-MM-DD format, return as is
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }
 
  // If it's a Date object or Excel date number
  try {
    const d = new Date(date);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
  } catch (e) {
    console.error('Error formatting date:', e);
  }
 
  return '';
};