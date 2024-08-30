const db = require('../config/db')

const createContact = async (req, res, next) => { 
    const { name, email, phone, description } = req.body;
    
    if (!name || !email || !phone || !description) {
        return res.status(400).json({status: 400, message: 'Required fields are missing' });
    }

    try{
        var datetime = new Date();
        const sqlQuery = "INSERT INTO contact_us(name, email, phone, description) VALUES (?,?,?,?)";
        const values = [name, email, phone, description];
        db.query(sqlQuery, values, (err, results) => {
            if (err) return res.status(500).json(err);
            res.status(201).json({status:200, message: "Contact Created Successfully", 
                id: results.insertId });
        })
    }catch(err){
        res.status(500).send(`An error occurred: ${err.message}`);
    }
}

module.exports = {createContact}