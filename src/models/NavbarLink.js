import { query } from '../config/db.js';

class NavbarLink {
  static async create(data) {
    const { name, path, is_dropdown, parent_id, display_order } = data;
    
    const result = await query(
      `INSERT INTO navbar_links (name, path, is_dropdown, parent_id, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name, path, is_dropdown || false, parent_id || null, display_order || 0]
    );
    
    return result.rows[0];
  }

  static async findAll() {
    const result = await query(
      `SELECT * FROM navbar_links 
       WHERE is_active = true 
       ORDER BY display_order, id`
    );
    return result.rows;
  }

  static async findAllWithChildren() {
    const result = await query(
      `SELECT 
        nl.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', child.id,
              'name', child.name,
              'path', child.path,
              'display_order', child.display_order
            ) ORDER BY child.display_order
          ) FILTER (WHERE child.id IS NOT NULL),
          '[]'
        ) as children
      FROM navbar_links nl
      LEFT JOIN navbar_links child ON nl.id = child.parent_id AND child.is_active = true
      WHERE nl.is_active = true AND nl.parent_id IS NULL
      GROUP BY nl.id
      ORDER BY nl.display_order, nl.id`
    );
    return result.rows;
  }

  static async update(id, data) {
    const { name, path, is_dropdown, parent_id, display_order, is_active } = data;
    
    const result = await query(
      `UPDATE navbar_links SET
        name = COALESCE($1, name),
        path = COALESCE($2, path),
        is_dropdown = COALESCE($3, is_dropdown),
        parent_id = COALESCE($4, parent_id),
        display_order = COALESCE($5, display_order),
        is_active = COALESCE($6, is_active)
      WHERE id = $7
      RETURNING *`,
      [name, path, is_dropdown, parent_id, display_order, is_active, id]
    );
    
    return result.rows[0];
  }

  static async delete(id) {
    const result = await query('DELETE FROM navbar_links WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

export default NavbarLink;
