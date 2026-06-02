import { query } from '../config/db.js';

export async function getCareers(req, res) {
  try {
    const deptsResult = await query('SELECT * FROM departments ORDER BY id ASC');
    const jobsResult = await query('SELECT * FROM jobs ORDER BY id ASC');

    const careers = deptsResult.rows.map(dept => {
      const deptJobs = jobsResult.rows
        .filter(job => job.department_id === dept.id)
        .map(job => ({ id: job.id, title: job.title }));
      
      // Keep legacy format for frontend ('roles' as string array, and 'jobs' as objects for admin dashboard)
      return {
        ...dept,
        jobs: deptJobs,
        roles: deptJobs.map(job => job.title)
      };
    });

    return res.json(careers);
  } catch (err) {
    console.error('Get careers error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function createDepartment(req, res) {
  const { title, icon, color } = req.body;
  if (!title) {
    return res.status(400).json({ message: 'Department title is required.' });
  }

  try {
    const result = await query(
      'INSERT INTO departments (title, icon, color) VALUES ($1, $2, $3) RETURNING *',
      [title, icon || 'FaBriefcase', color || '#285e9c']
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create department error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function updateDepartment(req, res) {
  const { id } = req.params;
  const { title, icon, color } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Department title is required.' });
  }

  try {
    const result = await query(
      'UPDATE departments SET title = $1, icon = $2, color = $3 WHERE id = $4 RETURNING *',
      [title, icon, color, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Update department error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function deleteDepartment(req, res) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }
    return res.json({ message: 'Department deleted successfully.', id });
  } catch (err) {
    console.error('Delete department error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function createJob(req, res) {
  const { departmentId, title } = req.body;
  if (!departmentId || !title) {
    return res.status(400).json({ message: 'departmentId and title are required.' });
  }

  try {
    const deptCheck = await query('SELECT 1 FROM departments WHERE id = $1', [departmentId]);
    if (deptCheck.rowCount === 0) {
      return res.status(404).json({ message: 'Department not found.' });
    }

    const result = await query(
      'INSERT INTO jobs (department_id, title) VALUES ($1, $2) RETURNING *',
      [departmentId, title]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Create job error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function updateJob(req, res) {
  const { id } = req.params;
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ message: 'Job title is required.' });
  }

  try {
    const result = await query(
      'UPDATE jobs SET title = $1 WHERE id = $2 RETURNING *',
      [title, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Update job error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}

export async function deleteJob(req, res) {
  const { id } = req.params;
  try {
    const result = await query('DELETE FROM jobs WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Job not found.' });
    }
    return res.json({ message: 'Job deleted successfully.', id });
  } catch (err) {
    console.error('Delete job error:', err);
    return res.status(500).json({ message: 'Internal server error.' });
  }
}
