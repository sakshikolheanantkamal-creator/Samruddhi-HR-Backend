import { query } from '../config/db.js';

class Enquiry {
  static async create(enquiryData) {
    const {
      company_name, contact_person, mobile, email, industry_type,
      location, service_required, manpower_type, manpower_number, requirement_details
    } = enquiryData;

    const result = await query(
      `INSERT INTO enquiries (
        company_name, contact_person, mobile, email, industry_type,
        location, service_required, manpower_type, manpower_number, requirement_details
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [company_name, contact_person, mobile, email, industry_type,
       location, service_required, manpower_type, manpower_number, requirement_details]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM enquiries WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll(limit = null, offset = 0) {
    let queryText = 'SELECT * FROM enquiries ORDER BY created_at DESC';
    
    if (limit) {
      queryText += ` LIMIT ${limit} OFFSET ${offset}`;
    }

    const result = await query(queryText);
    return result.rows;
  }

  static async count() {
    const result = await query('SELECT COUNT(*) as count FROM enquiries');
    return parseInt(result.rows[0].count);
  }

  static async search(searchTerm) {
    const result = await query(
      `SELECT * FROM enquiries 
       WHERE 
        company_name ILIKE $1 OR
        contact_person ILIKE $1 OR
        email ILIKE $1 OR
        mobile ILIKE $1 OR
        service_required ILIKE $1
       ORDER BY created_at DESC`,
      [`%${searchTerm}%`]
    );

    return result.rows;
  }

  static async delete(id) {
    const result = await query('DELETE FROM enquiries WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async getRecent(limit = 10) {
    const result = await query(
      'SELECT * FROM enquiries ORDER BY created_at DESC LIMIT $1',
      [limit]
    );
    return result.rows;
  }
}

export default Enquiry;
