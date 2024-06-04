import { z } from "zod";

export const locationSchema = z.object({
	location_name: z
		.string({ required_error: "El nombre es Requerido" })
		.min(1, { message: "Debe haber por lo menos un caracter" })
		.max(20, { message: "La cantidad maxima de caracteres es 20" }),
	location: z
		.string({ required_error: "La locacion es Requerida" })
		.min(1, { message: "Debe haber por lo menos un caracter" })
		.max(125, { message: "La cantidad maxima de caracteres es 125" }),
	description: z
		.string({ required_error: "La descripcion es requerida" })
		.min(1, { message: "Debe haber por lo menos un caracter" })
		.max(125, { message: "La cantidad maxima de caracteres es 125" }),
	schedule: z
		.string({ required_error: "El horario es Requerido" })
		.min(1, { message: "Debe haber por lo menos un caracter" })
		.max(20, { message: "La cantidad maxima de caracteres es 20" }),
});
