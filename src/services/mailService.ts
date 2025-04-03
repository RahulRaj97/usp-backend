import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const otpTemplatePath = path.join(__dirname, '../templates/otp-template.html');

let otpTemplate = fs.readFileSync(otpTemplatePath, 'utf-8');

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
  const otpHtml = otp
    .split('')
    .map(
      (char) =>
        `<span style="border-radius: 5px; border: 1px solid #3A4069; padding: 8px 12px; font-size: 18px; font-weight: 700; margin: 0 2px;">${char}</span>`,
    )
    .join('');
  const otpExpiry = process.env.OTP_EXPIRATION_MINUTES || 2;
  const html = otpTemplate
    .replace(/{{NAME}}/g, name)
    .replace(/{{OTP_LIST}}/g, otpHtml)
    .replace(/{{OTP_EXPIRY}}/g, otpExpiry.toString());
  const mailOptions = {
    from: `"USP Admissions" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - OTP Code',
    html,
  };
  await transporter.sendMail(mailOptions);
};
