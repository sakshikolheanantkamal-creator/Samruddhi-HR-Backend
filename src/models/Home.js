import { query } from '../config/db.js';

class Home {
  static async get() {
    const result = await query('SELECT * FROM home ORDER BY id DESC LIMIT 1');
    return result.rows[0];
  }

  static async upsert(data) {
    const {
      hero_badge, hero_title, hero_desc_1, hero_desc_2, hero_desc_3,
      highlights, whatsapp_number, stats_years, stats_clients, hero_image
    } = data;

    // Check if record exists
    const existing = await query('SELECT id FROM home LIMIT 1');
    
    if (existing.rows.length > 0) {
      // Update existing
      const result = await query(
        `UPDATE home SET
          hero_badge = COALESCE($1, hero_badge),
          hero_title = COALESCE($2, hero_title),
          hero_desc_1 = COALESCE($3, hero_desc_1),
          hero_desc_2 = COALESCE($4, hero_desc_2),
          hero_desc_3 = COALESCE($5, hero_desc_3),
          highlights = COALESCE($6::jsonb, highlights),
          whatsapp_number = COALESCE($7, whatsapp_number),
          stats_years = COALESCE($8, stats_years),
          stats_clients = COALESCE($9, stats_clients),
          hero_image = COALESCE($10, hero_image),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *`,
        [hero_badge, hero_title, hero_desc_1, hero_desc_2, hero_desc_3,
         highlights ? JSON.stringify(highlights) : null, whatsapp_number,
         stats_years, stats_clients, hero_image, existing.rows[0].id]
      );
      return result.rows[0];
    } else {
      // Insert new
      const result = await query(
        `INSERT INTO home (hero_badge, hero_title, hero_desc_1, hero_desc_2, hero_desc_3,
                          highlights, whatsapp_number, stats_years, stats_clients, hero_image)
         VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)
         RETURNING *`,
        [hero_badge, hero_title, hero_desc_1, hero_desc_2, hero_desc_3,
         JSON.stringify(highlights || []), whatsapp_number, stats_years, stats_clients, hero_image]
      );
      return result.rows[0];
    }
  }
}

export default Home;
