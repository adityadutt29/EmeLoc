import express from 'express';
import nodemailer from 'nodemailer';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';

// Load environment variables from .env file
dotenv.config();

const app = express();

// Use CORS middleware
app.use(cors()); // This allows all origins. For specific origins, pass options to cors()

app.use(bodyParser.json());

// Create transporter with hardcoded credentials
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'sanatkulkarni100@gmail.com', // Hardcoded email user
    pass: 'nobm jvxn uxff naog', // Hardcoded app-specific password
  },
});

app.post('/api/send-email', async (req, res) => {
  const { to, subject, textPart, htmlPart } = req.body;

  try {
    let info = await transporter.sendMail({
      from: '"Your App" <sanatkulkarni100@gmail.com>', // Hardcoded sender email
      to,
      subject,
      text: textPart,
      html: htmlPart,
    });

    res.json({ messageId: info.messageId });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
