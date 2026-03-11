import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function sendPasswordResetEmail({ to, resetUrl }) {
  await transporter.sendMail({
    from: `"MatchIQ" <${process.env.GMAIL_USER}>`,
    to,
    subject: 'Recuperar contraseña — MatchIQ',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="color: #6B3FA0;">Recuperar contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña en MatchIQ.</p>
        <p>Haz click en el botón para continuar. El enlace expira en <strong>30 minutos</strong>.</p>
        <a href="${resetUrl}" style="
          display: inline-block;
          margin-top: 24px;
          padding: 12px 24px;
          background: #6B3FA0;
          color: white;
          text-decoration: none;
          border-radius: 8px;
          font-weight: bold;
        ">Restablecer contraseña</a>
        <p style="margin-top: 24px; color: #9E9E9E; font-size: 13px;">
          Si no solicitaste esto, ignora este correo. Tu contraseña no cambiará.
        </p>
      </div>
    `,
  });
}