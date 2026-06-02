import { query } from '../config/db.js';
import { sendContactEmail, sendThankYouEmail } from '../config/email.js';

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
  console.log('--- NEW CONTACT SUBMISSION REQUEST ---');
  console.log('Body:', req.body);
  const { name, email, phone, message } = req.body;

  if (!name || !email || !phone) {
    console.warn('Missing required fields:', { name, email, phone });
    return res.status(400).json({ message: 'Name, email, and phone are required.' });
  }

  try {
    console.log('Inserting into DB...');
    const result = await query(
      `INSERT INTO contact_submissions (name, email, phone, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, message || '']
    );

    const submission = result.rows[0];
    console.log('Saved to DB with ID:', submission.id);

    // Send email notification via SMTP
    console.log('Starting email process...');
    try {
      console.log(`Processing emails for: ${email}`);
      await sendContactEmail(submission);
      console.log(`Contact notification email sent to Admin`);
      
      // Send thank you email to the user
      await sendThankYouEmail(email, name, 'contact');
      console.log(`Thank you email sent to user: ${email}`);
    } catch (emailErr) {
      console.error('❌ EMAIL SYSTEM ERROR:', emailErr);
    }

    return res.status(201).json({ message: 'Contact submission received successfully.', submission });
  } catch (err) {
    console.error('❌ DB ERROR:', err);
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
