import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import handlebars from 'handlebars';

dotenv.config();

const otpTemplatePath = path.join(__dirname, '../templates/otp-template.html');

const otpTemplate = fs.readFileSync(otpTemplatePath, 'utf-8');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.NODE_ENV === 'production',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (
  name: string,
  email: string,
  otp: string,
) => {
  const template = handlebars.compile(otpTemplate);
  const otpHtml = otp
    .split('')
    .map((char) => `<li>${char}</li>`)
    .join('');
  const html = template({
    name,
    otp_list: otpHtml,
    otp_expiry: process.env.OTP_EXPIRATION_MINUTES || 2,
  });

  const mailOptions = {
    from: `"USP Admissions" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - OTP Code',
    html,
  };
  await transporter.sendMail(mailOptions);
};
