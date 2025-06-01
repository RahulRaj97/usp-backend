import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const otpTemplatePath = path.join(__dirname, '../templates/otp-template.html');
const subagentTemplatePath = path.join(__dirname, '../templates/subagent-verification-template.html');
const agentOwnerApplicationTemplatePath = path.join(__dirname, '../templates/application-submitted-agent-owner.html');
const superAdminApplicationTemplatePath = path.join(__dirname, '../templates/application-submitted-super-admin.html');

let otpTemplate = fs.readFileSync(otpTemplatePath, 'utf-8');
let subagentTemplate = fs.readFileSync(subagentTemplatePath, 'utf-8');
let agentOwnerApplicationTemplate = fs.readFileSync(agentOwnerApplicationTemplatePath, 'utf-8');
let superAdminApplicationTemplate = fs.readFileSync(superAdminApplicationTemplatePath, 'utf-8');

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

export const sendApplicationSubmittedToAgentAndOwnerEmail = async (
  agentName: string,
  recipientEmails: string[], // Could be agent's email + owner emails
  applicationId: string,
  submissionDate: string,
  studentName: string,
  programmesListHtml: string, // Pre-formatted HTML string for programmes
  // applicationLink?: string, // Optional
) => {
  if (!recipientEmails || recipientEmails.length === 0) {
    console.warn('No recipients for agent/owner application submission email.');
    return;
  }

  const html = agentOwnerApplicationTemplate
    .replace(/{{AGENT_NAME}}/g, agentName) // Or a generic greeting if sending to multiple owners
    .replace(/{{APPLICATION_ID}}/g, applicationId)
    .replace(/{{SUBMISSION_DATE}}/g, submissionDate)
    .replace(/{{STUDENT_NAME}}/g, studentName)
    .replace(/{{PROGRAMMES_LIST}}/g, programmesListHtml);
  // .replace(/{{APPLICATION_LINK}}/g, applicationLink || '#');

  const mailOptions = {
    from: `"USP Admissions" <${process.env.SMTP_USER}>`,
    to: recipientEmails.join(','), // Send to multiple recipients
    subject: `Application Submitted: ${applicationId} - ${studentName}`,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Application submission email sent to agent/owners: ${recipientEmails.join(',')}`);
  } catch (error) {
    console.error('Error sending application submission email to agent/owners:', error);
  }
};

export const sendApplicationSubmittedToSuperAdminEmail = async (
  superAdminEmails: string[],
  submittingAgentName: string,
  submittingAgentEmail: string,
  submittingCompanyName: string,
  applicationId: string,
  submissionDate: string,
  studentName: string,
  programmesListHtml: string,
  // applicationLinkAdmin?: string, // Optional
) => {
  if (!superAdminEmails || superAdminEmails.length === 0) {
    console.warn('No recipients for super admin application submission email.');
    return;
  }

  const html = superAdminApplicationTemplate
    .replace(/{{SUBMITTING_AGENT_NAME}}/g, submittingAgentName)
    .replace(/{{SUBMITTING_AGENT_EMAIL}}/g, submittingAgentEmail)
    .replace(/{{SUBMITTING_COMPANY_NAME}}/g, submittingCompanyName)
    .replace(/{{APPLICATION_ID}}/g, applicationId)
    .replace(/{{SUBMISSION_DATE}}/g, submissionDate)
    .replace(/{{STUDENT_NAME}}/g, studentName)
    .replace(/{{PROGRAMMES_LIST}}/g, programmesListHtml);
  // .replace(/{{APPLICATION_LINK_ADMIN}}/g, applicationLinkAdmin || '#');

  const mailOptions = {
    from: `"USP System Notification" <${process.env.SMTP_USER}>`, // Slightly different sender
    to: superAdminEmails.join(','),
    subject: `New Application Submitted by ${submittingCompanyName}: ${applicationId}`,
    html,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Application submission email sent to super admins: ${superAdminEmails.join(',')}`);
  } catch (error) {
    console.error('Error sending application submission email to super admins:', error);
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
