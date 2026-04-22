const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  }
});

async function sendFireAlertEmail(binId) {
  await transporter.sendMail({
    from: process.env.EMAIL,
    to: process.env.EMAIL,
    subject: '🔥 Fire Alert',
    text: `Fire detected in bin ${binId}`
  });
}

module.exports = sendFireAlertEmail;