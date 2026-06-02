import { query } from '../config/db.js';

export async function getContactSubmissions(req, res) {
  try {
    const result = await query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    return res.json(result.rows);
  } catch (err) {
    console.error('Get contact submissions error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function createContactSubmission(req, res) {
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone) {
    return res.status(400).json({ message: 'Name, email, and phone are required.' });
  }

  try {
    const result = await query(
      `INSERT INTO contact_submissions (name, email, phone, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, message || '']
    );
    return res.status(201).json({ message: 'Contact submission received successfully.', submission: result.rows[0] });
  } catch (err) {
    console.error('Create contact submission error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function deleteContactSubmission(req, res) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM contact_submissions WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Contact submission not found.' });
    }
    return res.json({ message: 'Contact submission deleted successfully.', id });
  } catch (err) {
    console.error('Delete contact submission error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
