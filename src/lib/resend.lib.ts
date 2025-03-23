import { Resend } from "resend";
const RESEND_API = process.env.RESEND_API;

const resend = new Resend(RESEND_API);

export default resend;
