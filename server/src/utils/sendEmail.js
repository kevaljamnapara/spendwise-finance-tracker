import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  let transporter;

  let isTestAccount = false;

  // Use real SMTP if provided, otherwise create ethereal test account
  if (process.env.SMTP_SERVICE === 'gmail' || (process.env.SMTP_HOST && process.env.SMTP_PORT)) {
    const config = process.env.SMTP_SERVICE === 'gmail' 
      ? {
          service: 'gmail',
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        }
      : {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
          },
        };

    transporter = nodemailer.createTransport(config);
  } else {
    isTestAccount = true;
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();

    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  }

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `${process.env.FROM_NAME || 'SpendWise'} <${process.env.FROM_EMAIL || 'noreply@spendwise.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  });

    // Email sent successfully
  
  // Preview only available when sending through an Ethereal account
    // Preview URL available for Ethereal Email
};

export default sendEmail;
