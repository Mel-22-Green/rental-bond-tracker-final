// backend/controllers/bondController.js
const pool = require('../config/db');

const addBond = async (req, res) => {
  const { property_id, amount, payment_date, reference_no, status } = req.body;
  const user_id = req.user?.user_id || 1;
  try {
    const result = await pool.query(
      `INSERT INTO bonds (property_id,amount,payment_date,reference_no,status)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [property_id, amount, payment_date || null, reference_no || null, status || 'Pending']
    );
    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'CREATE','Bond',$2,$3)`,
      [user_id, `Added bond for property #${property_id}`, req.ip]
    );
    res.status(201).json({ message: 'Bond added successfully', bond: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

const getBonds = async (req, res) => {
  const user_id = req.user?.user_id || 1;
  const { status } = req.query;
  try {
    let query = `SELECT b.*, p.address
                 FROM bonds b
                 JOIN properties p ON b.property_id = p.property_id
                 WHERE p.user_id = $1`;
    const params = [user_id];
    if (status && status !== 'All') { query += ` AND b.status = $2`; params.push(status); }
    query += ' ORDER BY b.created_at DESC NULLS LAST, b.payment_date DESC NULLS LAST';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

const updateBond = async (req, res) => {
  const { id } = req.params;
  const { amount, payment_date, reference_no, status, refund_amount, refund_date } = req.body;
  const user_id = req.user?.user_id || 1;
  try {
    const result = await pool.query(
      `UPDATE bonds
       SET amount=$1, payment_date=$2, reference_no=$3, status=$4,
           refund_amount=$5, refund_date=$6
       WHERE bond_id=$7 RETURNING *`,
      [amount, payment_date || null, reference_no || null, status,
       refund_amount || null, refund_date || null, id]
    );
    await pool.query(
      `INSERT INTO audit_logs (user_id,action_type,module,description,ip_address)
       VALUES ($1,'UPDATE','Bond',$2,$3)`,
      [user_id, `Updated bond #${id} — status: ${status}`, req.ip]
    );
    res.json({ message: 'Bond updated successfully', bond: result.rows[0] });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

const deleteBond = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM bonds WHERE bond_id=$1', [id]);
    res.json({ message: 'Bond deleted successfully' });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

module.exports = { addBond, getBonds, updateBond, deleteBond };
