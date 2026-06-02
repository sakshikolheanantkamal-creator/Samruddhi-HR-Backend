import { query } from '../config/db.js';

class ContactContent {
  static async get() {
    const result = await query('SELECT * FROM contact_content ORDER BY id DESC LIMIT 1');
    return result.rows[0];
  }

  static async upsert(data) {
    const {
      page_title, page_subtitle, office_address, phone, email,
      working_hours, map_embed_url
    } = data;

    const existing = await query('SELECT id FROM contact_content LIMIT 1');
    
    if (existing.rows.length > 0) {
      const result = await query(
        `UPDATE contact_content SET
          page_title = COALESCE($1, page_title),
          page_subtitle = COALESCE($2, page_subtitle),
          office_address = COALESCE($3, office_address),
          phone = COALESCE($4, phone),
          email = COALESCE($5, email),
          working_hours = COALESCE($6, working_hours),
          map_embed_url = COALESCE($7, map_embed_url),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $8
        RETURNING *`,
        [page_title, page_subtitle, office_address, phone, email,
         working_hours, map_embed_url, existing.rows[0].id]
      );
      return result.rows[0];
    } else {
      const result = await query(
        `INSERT INTO contact_content (page_title, page_subtitle, office_address,
                                     phone, email, working_hours, map_embed_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [page_title, page_subtitle, office_address, phone, email, working_hours, map_embed_url]
      );
      return result.rows[0];
    }
  }
}

export default ContactContent;
