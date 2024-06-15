import {
	PrismaClient,
	Travels,
	det_Expenses,
	Travel_Request,
	Users,
} from "@prisma/client";
import { Request, Response } from "express";

import {
	getTravel,
	getOneUser,
	getLocation,
	getRequestTravel,
	getExtras,
} from "../lib/travels.lib";
import mailgun from "../lib/mailgun.lib";
import Mailgun from "mailgun-js";

const prisma = new PrismaClient();

const Travel = prisma.travels;
const Location = prisma.cat_Locations;
const Extra = prisma.det_Extras;
const Expenses = prisma.det_Expenses;
const RequestTravel = prisma.travel_Request;
const Images = prisma.img_Users;
const Users = prisma.users;
const Coments = prisma.location_Comments;
const img_Users = prisma.img_Users;
const img_Locations = prisma.img_Locations;

export const registerNewTravel = async (req: Request, res: Response) => {
	const {
		id_user1,
		id_location,
		travel_date,
		id_transportation,
		companions,
	}: Travels = req.body;
	const { quantity, expense }: det_Expenses = req.body;
	const { extra } = req.body;
	let expenseSaved;
	let extraSaved;
	try {
		const getUser = await getOneUser(id_user1);
		const getLocation = await Location.findUnique({
			where: { id: id_location },
		});
		if (!getLocation || !getUser) {
			return res.status(400).json(["No se encontro el usuario o la ubicacion"]);
		}
		const travelFound = await Travel.findFirst({
			where: {
				isActive: true,
				OR: [{ id_user1: getUser.id }, { id_user2: getUser.id }],
			},
		});
		if (travelFound) {
			return res.status(409).json(["Ya tienes un viaje activo"]);
		}

		if (quantity) {
			expenseSaved = await Expenses.create({
				data: {
					id_user1,
					expense,
					quantity,
				},
			});
		}
		if (extra) {
			extraSaved = await Extra.create({
				data: {
					extra_commentary: extra,
				},
			});
		}

		const travelSaved = await Travel.create({
			data: {
				id_user1,
				id_location,
				travel_date,
				id_transportation,
				id_extras: extraSaved ? extraSaved.id : null,
				companions,
			},
		});
		await Expenses.update({
			where: { id: expenseSaved?.id },
			data: {
				id_travel: travelSaved.id,
			},
		});
		return res.status(200).json([`Se han registrado los datos con exito`]);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};
export const addSecondUser = async (req: Request, res: Response) => {
	const { id_user2, id_travel, id_request } = req.body;
	try {
		const travelFound = await getTravel(id_travel);
		const userFound = await getOneUser(id_user2);
		const requestFound = (await RequestTravel.findFirst({
			where: {
				id_travel,
				isActive: true,
				id: id_request,
			},
		})) as Travel_Request;

		if (!travelFound || !userFound) {
			return res.status(400).json(["No se encontro el viaje o el usuario"]);
		}
		if (requestFound?.isActive === false) {
			return res
				.status(401)
				.json(["Ya se acepto la solicitud para este viaje"]);
		}

		await Travel.update({
			where: {
				id: id_travel,
			},
			data: {
				id_user2,
			},
		});
		await RequestTravel.update({
			where: {
				id: id_request,
				isActive: true,
			},
			data: {
				isActive: false,
			},
		});
		const allRequests = await RequestTravel.findMany({
			where: {
				isActive: true,
				id_travel,
			},
		});
		for (let index = 0; index < allRequests.length; index++) {
			await RequestTravel.update({
				where: {
					id: allRequests[index].id,
				},
				data: {
					isActive: false,
				},
			});
		}
		const locationFound = await getLocation(travelFound?.id_location as string);
		const ownerFound = await getOneUser(requestFound.id_user1);
		const from = process.env.SENDER_EMAIL;
		await new Promise((resolve, reject) => {
			mailgun.messages().send(
				{
					from,
					to: userFound.email,
					subject: "Tripy - Aprobación de Solicitud de Viaje",
					text: `${ownerFound?.name} ha aceptado tu solicitud de unirte a su viaje hacia ${locationFound?.location_name}`,
					html: `
      <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">

        <h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>

        <h2 style="color: #333; margin-bottom: 20px;">Se ha aceptado tu solicitud de unirte a un viaje</h2>

        <div style="color: black; margin-top: 15px;">
          <p>${ownerFound?.name} ha aceptado tu solicitud de unirte a su viaje hacia ${locationFound?.location_name}</p>
					<p>Disfruta de tu viaje, acabando el viaje puedes dejarle una reseña a ese usuario</p>
        </div>

      </body>
      `,
				},
				(err: Mailgun.Error, body: Mailgun.messages.SendResponse) => {
					if (err) {
						reject(err);
					}
					resolve(body);
				}
			);
		});

		return res.status(200).json(["Se ha aceptado la solicitud con exito"]);
	} catch (error: any) {
		console.log(error.message);
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const deleteSecondUser = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const travelFound = await getTravel(id);
		if (!travelFound) {
			res.status(400).json(["No se encontro el viaje"]);
		}
		const travelUpdated = await Travel.update({
			where: {
				id,
			},
			data: {
				id_user2: null,
			},
		});
		return res.status(200).json(travelUpdated);
	} catch (error: any) {
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const deleteTravel = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const travelFound = await getTravel(id);
		if (!travelFound) {
			res.status(400).json(["No se encontro el viaje"]);
		}
		await Travel.update({
			where: {
				id,
			},
			data: {
				isActive: false,
			},
		});
		if (travelFound?.id_user2 !== null) {
			const travel = travelFound as Travels;
			const userFound = (await getOneUser(travel.id_user2 as string)) as Users;
			const locationFound = await getLocation(
				travelFound?.id_location as string
			);
			const ownerFound = await getOneUser(travel.id_user1);
			const from = process.env.SENDER_EMAIL;
			await new Promise((resolve, reject) => {
				mailgun.messages().send(
					{
						from,
						to: userFound.email,
						subject: "Tripy - Finalizacion de Viaje",
						text: `${ownerFound?.name} ha finalizado el viaje hacia ${locationFound?.location_name}`,
						html: `
				<body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">
	
					<h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>
	
					<h2 style="color: #333; margin-bottom: 20px;">Se ha finalizado el viaje</h2>
	
					<div style="color: black; margin-top: 15px;">
						<p>${ownerFound?.name} ha finalizado el viaje hacia ${locationFound?.location_name}</p>
						<p>Puedes dejar una reseña en el perfil de ${ownerFound?.name} hablando de tu experiencia</p>
						<p>Gracias por usar Tripy</p>
					</div>
	
				</body>
				`,
					},
					(err: Mailgun.Error, body: Mailgun.messages.SendResponse) => {
						if (err) {
							reject(err);
						}
						resolve(body);
					}
				);
			});
		}

		return res.status(200).json(`Se ha eliminado el viaje`);
	} catch (error: any) {
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const getAllExtras = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const extras = await Extra.findUnique({ where: { id } });
		return res.status(200).json(extras);
	} catch (error: any) {
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const addTravelRequest = async (req: Request, res: Response) => {
	const { id_user1, id_user2, id_travel }: Travel_Request = req.body;
	try {
		const travelFound = await getTravel(id_travel);
		const user1Found = await getOneUser(id_user1);
		const user2Found = await getOneUser(id_user2);
		if (!user1Found) {
			return res.status(404).json(["No se encontro al usuario"]);
		}
		if (!user2Found) {
			return res.status(404).json(["Tu usuario no existe"]);
		}
		if (!travelFound) {
			return res.status(404).json(["No se encontro el viaje"]);
		}
		const requestFound = await RequestTravel.findFirst({
			where: {
				id_user2: id_user2,
				AND: { isActive: true, id_user1: id_user1 },
			},
		});
		const otherRequest = await RequestTravel.findFirst({
			where: {
				isActive: true,
				OR: [
					{
						id_user2: id_user2,
					},
					{
						id_user1: id_user2,
					},
				],
			},
		});

		const travelFoundForUser = await Travel.findFirst({
			where: {
				OR: [
					{
						id_user1: id_user2,
						isActive: true,
					},
					{
						id_user2: id_user2,
						isActive: true,
					},
				],
			},
		});

		if (travelFoundForUser) {
			return res.status(401).json(["Ya tienes un viaje pendiente"]);
		}
		if (requestFound) {
			return res
				.status(401)
				.json(["Ya tienes una solicitud pendiente para este viaje"]);
		}
		if (otherRequest) {
			return res
				.status(401)
				.json(["Ya tienes una solicitud pendiente para otro viaje"]);
		}

		await RequestTravel.create({
			data: {
				id_user1,
				id_user2,
				id_travel,
			},
		});
		const from = process.env.SENDER_EMAIL;
		const userFound = (await getOneUser(id_user1)) as Users;
		await new Promise((resolve, reject) => {
			mailgun.messages().send(
				{
					from,
					to: userFound.email,
					subject: "Tripy - Solicitud de Viaje",
					text: `${userFound.name} ${userFound.lastName} ha solicitado unirse a tu viaje`,
					html: `
      <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">

        <h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>

        <h2 style="color: #333; margin-bottom: 20px;">Un usuario solicito unirse a tu viaje</h2>

        <div style="color: black; margin-top: 15px;">
          <p>${userFound.name} ${userFound.lastName} ha solicitado unirse a tu viaje</p>
					<p>Puedes consultar su perfil para revisar sus reseñas de anteriores viajes desde Tripy</p>
        </div>

      </body>
      `,
				},
				(err: Mailgun.Error, body: Mailgun.messages.SendResponse) => {
					if (err) {
						reject(err);
					}
					resolve(body);
				}
			);
		});

		return res.status(200).json(["Solicitud enviada"]);
	} catch (error: any) {
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const declineRequest = async (req: Request, res: Response) => {
	const { id_request } = req.body;
	try {
		const requestFound = await getRequestTravel(id_request);
		if (!requestFound) {
			return res.status(404).json(["No se encontro la solicitud"]);
		}
		await RequestTravel.update({
			where: {
				id: id_request,
			},
			data: {
				isActive: false,
			},
		});

		const userFound = (await getOneUser(requestFound.id_user2)) as Users;
		const travelFound = await getTravel(requestFound.id_travel);
		const locationFound = await getLocation(travelFound?.id_location as string);
		const ownerFound = await getOneUser(requestFound.id_user1);
		const from = process.env.SENDER_EMAIL;
		await new Promise((resolve, reject) => {
			mailgun.messages().send(
				{
					from,
					to: userFound.email,
					subject: "Tripy - Rechazo de solicitud",
					text: `${ownerFound?.name} ha rechazado tu solicitud de unirte a un viaje hacia ${locationFound?.location_name}`,
					html: `
      <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">

        <h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>

        <h2 style="color: #333; margin-bottom: 20px;">Se ha rechazado tu solicitud de unirte a un viaje</h2>

        <div style="color: black; margin-top: 15px;">
          <p>${ownerFound?.name} ha rechazado tu solicitud de unirte a un viaje hacia ${locationFound?.location_name}</p>
					<p>Puedes volver a hacer tu solicitud a ese viaje</p>
        </div>

      </body>
      `,
				},
				(err: Mailgun.Error, body: Mailgun.messages.SendResponse) => {
					if (err) {
						reject(err);
					}
					resolve(body);
				}
			);
		});
		return res.status(200).json(["La solicitud ha sido rechazada"]);
	} catch (error: any) {
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const getTravelsI = async (req: Request, res: Response) => {
	const { id } = req.params;
	const expenses = [];
	const locations = [];
	const extras = [];
	try {
		const travelsFoundUser1 = await Travel.findMany({
			where: {
				id_user1: id,
				isActive: false,
			},
		});
		const travelsFoundUser2 = await Travel.findMany({
			where: {
				id_user2: id,
				isActive: false,
			},
		});
		if (!travelsFoundUser1 && !travelsFoundUser2) {
			return res.status(200).json(["No hay viajes"]);
		}
		for (let index = 0; index < travelsFoundUser1.length; index++) {
			if (travelsFoundUser1[index]) {
				const expensesFound = await Expenses.findMany({
					where: { id: travelsFoundUser1[index].id },
				});
				expenses.push(expensesFound);
				const locationFound = await getLocation(
					travelsFoundUser1[index].id_location
				);
				locations.push(locationFound);
				const extrasFound = await getExtras(
					travelsFoundUser1[index].id_extras as string
				);
				if (extrasFound) {
					extras.push(extrasFound);
				}
			}
		}
		const data = {
			travels: travelsFoundUser1,
			sharedTravels: travelsFoundUser2,
			locations: locations,
			expenses: expenses,
			extras: extras,
		};
		return res.status(200).json(data);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};
export const getTravelsA = async (req: Request, res: Response) => {
	const { id } = req.params;
	const expenses1 = [];
	const locations1 = [];
	const extras1 = [];
	const expenses2 = [];
	const locations2 = [];
	const extras2 = [];
	const usersU1 = [];
	const usersU2 = [];
	const expensesI = [];
	const locationsI = [];
	const extrasI = [];
	try {
		const travelsFoundUser1 = await Travel.findMany({
			where: {
				id_user1: id,
				id_user2: { not: null },
				isActive: true,
			},
		});
		const travelsFoundUser2 = await Travel.findMany({
			where: {
				id_user2: id,
				isActive: true,
			},
		});
		const travelsFoundInactive = await Travel.findMany({
			where: {
				id_user1: id,
				id_user2: null,
				isActive: true,
			},
		});
		if (!travelsFoundUser1 && !travelsFoundUser2 && !travelsFoundInactive) {
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
				let totalExpenses = 0;
				for (let index = 0; index < expensesFound.length; index++) {
					const data = expensesFound[index].quantity;
					totalExpenses += data.toNumber();
				}
				const obj = {
					totalExpenses: totalExpenses,
					expenses: expensesFound,
				};
				expenses1.push(obj);
				const locationFound = await getLocation(
					travelsFoundUser1[index].id_location
				);
				locations1.push(locationFound);
				const extrasFound = await getExtras(
					travelsFoundUser1[index].id_extras as string
				);
				if (extrasFound) {
					extras1.push(extrasFound);
				}
				const usersFound = await getOneUser(
					travelsFoundUser1[index].id_user2 as string
				);
				if (usersFound) {
					usersU1.push(usersFound);
				}
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
				let totalExpenses = 0;
				for (let index = 0; index < expensesFound.length; index++) {
					const data = expensesFound[index].quantity;
					totalExpenses += data.toNumber();
				}
				const obj = {
					totalExpenses: totalExpenses,
					expenses: expensesFound,
				};
				expenses2.push(obj);
				const locationFound = await getLocation(
					travelsFoundUser2[index].id_location
				);
				locations2.push(locationFound);
				const extrasFound = await getExtras(
					travelsFoundUser2[index].id_extras as string
				);
				if (extrasFound) {
					extras2.push(extrasFound);
				}
				const usersFound = await getOneUser(travelsFoundUser2[index].id_user1);
				if (usersFound) {
					usersU2.push(usersFound);
				}
			}
		}
		for (let index = 0; index < travelsFoundInactive.length; index++) {
			if (travelsFoundInactive[index]) {
				const expensesFound = await Expenses.findMany({
					where: {
						id_travel: travelsFoundInactive[index].id,
					},
				});
				let totalExpenses = 0;
				for (let index = 0; index < expensesFound.length; index++) {
					const data = expensesFound[index].quantity;
					totalExpenses += data.toNumber();
				}
				const obj = {
					totalExpenses: totalExpenses,
					expenses: expensesFound,
				};
				expensesI.push(obj);
				const locationFound = await getLocation(
					travelsFoundInactive[index].id_location
				);
				locationsI.push(locationFound);
				const extrasFound = await getExtras(
					travelsFoundInactive[index].id_extras as string
				);
				if (extrasFound) {
					extrasI.push(extrasFound);
				}
			}
		}
		const data = {
			travels: travelsFoundUser1,
			usersU1: usersU1,
			sharedTravels: travelsFoundUser2,
			locations_user1: locations1,
			expenses_user1: expenses1,
			extras_user1: extras1,
			locations_user2: locations2,
			expenses_user2: expenses2,
			usersU2: usersU2,
			extras_user2: extras2,
			travelsInactive: travelsFoundInactive,
			expenses_inactive: expensesI,
			locations_inactive: locationsI,
			extras_inactive: extrasI,
		};
		return res.status(200).json(data);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const getRequest = async (req: Request, res: Response) => {
	const { id } = req.params;
	const arrRequest = [];
	const arrTravels = [];
	const arrLocations = [];
	const arrUsers = [];
	const arrImges = [];
	try {
		const requestValue = await RequestTravel.findMany({
			where: { id_user1: id, isActive: true, id_user2: { not: undefined } },
		});

		for (let index = 0; index < requestValue.length; index++) {
			arrRequest.push(requestValue[index]);
			const requestTravel = await getTravel(requestValue[index].id_travel);
			arrTravels.push(requestTravel);

			const requestLocation = await getLocation(
				requestTravel?.id_location as string
			);
			arrLocations.push(requestLocation);

			const requestUser = await getOneUser(requestValue[index].id_user2);
			arrUsers.push(requestUser);

			const imageFound = await Images.findUnique({
				where: {
					id: requestUser?.idProfile_img as string,
				},
			});
			arrImges.push(imageFound);
		}
		const objData = {
			request: arrRequest,
			travels: arrTravels,
			locations: arrLocations,
			users: arrUsers,
			images: arrImges,
		};
		return res.status(200).json(objData);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
	}
};

export const addExpenseToTravel = async (req: Request, res: Response) => {
	const { id_travel, id_user1, id_user2, expense, quantity } = req.body;
	try {
		const travelFound = await Travel.findFirst({
			where: { id: id_travel, isActive: true },
		});
		if (!travelFound) {
			return res.status(404).json(["No se encontro el viaje"]);
		}
		await Expenses.create({
			data: {
				id_user1,
				id_user2,
				id_travel,
				expense,
				quantity,
			},
		});
		return res.status(200).json(["Gasto añadido al viaje"]);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const getTravelExpenses = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const travelFound = await Travel.findFirst({
			where: { id },
		});
		if (!travelFound) {
			return res.status(404).json(["No se encontro el viaje"]);
		}
		const expensesFound = await Expenses.findMany({
			where: { id_travel: id },
		});
		return res.status(200).json(expensesFound);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const getTravelsAndUsers = async (req: Request, res: Response) => {
	const { id } = req.params;
	try {
		const travelFound = await Travel.findFirst({
			where: {
				isActive: true,
				OR: [{ id_user1: id }, { id_user2: id }],
			},
		});
		if (!travelFound) {
			return res.status(404).json(["No se encontro el viaje"]);
		}
		const locationFound = await getLocation(travelFound?.id_location as string);
		const user1Found = await Users.findUnique({
			where: {
				id: travelFound?.id_user1 as string,
			},
		});
		const user2Found = await Users.findUnique({
			where: {
				id: travelFound?.id_user2 as string,
			},
		});
		const data = {
			user1: {
				id: user1Found?.id as string,
				name: user1Found?.name as string,
			},
			user2: {
				id: user2Found?.id as string,
				name: user2Found?.name as string,
			},
			location: locationFound,
		};
		return res.status(200).json(data);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const registerComentTr = async (req: Request, res: Response) => {
	const { idUser, idLocation, uComent } = req.body;
	try {
		const isComment = await Coments.findMany({
			where: {
				id_location: idLocation,
				id_user: idUser,
			},
		});

		if (isComment.length >= 3) {
			return res.status(400).json(["Ya has comentado este lugar muchas veces"]);
		}
		const newComent = await Coments.create({
			data: {
				id_location: idLocation,
				id_user: idUser,
				comment: uComent,
			},
		});

		return res.status(200).json(newComent);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const consultComent = async (req: Request, res: Response) => {
	const { idLocation } = req.params;
	const comentarios = [];
	try {
		const loadComents = await Coments.findMany({
			where: {
				id_location: idLocation,
			},
		});

		for (let i = 0; i < loadComents.length; i++) {
			const user = await Users.findUnique({
				where: {
					id: loadComents[i].id_user,
				},
			});
			const obj = {
				id: user?.id,
				email: user?.email,
				name: user?.name,
				lastName: user?.lastName,
				lastSecName: user?.secondLastName,
				userName: user?.userName,
				comentario: loadComents[i].comment,
			};
			comentarios.push(obj);
		}

		return res.status(200).json(comentarios);
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};

export const buscador = async (req: Request, res: Response) => {
	const { params } = req.body;

	if (!params) {
		return res.status(400).json({ error: "Params are required" });
	}

	try {
		const locations = await Location.findMany({
			where: {
				location_name: {
					contains: params,
					// mode: "insensitive" // Este se elimina porque no es compatible
				},
			},
		});

		const users = await Users.findMany({
			where: {
				userName: {
					contains: params,
					// mode: "insensitive" // Este se elimina porque no es compatible
				},
			},
		});

		const usersArr: any = [];
		for (let index = 0; index < users.length; index++) {
			const image = await img_Users.findUnique({
				where: {
					id: users[index].idProfile_img as string,
				},
			});
			usersArr.push({
				...users[index],
				image: image?.image as string,
			});
		}

		const locationsArr: any = [];
		for (let index = 0; index < locations.length; index++) {
			const image = await img_Locations.findUnique({
				where: {
					id: locations[index].id_locationImage1 as string,
				},
			});

			locationsArr.push({
				...locations[index],
				image: image?.image as string,
			});
		}
		return res.status(200).json({ locations: locationsArr, users: usersArr });
	} catch (error: any) {
		return res.status(500).json([error.message]);
	}
};
