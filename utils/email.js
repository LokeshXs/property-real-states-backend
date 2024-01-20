const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // 1.) create a transporter

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2.) Define the email options

  const mailOptions = {
    from: "Rental <lokesh11112001@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3.) Actually send the email

  const result = await transporter.sendMail(mailOptions);
  console.log(result);
};

module.exports = sendEmail;
