import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { getOneUser, getLocation, getExtras } from "../lib/travels.lib";
import { Contact } from "../../types";
//import mailgun from "../lib/mailgun.lib";
//import Mailgun from "mailgun-js";
import resend from "../lib/resend.lib";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const prisma = new PrismaClient();
const User = prisma.users;
const Travel = prisma.travels;
const RequestTravel = prisma.travel_Request;
const Commentary = prisma.user_Comments;
const Chat = prisma.chat_Messages;
const img_Users = prisma.img_Users;
const img_Locations = prisma.img_Locations;
const Expenses = prisma.det_Expenses;
const img_Documents = prisma.img_Documents;
const UserRequests = prisma.usersRequest;
const Programadores = prisma.programadores;
const Ticket = prisma.ticket;
const Update = prisma.update;
const TicketsAsignados = prisma.tickets_Asignados;
const img_Tickets = prisma.img_Tickets;

export const getUsersByRequest = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const requests = await RequestTravel.findMany({ where: { id_user1: id } });
		const userid = [];
		const usersFoundArr = [];
		for (let index = 0; index < requests.length; index++) {
			userid.push(requests[index].id_user2);
			if (userid[index]) {
				const userFound = await User.findUnique({
					where: { id: userid[index] },
				});
				usersFoundArr.push(userFound);
			}
		}
		res.status(200).json(usersFoundArr);
	} catch (error) {
		res.status(500).json(["Ha ocurrido un error"]);
	}
};

export const registerNewCommentary = async (req: Request, res: Response) => {
	const { commentary_text, id_userComented, id_userComent, rate } = req.body;
	try {
		await Commentary.create({
			data: {
				comentary_text: commentary_text,
				id_userComented,
				id_userComent,
				rate,
			},
		});
		res.status(200).json(["Comentario guardado"]);
	} catch (error) {
		console.log(error);
		res.status(500).json(["Ha ocurrido un error"]);
	}
};

export const getComentariesByID = async (req: Request, res: Response) => {
	const { id } = req.params;
	const arrUsers = [];
	const arrCommentaries = [];
	try {
		const commentariesFound = await Commentary.findMany({
			where: { id_userComented: id },
		});
		if (commentariesFound.length > 0) {
			for (let index = 0; index < commentariesFound.length; index++) {
				arrCommentaries.push(commentariesFound[index]);
				const userFound = await getOneUser(
					arrCommentaries[index].id_userComent
				);
				arrUsers.push(userFound);
			}
			const data = {
				users: arrUsers,
				commentaries: arrCommentaries,
			};
			return res.status(200).json(data);
		}
		return res.status(200).json([]);
	} catch (error) {
		console.log(error);
		return res.status(500).json(["Ha ocurrido un error"]);
	}
};

export const getContacts = async (req: Request, res: Response) => {
	const { id } = req.params;
	const contacts = [];
	try {
		const travelFoundU1 = await Travel.findMany({
			where: { id_user1: id },
		});
		const travelFoundU2 = await Travel.findMany({
			where: { id_user2: id },
		});
		for (let index = 0; index < travelFoundU1.length; index++) {
			if (travelFoundU1[index]) {
				const userFound = await getOneUser(
					travelFoundU1[index]?.id_user2
						? (travelFoundU1[index]?.id_user2 as string)
						: ""
				);
				const image = await img_Users.findUnique({
					where: {
						id: userFound?.idProfile_img
							? (userFound?.idProfile_img as string)
							: "",
					},
				});
				if (userFound) {
					const dataContactsU1 = {
						id: userFound.id,
						name: userFound.name,
						userName: userFound.userName,
						lastName: userFound.lastName,
						email: userFound.email,
						profileImg: image?.image,
					};
					contacts.push(dataContactsU1);
				}
			}
		}
		for (let index = 0; index < travelFoundU2.length; index++) {
			if (travelFoundU2[index]) {
				const userFound = await getOneUser(travelFoundU2[index].id_user1);
				const image = await img_Users.findUnique({
					where: {
						id: userFound?.idProfile_img as string,
					},
				});
				if (userFound) {
					const dataContactsU2 = {
						id: userFound.id,
						name: userFound.name,
						userName: userFound.userName,
						lastName: userFound.lastName,
						email: userFound.email,
						profileImg: image?.image,
					};
					contacts.push(dataContactsU2);
				}
			}
		}
		const uniqueContacts = contacts.reduce((unique, contact) => {
			const existingContact = unique.find(
				(item: Contact) => item.id === contact.id
			);
			if (!existingContact) {
				unique.push(contact as never);
			}
			return unique;
		}, []);
		res.status(200).json(uniqueContacts);
	} catch (error) {
		console.log(error);
		res.status(500).json(["Ha ocurrido un error"]);
	}
};

