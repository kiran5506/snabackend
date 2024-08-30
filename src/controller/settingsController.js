const db = require('../config/db')

const updateSettings = async (req, res, next) => {
    const files = req.files;
    const { id } = req.params;
    const { title, description, email, phone_number, facebook_link, instagram_link, youtube_link, twitter_link, threads_link } = req.body;

    try {
        let header_logo_name = "";
        let footer_logo_name = "";

        const getSettingsQuery = "SELECT header_logo, footer_logo FROM site_settings WHERE setting_id = ?";
        const [settingsResult] = await db.promise().query(getSettingsQuery, [id]);

        if (settingsResult.length === 0) {
            return res.status(404).json({ status: 404, message: "Settings not found" });
        }
        const existingSettings = settingsResult[0];
        
        if (files) {
            header_logo_name = files.header_logo ? files.header_logo[0].filename : existingSettings.header_logo;
            footer_logo_name = files.footer_logo ? files.footer_logo[0].filename : existingSettings.footer_logo;
        } else {
            header_logo_name = existingSettings.header_logo;
            footer_logo_name = existingSettings.footer_logo;
        }

        const updateSettingsQuery = `UPDATE site_settings 
            SET title = ?, description = ?, email = ?, phone_number = ?, header_logo = ?, footer_logo = ?, facebook_link = ?, instagram_link = ?, youtube_link = ?, twitter_link = ?, threads_link = ? 
            WHERE setting_id = ?`;
        const values = [title, description, email, phone_number, header_logo_name, footer_logo_name, facebook_link, instagram_link, youtube_link, twitter_link, threads_link, id];

        await db.promise().query(updateSettingsQuery, values);
        
        res.status(200).json({ status: 200, message: "Settings Updated Successfully" });
    } catch (err) {
        console.error("Error updating settings:", err);
        res.status(500).send(`An error occurred: ${err.message}`);
    }
}

const getSettings = (req, res, next) => {
    const baseurl = `${req.protocol}://${req.get('host')}`;
    const {id} = req.params;
    try{
        const sqlQuery = "SELECT * FROM site_settings WHERE setting_id= ?";
        db.query(sqlQuery, id, (err, results) => {
            const resultData = results.map(record => ({
                ...record,
                header_logo: record.header_logo ? `${baseurl}/images/${record.header_logo}` : null,
                footer_logo: record.footer_logo ? `${baseurl}/images/${record.footer_logo}` : null,
            }));
            if (err) return res.status(500).json(err);
            res.status(200).json({status:200, message: "Settings data", data: resultData});
        })
    }catch(err){
        res.status(500).send(`An error occurred: ${err.message}`);
    }
}

module.exports = { updateSettings, getSettings}