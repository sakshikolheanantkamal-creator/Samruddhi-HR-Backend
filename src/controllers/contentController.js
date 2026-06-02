import { query } from '../config/db.js';

export async function getContent(req, res) {
  const { key } = req.params;
  try {
    const result = await query('SELECT value FROM site_content WHERE key = $1', [key]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Content key '${key}' not found.` });
    }
    return res.json(result.rows[0].value);
  } catch (err) {
    console.error(`Get content error for key ${key}:`, err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function updateContent(req, res) {
  const { key } = req.params;
  const value = req.body;

  if (!value) {
    return res.status(400).json({ message: 'Content body is required.' });
  }

  try {
    const result = await query(
      `INSERT INTO site_content (key, value, updated_at) 
       VALUES ($1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (key) 
       DO UPDATE SET value = EXCLUDED.value, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [key, JSON.stringify(value)]
    );
    return res.json(result.rows[0].value);
  } catch (err) {
    console.error(`Update content error for key ${key}:`, err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function uploadImageFile(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Image file is required.' });
    }
    
    // Cloudinary automatically provides the secure URL
    const imageUrl = req.file.path; // This is the Cloudinary URL
    const cloudinaryId = req.file.filename; // Cloudinary public_id
    
    return res.json({ 
      imageUrl, 
      filename: cloudinaryId,
      cloudinaryUrl: req.file.path 
    });
  } catch (err) {
    console.error('Image upload controller error:', err);
    return res.status(500).json({ message: 'Internal server error during upload.' });
  }
}