export const getMessages = async (req: Request, res: Response) => {
	const { id_user1, id_user2 } = req.body;
	try {
		const messages = await Chat.findMany({
			where: {
				users: {
					array_contains: [id_user1, id_user2],
				},
			},
			orderBy: {
				createdAt: "asc",
			},
		});
		const PMessages = messages.map((message) => {
			return {
				fromSelf: message.id_user1 === id_user1,
				message: message.message,
			};
		});
		res.status(200).json(PMessages);
	} catch (error: any) {
		console.log(error.message);
		res.status(500).json(["Ha ocurrido un error"]);
	}
};

export const registerNewMessage = async (req: Request, res: Response) => {
	const { id_user1, id_user2, message } = req.body;
	try {
		const messageSaved = await Chat.create({
			data: {
				id_user1,
				id_user2,
				users: [id_user1, id_user2],
				message,
			},
		});
		return res.status(200).json(messageSaved);
	} catch (error) {
		console.log(error);
		return res.status(500).json(["Ha ocurrido un error"]);
	}
};

export const getComentsAndTravelsInactive = async (
	req: Request,
	res: Response
) => {
	const { id_owner, id_me } = req.body;
	const cardU1 = [];
	const cardU2 = [];
	const reviews = [];
	try {
		const user = await getOneUser(id_owner);
		const image = await img_Users.findUnique({
			where: {
				id: user?.idProfile_img as string,
			},
		});
		const commentariesFound = await Commentary.findMany({
			where: { id_userComented: id_owner },
		});
		if (commentariesFound.length > 0) {
			for (let index = 0; index < commentariesFound.length; index++) {
				const userFound = await getOneUser(
					commentariesFound[index].id_userComent
				);
				const imgReviews = await img_Users.findUnique({
					where: {
						id: userFound?.idProfile_img as string,
					},
				});
				const data = {
					user: userFound,
					comentary: commentariesFound[index],
					imgReviews: imgReviews?.image,
				};
				reviews.push(data);
			}
		}
		const travelsFoundUser1 = await Travel.findMany({
			where: {
				id_user1: id_owner,
				id_user2: { not: null },
				isActive: false,
			},
		});
		const travelsFoundUser2 = await Travel.findMany({
			where: {
				id_user2: id_owner,
				isActive: false,
			},
		});
		if (!travelsFoundUser1 && !travelsFoundUser2) {
			return res.status(200).json(["No hay viajes"]);
		}

		for (let index = 0; index < travelsFoundUser1.length; index++) {
			if (travelsFoundUser1[index]) {
				const expensesFound = await Expenses.findMany({
					where: {
						id_user1: travelsFoundUser1[index].id_user1,
						id_travel: travelsFoundUser1[index].id,
					},
				});
				let totalexpenses = 0;
				for (let index = 0; index < expensesFound.length; index++) {
					const data = expensesFound[index].quantity;
					totalexpenses += data.toNumber();
				}
				const locationFound = await getLocation(
					travelsFoundUser1[index].id_location
				);
				const image2Found = await img_Locations.findUnique({
					where: {
						id: locationFound?.id_locationImage2,
					},
				});
				const extrasFound = await getExtras(
					travelsFoundUser1[index].id_extras as string
				);
				const userForTravel = await getOneUser(
					travelsFoundUser1[index].id_user2 as string
				);

				const data = {
					travel: travelsFoundUser1[index],
					quantity: totalexpenses,
					expense: expensesFound?.find((expense) => expense.id_user2 === null)
						?.expense,
					location: locationFound,
					extras: extrasFound ? extrasFound : null,
					image: image2Found?.image,
					user: userForTravel,
				};
				cardU1.push(data);
			}
		}
		for (let index = 0; index < travelsFoundUser2.length; index++) {
			if (travelsFoundUser2[index]) {
				const expensesFound = await Expenses.findMany({
					where: {
						id_user2: travelsFoundUser2[index].id_user2,
						id_travel: travelsFoundUser2[index].id,
					},
				});
				let totalexpenses = 0;
				for (let index = 0; index < expensesFound.length; index++) {
					const data = expensesFound[index].quantity;
					totalexpenses += data.toNumber();
				}
				const locationFound = await getLocation(
					travelsFoundUser2[index].id_location
				);
				const image2Found = await img_Locations.findUnique({
					where: {
						id: locationFound?.id_locationImage2,
					},
				});
				const extrasFound = await getExtras(
					travelsFoundUser2[index].id_extras as string
				);
				const userForTravel = await getOneUser(
					travelsFoundUser2[index].id_user1
				);
				const data = {
					travel: travelsFoundUser2[index],
					quantity: totalexpenses,
					expense: expensesFound?.find((expense) => expense.id_user2 === null)
						?.expense,
					location: locationFound,
					extras: extrasFound ? extrasFound : null,
					image: image2Found?.image,
					user: userForTravel,
				};
				cardU2.push(data);
			}
		}

		const isSharedTravelOwner = travelsFoundUser1.some((travel) => {
			return travel.id_user2 == id_me;
		});
		const isSharedTravelCompanion = travelsFoundUser1.some((travel) => {
			return travel.id_user1 == id_me;
		});

		const data = {
			reviews,
			myTravels: cardU1,
			sharedTravels: cardU2,
			user,
			image: image?.image,
			isSharedTravel: isSharedTravelOwner || isSharedTravelCompanion,
		};
		return res.status(200).json(data);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const identitySender = async (req: Request, res: Response) => {
	const { id } = req.body;
	if (!id) {
		return res.status(400).json(["no hay ningun id"]);
	}
	const file1 = (req.files as { [fieldname: string]: Express.Multer.File[] })[
		"image1"
	][0];

	const file2 = (req.files as { [fieldname: string]: Express.Multer.File[] })[
		"image2"
	][0];

	const file3 = (req.files as { [fieldname: string]: Express.Multer.File[] })[
		"image3"
	][0];
	try {
		const response_img1: UploadApiResponse | undefined = await new Promise(
			(resolve, reject) => {
				cloudinary.uploader
					.upload_stream({}, (error, result) => {
						if (error) {
							reject(error);
						}
						resolve(result);
					})
					.end(file1.buffer);
			}
		);
		const response_img2: UploadApiResponse | undefined = await new Promise(
			(resolve, reject) => {
				cloudinary.uploader
					.upload_stream({}, (error, result) => {
						if (error) {
							reject(error);
						}
						resolve(result);
					})
					.end(file2.buffer);
			}
		);
		const response_img3: UploadApiResponse | undefined = await new Promise(
			(resolve, reject) => {
				cloudinary.uploader
					.upload_stream({}, (error, result) => {
						if (error) {
							reject(error);
						}
						resolve(result);
					})
					.end(file3.buffer);
			}
		);
		const newImage1 = await img_Documents.create({
			data: {
				image: response_img1?.secure_url as string,
			},
		});

		const newImage2 = await img_Documents.create({
			data: {
				image: response_img2?.secure_url as string,
			},
		});

		const newImage3 = await img_Documents.create({
			data: {
				image: response_img3?.secure_url as string,
			},
		});

		const newRequest = await UserRequests.create({
			data: {
				idUser: id,
				idIDImageFront: newImage1.id,
				idIDImageBack: newImage2.id,
				idUserImage: newImage3.id,
			},
		});
		return res.status(200).json(newRequest);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const getAccountRequest = async (_req: Request, res: Response) => {
	const requests = [];
	try {
		const requestsFound = await UserRequests.findMany({
			where: {
				isActive: true,
			},
		});
		for (let index = 0; index < requestsFound.length; index++) {
			const userFound = await getOneUser(requestsFound[index].idUser);
			const image1 = await img_Documents.findUnique({
				where: {
					id: requestsFound[index].idIDImageFront,
				},
			});
			const image2 = await img_Documents.findUnique({
				where: {
					id: requestsFound[index].idIDImageBack,
				},
			});
			const image3 = await img_Documents.findUnique({
				where: {
					id: requestsFound[index].idUserImage,
				},
			});
			requests.push({
				id: requestsFound[index].id,
				name: userFound?.name,
				lastName: userFound?.lastName,
				secondLastName: userFound?.secondLastName,
				email: userFound?.email,
				IDImageFront: image1?.image,
				IDImageBack: image2?.image,
				imageUser: image3?.image,
			});
		}
		return res.status(200).json(requests);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const acceptRequest = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const requestFound = await UserRequests.findUnique({ where: { id } });
		if (!requestFound) {
			return res.status(404).json(["No se encontro la solicitud"]);
		}
		await UserRequests.update({
			where: {
				id,
			},
			data: {
				isActive: false,
			},
		});
		const userVerified = await User.update({
			where: {
				id: requestFound.idUser,
				isActive: true,
			},
			data: {
				isVerified: true,
			},
		});
		const from = process.env.SENDER_EMAIL || "";
		await resend.emails.send({
			from,
			to: userVerified.email,
			subject: "Tripy - Identidad verificada",
			text: `Tu identidad ha sido verificada, gracias por usar Tripy`,
			html: `
		<body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">

			<h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>

			<h2 style="color: #333; margin-bottom: 20px;">Tu identidad ha sido verificada</h2>

			<h3 style="color: #333; margin-bottom: 20px;">Tu cuenta ha sido verificada y aceptada, sientete libre de usar Tripy</h3>
		</body>
		`,
		});

		return res.sendStatus(200);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const declineRequest = async (req: Request, res: Response) => {
	const { id } = req.params;
	const { reason } = req.body;
	console.log(id);

	try {
		const requestFound = await UserRequests.findUnique({ where: { id } });
		const iduser = requestFound?.idUser;
		if (!requestFound) {
			return res.status(404).json(["No se encontro la solicitud"]);
		}
		const userDisabled = await User.findUnique({
			where: {
				id: requestFound.idUser,
			},
		});
		const userData = userDisabled;
		await UserRequests.delete({
			where: {
				id,
				isActive: true,
			},
		});
		await User.delete({
			where: {
				id: iduser,
				isActive: true,
			},
		});
		const from = process.env.SENDER_EMAIL || "";
		await resend.emails.send({
			from,
			to: userData?.email as string,
			subject: "Tripy - Solicitud Rechazada",
			text: `Lamentablemente tu solicitud ha sido rechazada debido a: ${reason}, los datos que enviaste se eliminaran de nuestros registros`,
			html: `
		<body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">

			<h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>

			<h2 style="color: #333; margin-bottom: 20px;">Tu identidad no se ha podido verificar</h2>

			<h3 style="color: #333; margin-bottom: 20px;">Lamentablemente tu solicitud ha sido rechazada debido a: ${reason}, los datos que enviaste se eliminaran de nuestros registros, en caso de querer volver a usar Tripy, vuelve a realizar un registro pero con tus datos ya correjidos</h3>
		</body>
		`,
		});

		return res.sendStatus(200);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const blobSender = async (req: Request, res: Response) => {
	const { id, file1, file2, file3 } = req.body;
	console.log(req.body);
	if (!id) {
		return res.status(400).json(["no hay ningun id"]);
	}
	try {
		const newImage1 = await img_Documents.create({
			data: {
				image: file1,
			},
		});

		const newImage2 = await img_Documents.create({
			data: {
				image: file2,
			},
		});

		const newImage3 = await img_Documents.create({
			data: {
				image: file3,
			},
		});

		const newRequest = await UserRequests.create({
			data: {
				idUser: id,
				idIDImageFront: newImage1.id,
				idIDImageBack: newImage2.id,
				idUserImage: newImage3.id,
			},
		});
		return res.status(200).json(newRequest);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const addNewProgrammer = async (req: Request, res: Response) => {
	const { id } = req.body;
	try {
		const programmerFound = await Programadores.findFirst({
			where: {
				id_user: id,
			},
		});
		if (programmerFound) {
			return res
				.status(400)
				.json(["Ya hay un programador registrado con este id"]);
		}
		await Programadores.create({
			data: {
				id_user: id,
			},
		});
		return res.status(200).json(["Programador agregado"]);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const getAllTickets = async (_req: Request, res: Response) => {
	const cards = [];
	try {
		const tickets = await Ticket.findMany({
			where: {
				estatus: {
					not: "CLOSED",
				},
			},
		});
		for (let index = 0; index < tickets.length; index++) {
			const image = await img_Tickets.findFirst({
				where: {
					id_Ticket: tickets[index].id,
				},
			});
			let userEmail = "";
			if (tickets[index].estatus != "NEW") {
				const ticketAsignado = await TicketsAsignados.findFirst({
					where: {
						id_ticket: tickets[index].id,
					},
				});
				const programador = await Programadores.findUnique({
					where: {
						id: ticketAsignado?.id_programador as string,
					},
				});
				const user = await User.findUnique({
					where: {
						id: programador?.id_user as string,
					},
				});
				userEmail = user?.email as string;
			}
			const card = {
				...tickets[index],
				image: image?.image as string,
				emailProgramador: userEmail,
			};
			cards.push(card);
		}
		return res.status(200).json(cards);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const changeStatusTicket = async (req: Request, res: Response) => {
	const { id, status } = req.body;
	try {
		await Ticket.update({
			where: {
				id,
			},
			data: {
				estatus: status,
			},
		});
		return res.status(200).json(["Ticket actualizado"]);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const changeTicketPriority = async (req: Request, res: Response) => {
	const { id, prioridad } = req.body;
	try {
		await Ticket.update({
			where: {
				id,
			},
			data: {
				prioridad: prioridad,
			},
		});
		return res.status(200).json(["Ticket actualizado"]);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const addNewTicket = async (req: Request, res: Response) => {
	const { tipo_ticket, email_usuario_reporte, descripcion } = req.body;
	const file = req.file as Express.Multer.File;
	try {
		const response_img: UploadApiResponse | undefined = await new Promise(
			(resolve, reject) => {
				cloudinary.uploader
					.upload_stream({}, (error, result) => {
						if (error) {
							reject(error);
						}
						resolve(result);
					})
					.end(file.buffer);
			}
		);
		const ticket = await Ticket.create({
			data: {
				tipo_ticket,
				email_usuario_reporte,
				descripcion,
			},
		});
		await img_Tickets.create({
			data: {
				id_Ticket: ticket.id,
				image: response_img?.secure_url as string,
			},
		});

		return res.status(200).json(["Ticket creado"]);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const addNewUpdate = async (req: Request, res: Response) => {
	const { name, number, description, tickets } = req.body;
	try {
		const updates = await Update.findMany();
		tickets.forEach((ticket: string) => {
			const hasTicketInUpdate = updates.some((update) => {
				const updateTickets = update.ticketIds as (string | number)[];
				return updateTickets.includes(ticket);
			});
			if (hasTicketInUpdate) {
				return res
					.status(400)
					.json(["Ya se ha creado una actualizacion con este ticket"]);
			}
			return;
		});
		await Update.create({
			data: {
				name,
				number,
				description,
				ticketIds: tickets,
			},
		});
		return res.status(200).json(["Actualizacion creada"]);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const getUpdates = async (_req: Request, res: Response) => {
	try {
		const updates = await Update.findMany();
		const updatesWithTickets = await Promise.all(
			updates.map(async (update) => {
				const ticketIds = update.ticketIds as string[];
				const tickets = await Ticket.findMany({
					where: {
						id: {
							in: ticketIds,
						},
					},
				});
				return { ...update, tickets };
			})
		);
		return res.status(200).json(updatesWithTickets);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const addTicketToProgrammer = async (req: Request, res: Response) => {
	const { id_programmer, id_ticket } = req.body;
	try {
		const ticketsAsignados = await TicketsAsignados.findFirst({
			where: {
				id_ticket,
			},
		});
		if (ticketsAsignados) {
			return res.status(400).json(["Ya se ha asignado este ticket"]);
		}
		await Ticket.update({
			where: {
				id: id_ticket,
			},
			data: {
				estatus: "ASSIGNED",
			},
		});
		await TicketsAsignados.create({
			data: {
				id_programador: id_programmer,
				id_ticket,
			},
		});
		return res.status(200).json(["Ticket asignado"]);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const getProgrammers = async (_req: Request, res: Response) => {
	const users = [];
	try {
		const programmers = await Programadores.findMany();
		for (let index = 0; index < programmers.length; index++) {
			const user = await getOneUser(programmers[index].id_user);
			const data = {
				id_user: user?.id,
				id_programador: programmers[index].id,
				name: user?.name,
				email: user?.email,
			};
			users.push(data);
		}
		return res.status(200).json(users);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const getMyTickets = async (req: Request, res: Response) => {
	const { id } = req.body;
	const tickets = [];
	try {
		const programador = await Programadores.findFirst({
			where: {
				id_user: id,
			},
		});

		const ticketsAsignados = await TicketsAsignados.findMany({
			where: {
				id_programador: programador?.id as string,
			},
		});
		for (let index = 0; index < ticketsAsignados.length; index++) {
			const ticket = await Ticket.findUnique({
				where: {
					id: ticketsAsignados[index].id_ticket,
					AND: {
						estatus: { not: "CLOSED" },
					},
				},
			});
			if (ticket) {
				const image = await img_Tickets.findFirst({
					where: {
						id_Ticket: ticket?.id as string,
					},
				});
				const data = {
					...ticket,
					image: image?.image as string,
				};
				tickets.push(data);
			}
		}
		return res.status(200).json(tickets);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const getClosedTickets = async (_req: Request, res: Response) => {
	const cards = [];
	try {
		const closedTickets = await prisma.ticket.findMany({
			where: {
				estatus: "CLOSED",
			},
		});

		const updates = await prisma.update.findMany();

		const updatedTicketIds = updates.flatMap(
			(update) => update.ticketIds as string[]
		);

		const filteredTickets = closedTickets.filter(
			(ticket) => !updatedTicketIds.includes(ticket.id)
		);

		for (let index = 0; index < filteredTickets.length; index++) {
			const image = await prisma.img_Tickets.findFirst({
				where: {
					id_Ticket: filteredTickets[index].id,
				},
			});
			const card = {
				...filteredTickets[index],
				image: image?.image as string,
			};
			cards.push(card);
		}

		return res.status(200).json(cards);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};
