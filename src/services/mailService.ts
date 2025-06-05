import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const otpTemplatePath = path.join(__dirname, '../templates/otp-template.html');
const subagentTemplatePath = path.join(__dirname, '../templates/subagent-verification-template.html');
const newApplicationAgentTemplatePath = path.join(__dirname, '../templates/new-application-agent-template.html');
const newApplicationAdminTemplatePath = path.join(__dirname, '../templates/new-application-admin-template.html');

let otpTemplate = fs.readFileSync(otpTemplatePath, 'utf-8');
let subagentTemplate = fs.readFileSync(subagentTemplatePath, 'utf-8');
let newApplicationAgentTemplate = fs.readFileSync(newApplicationAgentTemplatePath, 'utf-8');
let newApplicationAdminTemplate = fs.readFileSync(newApplicationAdminTemplatePath, 'utf-8');

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

export const sendNewApplicationEmailToAgent = async (
  agentName: string,
  agentEmail: string,
  applicationId: string,
  studentName: string,
  programProperties: {
    name: string;
    university: string;
    priority: number;
  }[],
) => {
  try {
    const programDetailsHtml = programProperties
      .sort((a, b) => a.priority - b.priority)
      .map((prop, index) => `
        <div style="margin-bottom: ${index < programProperties.length - 1 ? '20px' : '0'}; padding-bottom: ${index < programProperties.length - 1 ? '20px' : '0'}; border-bottom: ${index < programProperties.length - 1 ? '1px solid #e5e5e5' : 'none'};">
          <p style="color: #212121; font-size: 15px; margin: 8px 0;">
            <strong>Program ${index + 1}:</strong> ${prop.name}
          </p>
          <p style="color: #666; font-size: 14px; margin: 4px 0 0 20px;">
            University: ${prop.university}
          </p>
        </div>
      `).join('');

    const html = newApplicationAgentTemplate
      .replace(/{{AGENT_NAME}}/g, agentName)
      .replace(/{{APPLICATION_ID}}/g, applicationId)
      .replace(/{{STUDENT_NAME}}/g, studentName)
      .replace(/{{PROGRAM_DETAILS}}/g, programDetailsHtml);

    const mailOptions = {
      from: `"USP Admissions" <${process.env.SMTP_USER}>`,
      to: agentEmail,
      subject: 'New Application Submitted',
      html,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending new application email to agent:', error);
    throw error;
  }
};

export const sendNewApplicationEmailToAdmin = async (
  adminEmail: string,
  applicationId: string,
  agentName: string,
  studentName: string,
  programProperties: {
    name: string;
    university: string;
    priority: number;
  }[],
  companyName: string,
  agentEmail: string,
) => {
  try {
    const programDetailsHtml = programProperties
      .sort((a, b) => a.priority - b.priority)
      .map((prop, index) => `
        <div style="margin-bottom: ${index < programProperties.length - 1 ? '20px' : '0'}; padding-bottom: ${index < programProperties.length - 1 ? '20px' : '0'}; border-bottom: ${index < programProperties.length - 1 ? '1px solid #e5e5e5' : 'none'};">
          <p style="color: #212121; font-size: 15px; margin: 8px 0;">
            <strong>Program ${index + 1}:</strong> ${prop.name}
          </p>
          <p style="color: #666; font-size: 14px; margin: 4px 0 0 20px;">
            University: ${prop.university}
          </p>
        </div>
      `).join('');

    const html = newApplicationAdminTemplate
      .replace(/{{APPLICATION_ID}}/g, applicationId)
      .replace(/{{AGENT_NAME}}/g, agentName)
      .replace(/{{STUDENT_NAME}}/g, studentName)
      .replace(/{{PROGRAM_DETAILS}}/g, programDetailsHtml)
      .replace(/{{COMPANY_NAME}}/g, companyName)
      .replace(/{{AGENT_EMAIL}}/g, agentEmail);

    const mailOptions = {
      from: `"USP Admissions" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: 'New Application Received',
      html,
    };
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending new application email to admin:', error);
    throw error;
  }
};

export const sendSubagentVerificationEmail = async (
  name: string,
  email: string,
  level: string,
  verificationLink: string,
) => {
  const expiryHours = process.env.VERIFICATION_EXPIRY_HOURS || 24;
  const html = subagentTemplate
    .replace(/{{NAME}}/g, name)
    .replace(/{{LEVEL}}/g, level)
    .replace(/{{VERIFICATION_LINK}}/g, verificationLink)
    .replace(/{{EXPIRY_HOURS}}/g, expiryHours.toString());

  const mailOptions = {
    from: `"USP Admissions" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Complete Your USP Admissions Registration',
    html,
  };
  await transporter.sendMail(mailOptions);
};
