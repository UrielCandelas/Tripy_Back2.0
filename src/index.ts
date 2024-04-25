import app from "./app.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

async function connectDB() {
	try {
		await prisma.$connect();
		console.log("Connected to DB");
	} catch (error) {
		console.log(error);
		//throw new Error("Error connecting to database");
	}
}

connectDB();
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`);
});
