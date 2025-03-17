import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.NODE_ENV === 'production',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: `"USP Admissions" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Verify Your Email - OTP Code',
    text: `Your OTP is: ${otp}. It is valid for ${process.env.OTP_EXPIRATION_MINUTES} minutes.`,
    html: `<p>Your OTP is: <strong>${otp}</strong>. It is valid for ${process.env.OTP_EXPIRATION_MINUTES} minutes.</p>`,
  };
  await transporter.sendMail(mailOptions);
};
