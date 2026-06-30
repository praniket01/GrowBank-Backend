import nodemailer from 'nodemailer';
import 'dotenv/config'

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
    },
});

// Verify the connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.error('Error connecting to email server:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Function to send email
export const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Grow Bank" <${process.env.EMAIL_USER}>`, // sender address
            to, // list of receivers
            subject, // Subject line
            text, // plain text body
            html, // html body
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendRegistrationEmail = async (userEmail, name) => {
    const subject = 'Welcome to Grow Bank';
    const text = `Dear ${name}, we are pleased to have you onboard.
                 Next steps - Explore the vast opportunities and scale your mastery using our sustems.`
    const html = `<p> Hello ${name}</p><p>Thank You for registering at Growbank</p>
                    We are excited to have you on board
                    <br></br>
                    <p>The Grow Bank Team</p>
                    `
    await sendEmail(userEmail, subject, text, html);
}

const sendTransactionEmail = async (userEmail, name, amount, toAccount) => {
    const subject = 'Update on your recent transactioin';
    const text = `Dear ${name}, please note you have made ${amount} to ${toAccount}'s account`
    const html = `<p> Hello ${name}</p><p>Thank You for Banking at Growbank</p>
                    please note you have made ${amount} to ${toAccount}'s account
                    <br></br>
                    <p>The Grow Bank Team</p>
                    `
    await sendEmail(userEmail, subject, text, html);
}

export const sendTransactionFailEmail = async (userEmail, name, amount, toAccount) => {
    const subject = 'Failure on your recent transactioin';
    const text = `Dear ${name}, please note you have made ${amount} to ${toAccount}'s account`
    const html = `<p> Hello ${name}</p><p>Thank You for Banking at Growbank</p>
                    please note your transaction of ${amount} to ${toAccount}'s account is failed and amount has been reverted to your account
                    <br></br>
                    <p>The Grow Bank Team</p>
                    `
    await sendEmail(userEmail, subject, text, html);
}

export default sendTransactionEmail;