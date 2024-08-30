const db = require('../config/db');

const createPolicy = async (req, res, next) => {
    console.log('request-->',req.body);
    console.log('file-->',req.file);
    const { title, description, type } = req.body;
    
    const image = req.file ? req.file.filename : null;

    if (!title || !description || !type) {
        return res.status(400).json({status: 400, message: 'Required fields are missing' });
    }

    try{
        var datetime = new Date();
        const sqlQuery = "INSERT INTO snab_common(common_type, title, description, profile,  created_at) VALUES (?,?,?,?,?)";
        const values = [type, title, description, image, datetime];
        db.query(sqlQuery, values, (err, results) => {
            if (err) return res.status(500).json(err);
            res.status(201).json({status:200, message: "Created Successfully", 
                id: results.insertId });
        })
    }catch(err){
        res.status(500).send(`An error occurred: ${err.message}`);
    }
}

const updatePolicy = async (req, res, next) =>{
    const { id } = req.params;
    const { title, description, type } = req.body;
    const image = req.file ? req.file.filename : null;

    try{
        const query = 'UPDATE snab_common SET title = ?, description = ?, profile = ? WHERE id = ?';
       
        const values = [type, description, image, id];
        db.query(query, values, (err, results) => {
            if (err) return res.status(500).json(err);
            console.log(results);
            if (results.affectedRows === 0) {
                return res.status(404).send('Resource not found.');
            }
            res.json({status:200, message: "Updated Successfully"});
        })
    }catch(err){
        res.status(500).send(`An error occurred: ${err.message}`);
    }
}

const getPolicy = async (req, res) => {
    const baseurl = `${req.protocol}://${req.get('host')}`;
    const { type } = req.body;
    
    try {
        const results = {};
        const types = await new Promise((resolve, reject) => {
            db.query('SELECT * FROM common_types', (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        });
        await Promise.all(types.map(async (type) => {
            const sqlQuery = 'SELECT * FROM snab_common WHERE common_type_id = ?';
            const records = await new Promise((resolve, reject) => {
                db.query(sqlQuery, type.common_id, (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                });
            });

            const resultData = records.map(record => ({
                ...record,
                profile: record.profile ? `${baseurl}/images/${record.profile}` : null
            }));

            results[type.type_name] = resultData;
        }));

        // Send the results as the response
        res.json(results);
    } catch (err) {
        res.status(500).send(`An error occurred: ${err.message}`);
    }
};

const getPolicyById = async(req, res) => {
    const { id } = req.params;
    try{
        const sqlQuery = "SELECT * FROM snab_common WHERE id = ?";
        console.log('params',sqlQuery);
        db.query(sqlQuery, id, (err, resutls) => {
            if(err) return send(500).json(err);
            const resultData = resutls.map( result => ({
                ...result,
                profile: result.profile ? `${req.protocol}://${req.get('host')}/images/${result.profile}` : null
            }))
            res.json({status:200, message: "Success", data: resultData[0]})
        })
    }catch(err){
        res.status(500).send(`An error occurred: ${err.message}`);
    }
}



module.exports = { createPolicy, updatePolicy, getPolicy, getPolicyById }