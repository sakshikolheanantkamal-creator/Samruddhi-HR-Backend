import { query } from '../config/db.js';

class ManpowerService {
  static async create(data) {
    const { icon, title, description, features, color, display_order, image } = data;
    
    const result = await query(
      `INSERT INTO manpower_services (icon, title, description, features, color, display_order, image)
       VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
       RETURNING *`,
      [icon, title, description, JSON.stringify(features || []), color, display_order || 0, image]
    );
    
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query('SELECT * FROM manpower_services WHERE id = $1', [id]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query(
      'SELECT * FROM manpower_services WHERE is_active = true ORDER BY display_order, id'
    );
    return result.rows;
  }

  static async update(id, data) {
    const { icon, title, description, features, color, display_order, is_active, image } = data;
    
    const result = await query(
      `UPDATE manpower_services SET
        icon = COALESCE($1, icon),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        features = COALESCE($4::jsonb, features),
        color = COALESCE($5, color),
        display_order = COALESCE($6, display_order),
        is_active = COALESCE($7, is_active),
        image = COALESCE($8, image),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *`,
      [icon, title, description, features ? JSON.stringify(features) : null,
       color, display_order, is_active, image, id]
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM manpower_services WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }

  static async reorder(orderedIds) {
    for (let i = 0; i < orderedIds.length; i++) {
      await query(
        'UPDATE manpower_services SET display_order = $1 WHERE id = $2',
        [i, orderedIds[i]]
      );
    }
  }
}

export default ManpowerService;
