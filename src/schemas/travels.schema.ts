import { z } from "zod";
/*const noSpecialChars = (value: string | undefined) =>
  /^[a-zA-Z0-9]+$/.test(value ? value : "");*/

export const createTravelSchema = z.object({
	id_user1: z.string({ required_error: "El id del usuario es requerido" }),
	id_location: z.string({
		required_error: "El id de la locacion es requerido",
	}),
	travel_date: z
		.string({
			required_error: "La fecha es requerida",
			invalid_type_error: "La fecha es requerida",
		})
		.min(10, {
			message: "Ingrese la fecha",
		}),
	expense: z.string({ required_error: "El gasto es requerido" }).min(5, {
		message: "El gasto es requerido",
	}),
	quantity: z.number({
		required_error: "La cantidad es requerida",
		invalid_type_error: "El gasto debe ser un valor numerico",
	}),
	extra: z.string().optional(),
	companions: z.number({
		required_error: "Los acompañantes son requeridos",
		invalid_type_error:
			"La cantidad de acompañantes deben ser un valor numerico",
	}),
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
	companions: z.number({
		required_error: "Los acompañantes son requeridos",
		invalid_type_error:
			"La cantidad de acompañantes deben ser un valor numerico",
	}),
});
