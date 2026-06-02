import { query } from '../config/db.js';

class Job {
  static async create({ department_id, title }) {
    const result = await query(
      `INSERT INTO jobs (department_id, title)
       VALUES ($1, $2)
       RETURNING *`,
      [department_id, title]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(`
      SELECT j.*, d.title as department_title, d.icon, d.color
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      WHERE j.id = $1
    `, [id]);

    return result.rows[0];
  }

  static async findAll() {
    const result = await query(`
      SELECT j.*, d.title as department_title, d.icon, d.color
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      ORDER BY j.created_at DESC
    `);

    return result.rows;
  }

  static async findByDepartment(department_id) {
    const result = await query(`
      SELECT j.*, d.title as department_title, d.icon, d.color
      FROM jobs j
      LEFT JOIN departments d ON j.department_id = d.id
      WHERE j.department_id = $1
      ORDER BY j.created_at DESC
    `, [department_id]);

    return result.rows;
  }

  static async update(id, { department_id, title }) {
    const result = await query(
      `UPDATE jobs SET
        department_id = COALESCE($1, department_id),
        title = COALESCE($2, title)
      WHERE id = $3
      RETURNING *`,
      [department_id, title, id]
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async countByDepartment(department_id) {
    const result = await query(
      'SELECT COUNT(*) as count FROM jobs WHERE department_id = $1',
      [department_id]
    );
    return parseInt(result.rows[0].count);
  }
}

export default Job;
