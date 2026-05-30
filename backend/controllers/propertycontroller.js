// backend/controllers/propertycontroller.js
const pool = require('../config/db');

const addProperty = async (req, res) => {
  const { address, landlord_name, landlord_phone, landlord_email,
          agent_name, agent_phone, lease_start, lease_end, is_current } = req.body;
  const user_id = req.user?.user_id || 1;
  try {
    const result = await pool.query(
      `INSERT INTO properties
         (user_id,address,landlord_name,landlord_phone,landlord_email,agent_name,agent_phone,lease_start,lease_end,is_current)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [user_id, address, landlord_name, landlord_phone || null, landlord_email || null,
       agent_name || null, agent_phone || null, lease_start || null, lease_end || null, is_current || false]
    );
    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'CREATE','Property',$2,$3)`,
      [user_id, `Added property: ${address}`, req.ip]
    );
    res.status(201).json({ message: 'Property added successfully', property: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

const getProperties = async (req, res) => {
  const user_id = req.user?.user_id || 1;
  const { search, is_current } = req.query;
  try {
    let query = 'SELECT * FROM properties WHERE user_id=$1';
    const params = [user_id];
    if (search) { query += ` AND address ILIKE $${params.length + 1}`; params.push(`%${search}%`); }
    if (is_current === 'true') { query += ` AND is_current=TRUE`; }
    query += ' ORDER BY is_current DESC, created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

const updateProperty = async (req, res) => {
  const { id } = req.params;
  const { address, landlord_name, landlord_phone, landlord_email,
          agent_name, agent_phone, lease_start, lease_end, is_current } = req.body;
  const user_id = req.user?.user_id || 1;
  try {
    const result = await pool.query(
      `UPDATE properties
       SET address=$1, landlord_name=$2, landlord_phone=$3, landlord_email=$4,
           agent_name=$5, agent_phone=$6, lease_start=$7, lease_end=$8, is_current=$9
       WHERE property_id=$10 RETURNING *`,
      [address, landlord_name, landlord_phone || null, landlord_email || null,
       agent_name || null, agent_phone || null, lease_start || null, lease_end || null,
       is_current || false, id]
    );
    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'UPDATE','Property',$2,$3)`,
      [user_id, `Updated property #${id}`, req.ip]
    );
    res.json({ message: 'Property updated successfully', property: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

const deleteProperty = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM properties WHERE property_id=$1', [id]);
    res.json({ message: 'Property deleted successfully' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

module.exports = { addProperty, getProperties, updateProperty, deleteProperty };
