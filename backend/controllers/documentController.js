// backend/controllers/documentController.js
const pool = require('../config/db');
const path = require('path');
const fs   = require('fs');

const uploadDocument = async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const { title, document_type } = req.body;
  const user_id   = req.user?.user_id || 1;
  const file_path = `uploads/documents/${req.file.filename}`;
  const file_size = req.file.size;

  try {
    const r = await pool.query(
      `INSERT INTO documents (user_id, title, document_type, file_path, file_size)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [user_id, title || req.file.originalname, document_type || 'Other', file_path, file_size]
    );
    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'CREATE','Document',$2,$3)`,
      [user_id, `Uploaded document: ${title || req.file.originalname}`, req.ip]
    );
    res.status(201).json({ message: 'Document uploaded successfully', document: r.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

const getDocuments = async (req, res) => {
  const user_id = req.user?.user_id || 1;
  try {
    const r = await pool.query(
      'SELECT * FROM documents WHERE user_id=$1 ORDER BY uploaded_at DESC NULLS LAST, created_at DESC',
      [user_id]
    );
    res.json(r.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

const deleteDocument = async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query('SELECT file_path FROM documents WHERE document_id=$1', [id]);
    if (r.rows[0]?.file_path) {
      const fp = path.join(__dirname, '..', r.rows[0].file_path);
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    }
    await pool.query('DELETE FROM documents WHERE document_id=$1', [id]);
    res.json({ message: 'Document deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

module.exports = { uploadDocument, getDocuments, deleteDocument };