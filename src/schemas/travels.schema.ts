import { z } from "zod";
/*const noSpecialChars = (value: string | undefined) =>
  /^[a-zA-Z0-9]+$/.test(value ? value : "");*/

export const createTravelSchema = z.object({
	id_user1: z.string({ required_error: "El id del usuario es requerido" }),
	id_location: z.string({
		required_error: "El id de la locacion es requerido",
	}),
	travel_date: z.string({ required_error: "La fecha es requerida" }),
	expense: z.string({ required_error: "El gasto es requerido" }),
	quantity: z.number({ required_error: "La cantidad es requerida" }),
	extra: z.string().optional(),
	companions: z.number({ required_error: "Los acompañantes son requeridos" }),
});

export const travelSchema = z.object({
	id_user1: z.number({ required_error: "El id del usuario es requerido" }),
	id_location: z.number({
		required_error: "El id de la locacion es requerido",
	}),
	travel_date: z.string({ required_error: "La fecha es requerida" }),
	id_transportation: z.number({
		required_error: "El id del trasnporte es requerido",
	}),
	companions: z.number({ required_error: "Los compañeros son requeridos" }),
});
