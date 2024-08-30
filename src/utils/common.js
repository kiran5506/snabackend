const crypto = require('crypto');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^(\+\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}$/;

function generateOTP(length = 4) {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
        otp += digits.charAt(crypto.randomInt(digits.length));
    }
    return otp;
}

const validateEmail = (email) => {
    return emailRegex.test(email);
};

const validatePhoneNumber = (phone) => {
    return phoneRegex.test(phone);
};

module.exports = {
    generateOTP,
    validateEmail, 
    validatePhoneNumber
};