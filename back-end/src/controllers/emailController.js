import { enviarEmail } from '../services/emailService.js';

export const testarEmail = async (req, res) => {
  try {
    await enviarEmail(
      process.env.EMAIL_USER,
      'Teste de envio - StockControl',
      `
        <h2>Olá!</h2>
        <p>Se você recebeu este e-mail, o sistema de envio está funcionando corretamente.</p>
        <h3>StockControl</h3>
      `
    );

    return res.status(200).json({
      message: 'E-mail enviado com sucesso!'
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Erro ao enviar e-mail.'
    });
  }
};