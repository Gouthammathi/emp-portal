import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { empId, employeeName, managerId, superManagerId } = req.body;

    // Validate required fields
    if (!empId || !employeeName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Read the current orgchart.json file
    const orgChartPath = path.join(process.cwd(), 'src', 'data', 'orgchart.json');
    const orgChartData = JSON.parse(fs.readFileSync(orgChartPath, 'utf8'));

    // Add new employee to the organizationChart array
    orgChartData.organizationChart.push({
      empId,
      employeeName,
      managerId: managerId || null,
      SupermanagerId: superManagerId || null
    });

    // Write back to the file
    fs.writeFileSync(orgChartPath, JSON.stringify(orgChartData, null, 2));

    return res.status(200).json({ message: 'Organization chart updated successfully' });
  } catch (error) {
    console.error('Error updating orgchart:', error);
    return res.status(500).json({ message: 'Failed to update organization chart' });
  }
} 