const db = require('../config/db');
const bcrypt = require('bcrypt');

const userGetById = async (req, res, next) => {
    const userId = req.params.id;
    const sql = 'SELECT * FROM users WHERE user_id = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        users = results[0];
        delete users.password;
        res.json({"status": 200, "data": users, "message": "Success"});
    });
}

const updateUser = async (req, res, next) => {
    const user_id = req.params.id;
    const { first_name, middle_name, last_name, email } = req.body;

    if(!first_name || !middle_name || !last_name || !email){
        return res.status(400).json({ message: 'Required fields are missing' });
    }

    const updateQuery = `UPDATE users 
        SET first_name = ?, middle_name = ?, last_name = ?, email = ?
        WHERE user_id = ?`;
    const values = [first_name, middle_name, last_name, email, user_id];
    db.query(updateQuery, values, (err, results) => {
        if (err) return res.status(500).json(err);

        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found or no changes made' });
        }

        res.json({ status: 200, message: 'User updated successfully' });
    })
}

const changePassword = async (req, res) =>{
    const user_id = req.user.userId;
    const { current_password, new_password  } = req.body;

    if(!current_password || !new_password ){
        return res.status(400).json({ message: 'Required fields are missing' });
    }
    try{
        const sql = 'SELECT password FROM users WHERE user_id = ?';
        db.query(sql, [user_id], async (err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length === 0) return res.status(404).json({ message: 'User not found' });

            const user = results[0];
            const match = await bcrypt.compare(current_password, user.password);
            if (!match) return res.status(401).json({ message: 'Current password is incorrect' });

            const hashedNewPassword = await bcrypt.hash(new_password, 10);
            const updateSql = 'UPDATE users SET password = ? WHERE user_id = ?';
            
            db.query(updateSql, [hashedNewPassword, user_id], (err, results) => {
                if (err) return res.status(500).json(err);
                res.json({ message: 'Password changed successfully' });
            });

        })
    }catch(err){
        res.status(500).json({ message: 'Error processing request' });
    }

}

module.exports = { userGetById, updateUser, changePassword }