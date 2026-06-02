import { query } from '../config/db.js';

export async function getApplications(req, res) {
  try {
    const result = await query('SELECT * FROM applications ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (err) {
    console.error('Get applications error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function createApplication(req, res) {
  const {
    fullName,
    mobile,
    email,
    location,
    experience,
    jobRole,
    message,
  } = req.body;

  if (!fullName || !mobile || !email || !location || !experience || !jobRole) {
    return res.status(400).json({ message: 'Required fields (fullName, mobile, email, location, experience, jobRole) are missing.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Resume file is required.' });
  }

  try {
    const resumePath = req.file.path.replace(/\\/g, '/'); // Normalize path for web URLs

    const result = await query(
      `INSERT INTO applications 
      (full_name, mobile, email, location, experience, job_role, resume_path, message, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        fullName,
        mobile,
        email,
        location,
        experience,
        jobRole,
        resumePath,
        message || '',
        'Pending',
      ]
    );

    return res.status(201).json({
      message: 'Application submitted successfully.',
      application: result.rows[0],
    });
  } catch (err) {
    console.error('Create application error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function updateApplicationStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: 'Status is required.' });
  }

  try {
    const result = await query(
      'UPDATE applications SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Update application status error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function deleteApplication(req, res) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM applications WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Application not found.' });
    }
    return res.json({ message: 'Application deleted successfully.', id });
  } catch (err) {
    console.error('Delete application error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
