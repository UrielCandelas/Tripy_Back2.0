import nodemailer from "nodemailer";

const user = process.env.SENDER_EMAIL;
const pass = process.env.SENDER_PASSWORD;

const transporter = nodemailer.createTransport({
	host: "smtp.office365.com",
	port: 587,
	secure: true,
	auth: {
		user,
		pass,
	},
	tls: {
		rejectUnauthorized: false, // Opcional, para permitir certificados autofirmados
	},
});

export default transporter;
