const crypto = require('crypto');

function generateOTP(length = 4) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits.charAt(crypto.randomInt(digits.length));
    }
    return otp;
}

module.exports = {
    generateOTP,
};