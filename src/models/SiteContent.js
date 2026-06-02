import { query } from '../config/db.js';

class SiteContent {
  static async upsert(key, value) {
    const result = await query(
      `INSERT INTO site_content (key, value, updated_at)
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (key) 
       DO UPDATE SET 
        value = $2::jsonb,
        updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, JSON.stringify(value)]
    );

    return result.rows[0];
  }

  static async findByKey(key) {
    const result = await query('SELECT * FROM site_content WHERE key = $1', [key]);
    return result.rows[0];
  }

  static async findAll() {
    const result = await query('SELECT * FROM site_content ORDER BY key');
    return result.rows;
  }

  static async findByKeys(keys) {
    const result = await query(
      'SELECT * FROM site_content WHERE key = ANY($1::text[])',
      [keys]
    );
    return result.rows;
  }

  static async delete(key) {
    const result = await query('DELETE FROM site_content WHERE key = $1 RETURNING key', [key]);
    return result.rows[0];
  }

  static async updateField(key, field, value) {
    const result = await query(
      `UPDATE site_content 
       SET 
        value = jsonb_set(value, $2, $3::jsonb),
        updated_at = CURRENT_TIMESTAMP
       WHERE key = $1
       RETURNING *`,
      [key, `{${field}}`, JSON.stringify(value)]
    );

    return result.rows[0];
  }

  static async getKeys() {
    const result = await query('SELECT key FROM site_content ORDER BY key');
    return result.rows.map(row => row.key);
  }

  static async exists(key) {
    const result = await query(
      'SELECT EXISTS(SELECT 1 FROM site_content WHERE key = $1)',
      [key]
    );
    return result.rows[0].exists;
  }

  static async bulkUpsert(contentArray) {
    const results = [];
    
    for (const { key, value } of contentArray) {
      const result = await query(
        `INSERT INTO site_content (key, value, updated_at)
         VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
         ON CONFLICT (key) 
         DO UPDATE SET 
          value = $2::jsonb,
          updated_at = CURRENT_TIMESTAMP
         RETURNING *`,
        [key, JSON.stringify(value)]
      );
      
      results.push(result.rows[0]);
    }
    
    return results;
  }
}

export default SiteContent;
