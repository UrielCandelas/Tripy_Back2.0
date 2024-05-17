import { z } from "zod";

const noSpecialChars = (value: string | undefined) =>
	/^[a-zA-Z0-9 ]+$/.test(value ? value : "");

export const userCommentarySchema = z.object({
	commentary_text: z
		.string({ required_error: "El comentario es requerido" })
		.min(1)
		.max(125)
		.refine(noSpecialChars, {
			message: "El comentario no puede contener caracteres especiales",
		}),
});
