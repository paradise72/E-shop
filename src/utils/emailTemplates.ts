import {sendBrevoMail} from "../Controller/brevoMailController.js";


export const sendPaymentConfirmation = async (email:string,order:string,customer:string,amount:number)=>{
        await sendBrevoMail(email,"Payment Confirmation",
            `
            <h2>Your payment has been successful</h2>

            <p>Your order with order id ${order}</p>

            <p>for ${customer} with amount: ${amount}</p>

            <p>Has been successful. congrats</p>
        `)
}