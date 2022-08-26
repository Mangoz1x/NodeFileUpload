const request = require('request');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

exports.testEmail = (mail) => {
    let email_regex =  /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    let result = email_regex.test(mail);

    return result;
}

exports.generatecode = function generatecode() {
    //Create array with letters and numbers 
    let code = ""

    //Get Random characters and generate token
    code += crypto.randomBytes(32).toString("hex");

    //Return the code 
    return code;
}

//Mail to user 
exports.mail = function mail(to, subject, message) {
    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: 'gmail',
        secure: true,
        auth: {
            user: 'stvmovyt@gmail.com',
            pass: 'oqmpspolhvcnqwnv'
        }
    });
    
    let mailOptions = {
        from: 'stvmovyt@gmail.com',
        to: to,
        subject: subject,
        html: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
