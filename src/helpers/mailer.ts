import nodemailer from "nodemailer";

export const sendMail = async (sendToInfo) => {
    const transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        }
    });

    const info = await transporter.sendMail({
        from: `"Nexus Vibe 👻" <${process.env.MAIL_FROM}>`,
        to: sendToInfo.to,
        subject: sendToInfo.subject,
        text: sendToInfo.text,
        html: sendToInfo.html,
    });

    console.log("Message sent: ", info?.messageId);
}