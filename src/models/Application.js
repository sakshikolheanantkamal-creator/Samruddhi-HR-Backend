import { query } from '../config/db.js';

class Application {
  static async create(applicationData) {
    const {
      full_name, mobile, email, location, experience,
      job_role, resume_path, message, status = 'Pending'
    } = applicationData;

    const result = await query(
      `INSERT INTO applications (
        full_name, mobile, email, location, experience,
        job_role, resume_path, message, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [full_name, mobile, email, location, experience,
       job_role, resume_path, message, status]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM applications WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll(limit = null, offset = 0) {
    let queryText = 'SELECT * FROM applications ORDER BY created_at DESC';
    
    if (limit) {
      queryText += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const result = await query(queryText);
    return result.rows;
  }

  static async count() {
    const result = await query('SELECT COUNT(*) as count FROM applications');
    return parseInt(result.rows[0].count);
  }

  static async findByStatus(status) {
    const result = await query(
      'SELECT * FROM applications WHERE status = $1 ORDER BY created_at DESC',
      [status]
    );
    return result.rows;
  }

  static async countByStatus(status) {
    const result = await query(
      'SELECT COUNT(*) as count FROM applications WHERE status = $1',
      [status]
    );
    return parseInt(result.rows[0].count);
  }

  static async updateStatus(id, status) {
    const result = await query(
      `UPDATE applications 
       SET status = $1
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  static async search(searchTerm) {
    const result = await query(
      `SELECT * FROM applications 
       WHERE 
        full_name ILIKE $1 OR
        email ILIKE $1 OR
        mobile ILIKE $1 OR
        job_role ILIKE $1 OR
        location ILIKE $1
       ORDER BY created_at DESC`,
      [`%${searchTerm}%`]
    );

    return result.rows;
  }

  static async delete(id) {
    const result = await query(
      'DELETE FROM applications WHERE id = $1 RETURNING id, resume_path',
      [id]
    );
    return result.rows[0];
  }

  static async getRecent(limit = 10) {
    const result = await query(
      'SELECT * FROM applications ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }

  static async findByJobRole(job_role) {
    const result = await query(
      'SELECT * FROM applications WHERE job_role = $1 ORDER BY created_at DESC',
      [job_role]
    );
    return result.rows;
  }

  static async getStatistics() {
    const result = await query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'Pending') as pending,
        COUNT(*) FILTER (WHERE status = 'Reviewed') as reviewed,
        COUNT(*) FILTER (WHERE status = 'Shortlisted') as shortlisted,
        COUNT(*) FILTER (WHERE status = 'Rejected') as rejected
      FROM applications
    `);

    return result.rows[0];
  }
}

export default Application;
