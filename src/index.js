const express = require('express');
const dotenv = require("dotenv").config();
const bodyParser = require('body-parser');
const db = require('./config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {generateOTP} = require('./utils/common');
const authenticateJWT = require('./middleware/authToken')

const app = express();
const PORT = process.env.PORT || 3000;
//app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/images", express.static('src/uploads'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to filename to avoid conflicts
    }
});

const upload = multer({ storage: storage });

const userRoutes = require('./routes/userRoutes');
const policyRoutes = require('./routes/policyRoutes');
const contactRouters = require('./routes/contactRouters');
const settingsRouters = require('./routes/settingsRouters');

/** User Register */
app.post('/register', async (req, res, next) => {
    const { role_id, first_name, middle_name, last_name, email, mobile_number, device_token, device_type, profile, last_login, status, password, gender, referral_code } = req.body;

    if (!role_id || !first_name || !last_name || !email || !mobile_number) {
        return res.status(400).json({status: 400, message: 'Required fields are missing' });
    }
    var datetime = new Date();
    try{

        const sql = "SELECT user_id, mobile_number FROM `users` WHERE mobile_number = ?";
        db.query(sql, [mobile_number], async(err, results) => {
            if (err) return res.status(500).json(err);
            if (results.length > 0) return res.status(404).json({ status:400, message: 'Enter mobile number existed' });
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const sqlQuery = 'INSERT INTO users (role_id, first_name, middle_name, last_name, email, mobile_number, device_token, device_type, profile, last_login, status, password, created_at, gender, referral_code ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
            const values = [role_id, first_name, middle_name, last_name, email, mobile_number, device_token, device_type, profile, last_login, status, hashedPassword, datetime, gender, referral_code];

            db.query(sqlQuery, values, (err, results) => {
                if (err) return res.status(500).json(err);
                //Genarate OTP and update
                const otp = generateOTP();
                console.log('otp-->', otp);
                const sqlQuery2 = 'UPDATE users SET  otp = ? WHERE user_id = ?';
                db.query(sqlQuery2, [otp, results.insertId], async(err, results) => {
                    if (err) return res.status(500).json(err);
                })
                res.status(201).json({ id: results.insertId, message: "OTP sent to registered mobile number please verify" });
            })
        })
    }catch(err){
        res.status(500).json({message: 'Error comparing password'});
    }
    
})

/** User Login */
app.post('/login', (req, res, next) => {
    const { mobile_number } = req.body;
    const sqlQuery = 'SELECT user_id, mobile_number FROM users WHERE mobile_number = ?';
    db.query(sqlQuery, [mobile_number], async(err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = results[0];
        try{
            const otp = generateOTP();
            const sqlQuery2 = 'UPDATE users SET  otp = ? WHERE user_id = ?';
            db.query(sqlQuery2, [otp, user.user_id], async(err, results) => {
                if (err) return res.status(500).json(err);
            })
            res.status(201).json({ id: user.user_id, message: "OTP sent to mobile number please verify", "OTP": otp });
            /*const match = await bcrypt.compare(password, user.password);
            if (!match) return res.status(401).json({ message: 'Invalid credentials' });

            const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            delete user.password;
            user.token = token;
            res.json({ user });*/
        }catch(err){
            res.status(500).json({message: 'Error comparing password'});
        }
    })
})

/** Verify OTP */
app.post('/verify-otp', async (req, res, next) => {
    const { otp, user_id } = req.body;
    const sqlQuery = 'SELECT user_id, role_id, first_name, middle_name, last_name, email, mobile_number, device_type, profile, status, otp FROM users WHERE user_id = ?';
    db.query(sqlQuery, [user_id], async (err, results) => {
        if (err) return res.status(500).json(err);
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });
        const user = results[0];
        if(otp === user.otp){
            const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            delete user.otp;
            user.token = token;
            res.json({ status:200, message: 'Success', data: user });
        }else{
            res.status(404).json({ status:400, message: 'Invalid OTP entered' });
        }
    })
})


/** User Logout */
app.post('/logout', authenticateJWT, (req, res) => {
    const token = req.header('Authorization').split(' ')[1];
    const sql = 'INSERT INTO token_blacklist (token) VALUES (?)';

    db.query(sql, [token], (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json({ message: 'Logout successful' });
    })
})

// Users
app.use('/api/users', authenticateJWT, userRoutes);
app.use('/api/common', upload.single('image'), policyRoutes);
app.use('/api/contactus', contactRouters);
app.use('/api/settings', upload.fields([
    { name: 'header_logo', maxCount: 1 },
    { name: 'footer_logo', maxCount: 1 }
]), settingsRouters);

app.listen(PORT, () => {
    console.log(`Surver running on port ${PORT}`)
})

