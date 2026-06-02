import { query } from '../config/db.js';

export async function getEnquiries(req, res) {
  try {
    const result = await query('SELECT * FROM enquiries ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (err) {
    console.error('Get enquiries error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function createEnquiry(req, res) {
  const {
    companyName,
    contactPerson,
    mobile,
    email,
    industryType,
    location,
    serviceRequired,
    manpowerType,
    manpowerNumber,
    requirementDetails,
  } = req.body;

  if (!companyName || !contactPerson || !mobile || !email || !requirementDetails) {
    return res.status(400).json({ message: 'Required fields (companyName, contactPerson, mobile, email, requirementDetails) are missing.' });
  }

  try {
    const result = await query(
      `INSERT INTO enquiries 
      (company_name, contact_person, mobile, email, industry_type, location, service_required, manpower_type, manpower_number, requirement_details)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        companyName,
        contactPerson,
        mobile,
        email,
        industryType,
        location,
        serviceRequired,
        manpowerType,
        manpowerNumber,
        requirementDetails,
      ]
    );

    return res.status(201).json({
      message: 'Enquiry submitted successfully.',
      enquiry: result.rows[0],
    });
  } catch (err) {
    console.error('Create enquiry error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function deleteEnquiry(req, res) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM enquiries WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Enquiry not found.' });
    }
    return res.json({ message: 'Enquiry deleted successfully.', id });
  } catch (err) {
    console.error('Delete enquiry error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
