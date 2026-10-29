import {transporter} from "../config/mail.js";
const sendEmail = async (
    to: string,
    subject: string,
    html: string
) => {
    try {
        const info = await transporter.sendMail({
            from: `"App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        });

        console.log("Email sent:", info.messageId);
        return info;
    } catch (e) {
        console.error("Error sending mail:", e);
        throw e;
    }
};

const sendResetCodeEmail = async (to:string,code:string)=>{
    const subject = "Password reset code"
    const html = `<p> OTP:${code}</p>`

    await sendEmail(to,subject,html)
}


export const sendWelcome = async (to:string)=>{
    const html = `welcome `
    const subject = "test "
    await sendEmail(to,subject,html)
}


