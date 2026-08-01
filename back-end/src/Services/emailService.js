import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const enviarEmail = async (destinatario, assunto, mensagem) => {
  try {
    await transporter.sendMail({
      from: `"StockControl" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: assunto,
      html: mensagem,
    });

    console.log('✅ E-mail enviado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    throw error;
  }
};