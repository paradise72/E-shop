import {brevo} from "../config/brevo.js";


export const sendBrevoMail = async (to:string,subject:string,html:string) => {
    try{
        const response = await brevo.transactionalEmails.sendTransacEmail({
            sender:{
                name:process.env.BREVO_SENDER_NAME as string,
                email:process.env.BREVO_SENDER_EMAIL as string
            },
            to:[
                {
                    email:to
                }
            ],
            subject:subject,
            htmlContent:html
        })

        console.log("Email sent:",response.messageId)

        return response
    }catch(e){
        console.error("Error sending mail:", e);
        throw e
    }

}



