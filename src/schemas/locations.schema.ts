import { z } from "zod";
const noSpecialChars = (value: string | undefined) =>
	/^[a-zA-Z0-9 ]+$/.test(value ? value : "");

export const locationSchema = z.object({
	location_name: z
		.string({ required_error: "El nombre es Requerido" })
		.min(1, { message: "Debe haber por lo menos un caracter" })
		.max(20, { message: "La cantidad maxima de caracteres es 20" })
		.refine(noSpecialChars, {
			message:
				"El nombre de la locación no puede contener caracteres especiales",
		}),
	location: z
		.string({ required_error: "La locacion es Requerida" })
		.min(1, { message: "Debe haber por lo menos un caracter" })
		.max(125, { message: "La cantidad maxima de caracteres es 125" })
		.refine(noSpecialChars, {
			message: "La locación no puede contener caracteres especiales",
		}),
	description: z
		.string({ required_error: "La descripcion es requerida" })
		.min(1, { message: "Debe haber por lo menos un caracter" })
		.max(125, { message: "La cantidad maxima de caracteres es 125" })
		.refine(noSpecialChars, {
			message: "La descripcion no puede contener caracteres especiales",
		}),
	schedule: z
		.string({ required_error: "El horario es Requerido" })
		.min(1, { message: "Debe haber por lo menos un caracter" })
		.max(20, { message: "La cantidad maxima de caracteres es 20" }),
});
