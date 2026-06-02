import { query } from '../config/db.js';

class Department {
  static async create({ title, icon, color }) {
    const result = await query(
      `INSERT INTO departments (title, icon, color)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title, icon, color]
    );

    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM departments WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findByTitle(title) {
    const result = await query('SELECT * FROM departments WHERE title = $1', [title]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM departments ORDER BY created_at DESC');
    return result.rows;
  }

  static async findAllWithJobs() {
    const result = await query(`
      SELECT 
        d.id,
        d.title,
        d.icon,
        d.color,
        d.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', j.id,
              'title', j.title,
              'created_at', j.created_at
            ) ORDER BY j.created_at DESC
          ) FILTER (WHERE j.id IS NOT NULL),
          '[]'
        ) as jobs
      FROM departments d
      LEFT JOIN jobs j ON d.id = j.department_id
      GROUP BY d.id
      ORDER BY d.created_at DESC
    `);

    return result.rows;
  }

  static async update(id, { title, icon, color }) {
    const result = await query(
      `UPDATE departments SET
        title = COALESCE($1, title),
        icon = COALESCE($2, icon),
        color = COALESCE($3, color)
      WHERE id = $4
      RETURNING *`,
      [title, icon, color, id]
    );

    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default Department;
