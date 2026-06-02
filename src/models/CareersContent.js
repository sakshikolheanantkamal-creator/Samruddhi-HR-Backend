import { query } from '../config/db.js';

class CareersContent {
  static async get() {
    const result = await query('SELECT * FROM careers_content ORDER BY id DESC LIMIT 1');
    return result.rows[0];
  }

  static async upsert(data) {
    const existing = await query('SELECT id FROM careers_content LIMIT 1');
    
    const fields = [
      'hero_badge', 'hero_heading_line_1', 'hero_heading_line_2', 'hero_paragraphs',
      'hero_button_1_text', 'hero_button_1_link', 'hero_button_2_text', 'hero_button_2_link',
      'hero_image_url', 'why_title', 'why_subtitle', 'why_benefits',
      'opportunities_title', 'opportunities_subtitle',
      'eligibility_left_title', 'eligibility_right_title',
      'eligibility_can_apply', 'eligibility_looking_for',
      'contact_heading', 'contact_subtitle', 'contact_intro',
      'contact_email', 'contact_whatsapp',
      'contact_email_button', 'contact_whatsapp_button',
      'commitment_title', 'commitment_description', 'commitment_commitments'
    ];

    const values = fields.map(field => {
      const value = data[field];
      if (value === undefined) return null;
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    });

    if (existing.rows.length > 0) {
      const setClause = fields.map((field, i) => {
        const jsonbFields = ['hero_paragraphs', 'why_benefits', 'eligibility_can_apply', 
                             'eligibility_looking_for', 'commitment_commitments'];
        const suffix = jsonbFields.includes(field) ? '::jsonb' : '';
        return `${field} = COALESCE($${i + 1}${suffix}, ${field})`;
      }).join(', ');

      const result = await query(
        `UPDATE careers_content SET ${setClause}, updated_at = CURRENT_TIMESTAMP
         WHERE id = $${fields.length + 1} RETURNING *`,
        [...values, existing.rows[0].id]
      );
      return result.rows[0];
    } else {
      const placeholders = fields.map((field, i) => {
        const jsonbFields = ['hero_paragraphs', 'why_benefits', 'eligibility_can_apply',
                             'eligibility_looking_for', 'commitment_commitments'];
        return jsonbFields.includes(field) ? `$${i + 1}::jsonb` : `$${i + 1}`;
      }).join(', ');

      const result = await query(
        `INSERT INTO careers_content (${fields.join(', ')})
         VALUES (${placeholders}) RETURNING *`,
        values
      );
      return result.rows[0];
    }
  }
}

export default CareersContent;
