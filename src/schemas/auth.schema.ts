//Se importa zod para hacer un esquema de registro y logueo
import { z } from "zod";
//import type { Users } from "@prisma/client"
//Se crea el esquema de registro
const noSpecialChars = (value: string) => /^[a-zA-Z0-9]+$/.test(value);
const noSpecialCharsNames = (value: string) => /^[a-zA-Z0-9 ]+$/.test(value);

export const registerSchema = z.object({
  name: z
    .string({
      required_error: "El nombre de usuario es requerido",
    })
    .refine(noSpecialCharsNames, {
      message: "El nombre no puede contener caracteres especiales",
    }),
  lastName: z
    .string({
      required_error: "El apellido paterno de usuario es requerido",
    })
    .refine(noSpecialCharsNames, {
      message: "El apellido paterno no puede contener caracteres especiales",
    }),
  secondLastName: z
    .string({
      required_error: "El apellido materno de usuario es requerido",
    })
    .refine(noSpecialChars, {
      message: "El apellido materno no puede contener caracteres especiales",
    }),
  userName: z
    .string({
      required_error: "El nombre de usuario es requerido",
    })
    .refine(noSpecialChars, {
      message: "El nombre de usuario no puede contener caracteres especiales",
    }),
  email: z
    .string({
      required_error: "El email es requerido",
    })
    .email({
      message: "Email invalido",
    }),
  password: z
    .string({
      required_error: "La contraseña requerida",
    })
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
});

//Se crea el esquema para el login
export const loginSchema = z.object({
  //Se pide el email que sea un string y email
  email: z
    .string({
      required_error: "El email es requerido",
    })
    .email({
      message: "Email invalido",
    }),
  //Se pide que la contraseña sea de minimo 8 caracteres y que sea un string
  password: z
    .string({
      required_error: "La contraseña requerida",
    })
    .min(8, {
      message: "La contraseña debe tener al menos 8 caracteres",
    }),
});
