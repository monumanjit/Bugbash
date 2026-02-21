import nodemailer from "nodemailer";
import twilio from "twilio";
import { env } from "../../config/env.js";
import { db } from "../../db/pool.js";

const emailTransporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: false,
  auth: env.smtpUser ? { user: env.smtpUser, pass: env.smtpPass } : undefined
});

const twilioClient = env.twilioSid && env.twilioToken ? twilio(env.twilioSid, env.twilioToken) : null;

export async function sendEmail(userId: string, to: string, subject: string, message: string) {
  if (!env.smtpHost) return;
  await emailTransporter.sendMail({ from: env.fromEmail, to, subject, text: message });
  await db.query(
    "INSERT INTO notification_log (user_id, type, message, status, sent_at) VALUES ($1,'Email',$2,'Sent',NOW())",
    [userId, message]
  );
}

export async function sendWhatsapp(userId: string, to: string, message: string) {
  if (!twilioClient || !env.twilioWhatsappFrom) return;
  await twilioClient.messages.create({ from: env.twilioWhatsappFrom, to, body: message });
  await db.query(
    "INSERT INTO notification_log (user_id, type, message, status, sent_at) VALUES ($1,'WhatsApp',$2,'Sent',NOW())",
    [userId, message]
  );
}
