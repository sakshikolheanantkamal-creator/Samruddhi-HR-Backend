import { query } from '../config/db.js';

class About {
  static async get() {
    const result = await query('SELECT * FROM about ORDER BY id DESC LIMIT 1');
    return result.rows[0];
  }

  static async upsert(data) {
    const { image_url, paragraphs, vision, missions, features } = data;

    const existing = await query('SELECT id FROM about LIMIT 1');
    
    if (existing.rows.length > 0) {
      const result = await query(
        `UPDATE about SET
          image_url = COALESCE($1, image_url),
          paragraphs = COALESCE($2::jsonb, paragraphs),
          vision = COALESCE($3, vision),
          missions = COALESCE($4::jsonb, missions),
          features = COALESCE($5::jsonb, features),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *`,
        [image_url,
         paragraphs ? JSON.stringify(paragraphs) : null,
         vision,
         missions ? JSON.stringify(missions) : null,
         features ? JSON.stringify(features) : null,
         existing.rows[0].id]
      );
      return result.rows[0];
    } else {
      const result = await query(
        `INSERT INTO about (image_url, paragraphs, vision, missions, features)
         VALUES ($1, $2::jsonb, $3, $4::jsonb, $5::jsonb)
         RETURNING *`,
        [image_url,
         JSON.stringify(paragraphs || []),
         vision,
         JSON.stringify(missions || []),
         JSON.stringify(features || [])]
      );
      return result.rows[0];
    }
  }
}

export default About;
