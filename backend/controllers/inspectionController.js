// backend/controllers/inspectionController.js
const pool = require('../config/db');
const path = require('path');
const fs   = require('fs');

const addInspection = async (req, res) => {
  const { property_id, inspection_date, inspection_type, condition_notes, overall_rating } = req.body;
  const user_id  = req.user?.user_id || 1;
  const photoPath = req.file ? `uploads/inspections/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      `INSERT INTO inspections
         (property_id, inspection_date, inspection_type, condition_notes, overall_rating, photo_path)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING *`,
      [property_id, inspection_date || null, inspection_type || 'Routine',
       condition_notes || null, overall_rating || null, photoPath]
    );
    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'CREATE','Inspection',$2,$3)`,
      [user_id, `Added ${inspection_type || 'Routine'} inspection for property #${property_id}`, req.ip]
    );
    res.status(201).json({ message: 'Inspection added successfully', inspection: result.rows[0] });
  } catch (err) {
    console.error('ADD INSPECTION ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

const getInspections = async (req, res) => {
  const user_id = req.user?.user_id || 1;
  try {
    const result = await pool.query(
      `SELECT i.*, p.address
       FROM inspections i
       JOIN properties p ON i.property_id = p.property_id
       WHERE p.user_id = $1
       ORDER BY i.inspection_date DESC NULLS LAST, i.created_at DESC`,
      [user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('GET INSPECTIONS ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

const updateInspection = async (req, res) => {
  const { id } = req.params;
  const { inspection_date, inspection_type, condition_notes, overall_rating } = req.body;
  const user_id = req.user?.user_id || 1;

  try {
    // If a new photo was uploaded, delete old one
    if (req.file) {
      const old = await pool.query('SELECT photo_path FROM inspections WHERE inspection_id=$1', [id]);
      if (old.rows[0]?.photo_path) {
        const fullPath = path.join(__dirname, '..', old.rows[0].photo_path);
        if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      }
    }

    const newPhotoPath = req.file ? `uploads/inspections/${req.file.filename}` : undefined;

    const result = await pool.query(
      `UPDATE inspections
       SET inspection_date  = $1,
           inspection_type  = $2,
           condition_notes  = $3,
           overall_rating   = $4
           ${newPhotoPath !== undefined ? ', photo_path = $6' : ''}
       WHERE inspection_id  = $5
       RETURNING *`,
      newPhotoPath !== undefined
        ? [inspection_date || null, inspection_type, condition_notes || null, overall_rating || null, id, newPhotoPath]
        : [inspection_date || null, inspection_type, condition_notes || null, overall_rating || null, id]
    );

    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'UPDATE','Inspection',$2,$3)`,
      [user_id, `Updated inspection #${id}`, req.ip]
    );

    res.json({ message: 'Inspection updated successfully', inspection: result.rows[0] });
  } catch (err) {
    console.error('UPDATE INSPECTION ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

const deleteInspection = async (req, res) => {
  const { id } = req.params;
  try {
    const old = await pool.query('SELECT photo_path FROM inspections WHERE inspection_id=$1', [id]);
    if (old.rows[0]?.photo_path) {
      const fullPath = path.join(__dirname, '..', old.rows[0].photo_path);
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    }
    await pool.query('DELETE FROM inspections WHERE inspection_id=$1', [id]);
    res.json({ message: 'Inspection deleted successfully' });
  } catch (err) {
    console.error('DELETE INSPECTION ERROR:', err);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addInspection, getInspections, updateInspection, deleteInspection };
