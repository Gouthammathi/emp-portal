import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// API endpoint to update orgchart
app.post('/api/update-orgchart', (req, res) => {
  try {
    const { empId, employeeName, managerId, superManagerId } = req.body;

    // Validate required fields
    if (!empId || !employeeName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Read the current orgchart.json file
    const orgChartPath = path.join(__dirname, '..', 'data', 'orgchart.json');
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
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 