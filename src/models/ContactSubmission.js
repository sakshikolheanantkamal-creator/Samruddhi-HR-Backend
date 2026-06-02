import { query } from '../config/db.js';

class ContactSubmission {
  static async create({ name, email, phone, message }) {
    const result = await query(
      `INSERT INTO contact_submissions (name, email, phone, message)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, message]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM contact_submissions WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll(limit = null, offset = 0) {
    let queryText = 'SELECT * FROM contact_submissions ORDER BY created_at DESC';
    
    if (limit) {
      queryText += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const result = await query(queryText);
    return result.rows;
  }

  static async count() {
    const result = await query('SELECT COUNT(*) as count FROM contact_submissions');
    return parseInt(result.rows[0].count);
  }

  static async search(searchTerm) {
    const result = await query(
      `SELECT * FROM contact_submissions 
       WHERE 
        name ILIKE $1 OR
        email ILIKE $1 OR
        phone ILIKE $1 OR
        message ILIKE $1
       ORDER BY created_at DESC`,
      [`%${searchTerm}%`]
    );

    return result.rows;
  }

  static async delete(id) {
    const result = await query('DELETE FROM contact_submissions WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async getRecent(limit = 10) {
    const result = await query(
      'SELECT * FROM contact_submissions ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async findByDateRange(startDate, endDate) {
    const result = await query(
      `SELECT * FROM contact_submissions 
       WHERE created_at BETWEEN $1 AND $2
       ORDER BY created_at DESC`,
      [startDate, endDate]
    );

    return result.rows;
  }
}

export default ContactSubmission;
