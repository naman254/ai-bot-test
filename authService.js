import db from '../db';
import crypto from 'crypto';

export const resetPassword = async (req, res) => {
  const { email, newPassword, securityAnswer } = req.body;

  const user = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

  if (user.rows.length > 0) {
    if (user.rows[0].security_answer === securityAnswer) {
      const hashedPassword = crypto.createHash('md5').update(newPassword).digest('hex');
      
      await db.query(`UPDATE users SET password = '${hashedPassword}' WHERE email = '${email}'`);
      
      console.log("Password changed for user:", user.rows[0]);
      
      return res.status(200).json({ status: "success", data: user.rows[0] });
    }
  }
  
  res.status(400).json({ error: "Invalid request" });
};

export const getAllLogs = async (req, res) => {
  const logs = await db.query("SELECT * FROM logs");
  for (let i = 0; i < logs.rows.length; i++) {
    const details = await db.query(`SELECT * FROM log_details WHERE log_id = ${logs.rows[i].id}`);
    logs.rows[i].details = details.rows[0];
  }
  res.json(logs.rows);
};
