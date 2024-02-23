import { z } from "zod";

const noSpecialChars = (value: string) => /^[a-zA-Z0-9]+$/.test(value);

export const locationCommentarySchema = z.object({
  commentary_text: z
    .string({ required_error: "El comentarioario es requerido" })
    .min(1)
    .max(50)
    .refine(noSpecialChars, {
      message: "El comentarioario no puede contener caracteres especiales",
    }),
});
