// services/emailService.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Crea un transporte SMTP. Ejemplo con Gmail, 
 * pero podrías usar otro servicio (SendGrid, Mailgun, Amazon SES, etc.)
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // tu_correo@gmail.com
      pass: process.env.EMAIL_PASS  // contraseña de aplicación (16 caracteres)
    }
  });

/**
 * Envía un email con los datos proporcionados.
 * @param {Object} mailData 
 * @param {string} mailData.to - Destinatario
 * @param {string} mailData.subject - Asunto del correo
 * @param {string} mailData.text - Texto plano del correo
 * @param {string} mailData.html - HTML del correo (opcional)
 */
export async function sendEmail({ to, subject, text, html }) {
  // Si no defines `text`, pero tienes `html`, Nodemailer extrae automáticamente algo de texto.
  // Ajusta según necesites.
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html
  };

  // Enviamos el correo
  const info = await transporter.sendMail(mailOptions);
  console.log('Correo enviado =>', info.messageId);

  return info;
}
