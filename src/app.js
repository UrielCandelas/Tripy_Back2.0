import "dotenv/config";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { createServer } from "node:http";
import { Server } from "socket.io";

import authRoutes from "./routes/auth.routes";
import locationRoutes from "./routes/locations.routes";
import travelsRoutes from "./routes/travels.routes";
import userRoutes from "./routes/users.routes";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	cors: {
		origin: "https://tripyweb-production.up.railway.app",
		credentials: true,
	},
});
const origins = [
	"http://localhost:5173",
	"http://localhost:8080",
	"exp://10.107.99.45:8081",
	"exp://192.168.1.248:8081",
	"exp://192.168.0.12:8081",
	"https://tripyweb-production.up.railway.app",
];

app.use(express.json());
app.use(
	cors({
		origin(requestOrigin, callback) {
			if (!requestOrigin || origins.includes(requestOrigin)) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
	})
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api", authRoutes);
app.use("/api", locationRoutes);
app.use("/api", travelsRoutes);
app.use("/api", userRoutes);

global.onlineUsers = new Map();

io.on("connection", async (socket) => {
	console.log("New Connection: ", socket.id);
	global.chatSocket = socket;
	socket.on("add-user", (userId) => {
		global.onlineUsers.set(userId, socket.id);
		console.log("online users: ", global.onlineUsers);
	});

	socket.on("send-msg", (data) => {
		const sendUserSocket = global.onlineUsers.get(data.to);
		if (sendUserSocket) {
			socket.to(sendUserSocket).emit("msg-recieve", data.message);
			console.log("Sended Message: ", data);
			console.log("Message sended to:", sendUserSocket);
		}
	});

	socket.on("send-requests", (data) => {
		const sendUserSocket = global.onlineUsers.get(data.id);
		if (sendUserSocket) {
			socket.to(sendUserSocket).emit("get-requests", data.req);
		}
	});
});

export default httpServer;
