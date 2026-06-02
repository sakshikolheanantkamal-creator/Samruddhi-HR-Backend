import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the backend directory more reliably
const envPath = path.resolve(__dirname, '../../.env');
console.log('📧 Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('📧 SMTP Config Check:');
console.log('- Host:', process.env.SMTP_HOST);
console.log('- User:', process.env.SMTP_USER);
console.log('- Pass:', process.env.SMTP_PASS ? 'SET (length: ' + process.env.SMTP_PASS.length + ')' : 'NOT SET');

if (!process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com') {
  console.warn('⚠️ WARNING: SMTP_USER is still using the placeholder value. Please update backend/.env');
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false // Helps with some network environments
  }
});

// Verify transporter connection
console.log('📧 Verifying SMTP connection...');
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP VERIFICATION FAILED:', error.message);
  } else {
    console.log('✅ SMTP Server is ready to take our messages');
  }
});

export async function sendContactEmail(submission) {
  const { name, email, phone, message } = submission;
  const fromEmail = process.env.SMTP_USER;

  const mailOptions = {
    from: `"Samruddhi HR Services" <${fromEmail}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #285e9c; border-bottom: 2px solid #285e9c; padding-bottom: 10px;">New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
          ${message}
        </div>
        <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">This email was sent from the Samruddhi HR Services contact form.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin Notification (Contact) sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending admin contact notification:', error.message);
    throw error;
  }
}

export async function sendEnquiryEmail(enquiry) {
  const {
    company_name,
    contact_person,
    mobile,
    email,
    industry_type,
    location,
    service_required,
    manpower_type,
    manpower_number,
    requirement_details,
  } = enquiry;
  const fromEmail = process.env.SMTP_USER;

  const mailOptions = {
    from: `"Samruddhi HR Services" <${fromEmail}>`,
    to: process.env.EMAIL_TO,
    replyTo: email,
    subject: `New Business Enquiry from ${company_name}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2 style="color: #285e9c; border-bottom: 2px solid #285e9c; padding-bottom: 10px;">New Business Enquiry</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Company:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${company_name}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Contact Person:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${contact_person}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${email}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Mobile:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${mobile}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Industry:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${industry_type || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Location:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${location || 'N/A'}</td></tr>
          <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${service_required || 'N/A'}</td></tr>
        </table>
        <p><strong>Requirement Details:</strong></p>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
          ${requirement_details}
        </div>
        <hr style="margin-top: 20px; border: 0; border-top: 1px solid #eee;">
        <p style="font-size: 12px; color: #666;">This email was sent from the Samruddhi HR Services enquiry form.</p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Admin Notification (Enquiry) sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Error sending admin enquiry notification:', error.message);
    throw error;
  }
}

export async function sendThankYouEmail(toEmail, userName, type = 'contact') {
  if (!toEmail || toEmail === 'your-email@gmail.com') {
    console.error('❌ Cannot send thank you email: recipient email is missing or placeholder');
    return;
  }

  // Small delay to avoid spam filters
  await new Promise(resolve => setTimeout(resolve, 2000));

  console.log(`📧 Attempting to send thank you email to: ${toEmail}`);
  
  const subject = type === 'contact' 
    ? 'Thank you for contacting Samruddhi HR Services' 
    : 'Thank you for your enquiry - Samruddhi HR Services';
  
  const welcomeMessage = type === 'contact'
    ? 'Thank you for reaching out to us. We have received your message and our team will get back to you shortly.'
    : 'Thank you for your business enquiry. We have received your requirements and one of our consultants will contact you soon to discuss how we can help.';

  const mailOptions = {
    from: `"Samruddhi HR Services" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 30px; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #285e9c; margin-bottom: 5px;">Hello ${userName},</h2>
          <div style="height: 2px; width: 50px; background: #285e9c; margin: 0 auto;"></div>
        </div>
        <p style="color: #333; font-size: 16px; line-height: 1.6;">${welcomeMessage}</p>
        <p style="color: #555; font-size: 14px;">In the meantime, feel free to visit our website to learn more about our services.</p>
        <div style="margin-top: 40px; border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="margin-bottom: 5px; font-weight: bold; color: #285e9c;">Samruddhi HR Services Team</p>
          <p style="font-size: 12px; color: #777; margin: 2px 0;">Nashik | Mumbai | Pune</p>
          <p style="font-size: 12px; color: #777; margin: 2px 0;">+91 8208021948 | info@samruddhihrservices.com</p>
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Thank You Email sent to %s: %s', toEmail, info.messageId);
    return info;
  } catch (error) {
    console.error(`❌ Error sending thank you email to ${toEmail}:`, error.message);
  }
}

export default transporter;
