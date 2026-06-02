import { query } from '../config/db.js';

export async function getServices(req, res) {
  try {
    const result = await query('SELECT * FROM services ORDER BY title ASC');
    return res.json(result.rows);
  } catch (err) {
    console.error('Get services error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function getServiceBySlug(req, res) {
  const { slug } = req.params;
  try {
    const result = await query('SELECT * FROM services WHERE slug = $1', [slug]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Get service by slug error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function createService(req, res) {
  const {
    slug,
    title,
    tagline,
    hero_image,
    other_image,
    overview,
    what_we_do,
    who_is_for,
    key_benefits,
    cta,
    button_name,
    link,
  } = req.body;

  if (!slug || !title) {
    return res.status(400).json({ message: 'Slug and title are required.' });
  }

  try {
    // Check if slug is unique
    const duplicateCheck = await query('SELECT 1 FROM services WHERE slug = $1', [slug]);
    if (duplicateCheck.rowCount > 0) {
      return res.status(400).json({ message: 'A service with this slug already exists.' });
    }

    const whatWeDoJson = JSON.stringify(what_we_do || []);
    const whoIsForJson = JSON.stringify(who_is_for || []);
    const keyBenefitsJson = JSON.stringify(key_benefits || []);

    const result = await query(
      `INSERT INTO services 
      (slug, title, tagline, hero_image, other_image, overview, what_we_do, who_is_for, key_benefits, cta, button_name, link)
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9::jsonb, $10, $11, $12)
      RETURNING *`,
      [
        slug.toLowerCase().trim().replace(/\s+/g, '-'),
        title,
        tagline,
        hero_image,
        other_image,
        overview,
        whatWeDoJson,
        whoIsForJson,
        keyBenefitsJson,
        cta,
        button_name || 'Contact Us',
        link || '/enquiry',
      ]
    );

    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create service error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function updateService(req, res) {
  const { id } = req.params;
  const {
    slug,
    title,
    tagline,
    hero_image,
    other_image,
    overview,
    what_we_do,
    who_is_for,
    key_benefits,
    cta,
    button_name,
    link,
  } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Title is required.' });
  }

  try {
    const serviceCheck = await query('SELECT * FROM services WHERE id = $1', [id]);
    if (serviceCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    // Check slug uniqueness if it's changing
    if (slug && slug !== serviceCheck.rows[0].slug) {
      const duplicateCheck = await query('SELECT 1 FROM services WHERE slug = $1 AND id <> $2', [slug, id]);
      if (duplicateCheck.rowCount > 0) {
        return res.status(400).json({ message: 'A service with this slug already exists.' });
      }
    }

    const updatedSlug = slug ? slug.toLowerCase().trim().replace(/\s+/g, '-') : serviceCheck.rows[0].slug;
    const whatWeDoJson = JSON.stringify(what_we_do || []);
    const whoIsForJson = JSON.stringify(who_is_for || []);
    const keyBenefitsJson = JSON.stringify(key_benefits || []);

    const result = await query(
      `UPDATE services 
      SET slug = $1, title = $2, tagline = $3, hero_image = $4, other_image = $5, 
          overview = $6, what_we_do = $7::jsonb, who_is_for = $8::jsonb, 
          key_benefits = $9::jsonb, cta = $10, button_name = $11, link = $12, updated_at = CURRENT_TIMESTAMP
      WHERE id = $13
      RETURNING *`,
      [
        updatedSlug,
        title,
        tagline,
        hero_image,
        other_image,
        overview,
        whatWeDoJson,
        whoIsForJson,
        keyBenefitsJson,
        cta,
        button_name,
        link,
        id,
      ]
    );

    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Update service error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function deleteService(req, res) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM services WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }
    return res.json({ message: 'Service deleted successfully.', id });
  } catch (err) {
    console.error('Delete service error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
