import { query } from '../config/db.js';

class Footer {
  static async get() {
    const result = await query('SELECT * FROM footer ORDER BY id DESC LIMIT 1');
    return result.rows[0];
  }

  static async upsert(data) {
    const {
      company_name, tagline, description, address, phone, email,
      social_links, quick_links, services_links, logo
    } = data;

    const existing = await query('SELECT id FROM footer LIMIT 1');
    
    if (existing.rows.length > 0) {
      const result = await query(
        `UPDATE footer SET
          company_name = COALESCE($1, company_name),
          tagline = COALESCE($2, tagline),
          description = COALESCE($3, description),
          address = COALESCE($4, address),
          phone = COALESCE($5, phone),
          email = COALESCE($6, email),
          social_links = COALESCE($7::jsonb, social_links),
          quick_links = COALESCE($8::jsonb, quick_links),
          services_links = COALESCE($9::jsonb, services_links),
          logo = COALESCE($10, logo),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $11
        RETURNING *`,
        [company_name, tagline, description, address, phone, email,
         social_links ? JSON.stringify(social_links) : null,
         quick_links ? JSON.stringify(quick_links) : null,
         services_links ? JSON.stringify(services_links) : null,
         logo,
         existing.rows[0].id]
      );
      return result.rows[0];
    } else {
      const result = await query(
        `INSERT INTO footer (company_name, tagline, description, address, phone, email,
                            social_links, quick_links, services_links, logo)
         VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10)
         RETURNING *`,
        [company_name, tagline, description, address, phone, email,
         JSON.stringify(social_links || {}),
         JSON.stringify(quick_links || []),
         JSON.stringify(services_links || []),
         logo]
      );
      return result.rows[0];
    }
  }
}

export default Footer;
