import mailgun from "mailgun-js";

const DOMAIN = process.env.DOMAIN as string;
const API_KEY = process.env.MAILGUN_API_KEY as string;

const mg = mailgun({ apiKey: API_KEY, domain: DOMAIN });

export default mg;
