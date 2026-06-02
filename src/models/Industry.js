import { query } from '../config/db.js';

class Industry {
  static async create(data) {
    const { icon, title, description, color, display_order, image } = data;
    
    const result = await query(
      `INSERT INTO industries (icon, title, description, color, display_order, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [icon, title, description, color, display_order || 0, image]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM industries WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query(
      'SELECT * FROM industries WHERE is_active = true ORDER BY display_order, id'
    );
    return result.rows;
  }

  static async update(id, data) {
    const { icon, title, description, color, display_order, is_active, image } = data;
    
    const result = await query(
      `UPDATE industries SET
        icon = COALESCE($1, icon),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        color = COALESCE($4, color),
        display_order = COALESCE($5, display_order),
        is_active = COALESCE($6, is_active),
        image = COALESCE($7, image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *`,
      [icon, title, description, color, display_order, is_active, image, id]
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM industries WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async reorder(orderedIds) {
    for (let i = 0; i < orderedIds.length; i++) {
      await query(
        'UPDATE industries SET display_order = $1 WHERE id = $2',
        [i, orderedIds[i]]
      );
    }
  }
}

export default Industry;
