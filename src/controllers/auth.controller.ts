import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createAccessToken } from "../lib/jwt.lib";
import { Request, Response } from "express";
import { PrismaClient, Users } from "@prisma/client";
import { getUserData, verifyGoogleToken } from "../lib/google.lib";
import { OAuth2Client } from "google-auth-library";
import mailgun from "../lib/mailgun.lib";
import { UploadApiResponse, v2 as cloudinary } from "cloudinary";
import Mailgun from "mailgun-js";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});
const prisma = new PrismaClient();

const User = prisma.users;
const OTP = prisma.oTP;
const img_User = prisma.img_Users;
const SECRET_KEY = process.env.SECRET_KEY;

export const register = async (req: Request, res: Response) => {
	const {
		name,
		lastName,
		secondLastName,
		userName,
		email,
		password,
		isAdmin,
	}: Users = req.body;
	try {
		const userFound = await User.findFirst({
			where: { email: email },
			select: { id: true },
		});
		const userNameFound = await User.findFirst({ where: { userName } });
		if (userFound) {
			return res
				.status(400)
				.json(["Ese correo ha sido anteriormente registrado"]);
		}
		if (userNameFound) {
			return res
				.status(400)
				.json(["Ese nombre de usuario ha sido anteriormente registrado"]);
		}
		//Se encripta la contraseña
		const hash = await bcrypt.hash(password ? password : "", 12);
		const otp = Math.floor(Math.random() * (9999 - 1000) + 1000);

		const newOTP = await OTP.create({
			data: {
				otp,
			},
		});
		const newProfileImg = await img_User.create({
			data: {
				image:
					"https://res.cloudinary.com/dpeb20cjo/image/upload/v1710106219/perfil-de-usuario_obck36.webp",
			},
		});
		const newUser = await User.create({
			data: {
				name,
				lastName,
				secondLastName,
				userName,
				email,
				password: hash,
				isAdmin,
				idOTP: newOTP.id,
				idProfile_img: newProfileImg.id,
			},
		});
		const token = await createAccessToken(
			{ otp: newOTP.otp, id: newUser.id },
			"1w"
		);

		const otpUpdated = await OTP.update({
			where: {
				id: newOTP.id,
			},
			data: {
				token: token as string,
			},
		});
		const from = process.env.SENDER_EMAIL;

		if (newUser.isAdmin) {
			await User.update({
				where: {
					id: newUser.id,
				},
				data: {
					isActive: true,
					isVerified: true,
				},
			});
			return res.status(201).json({
				message: "El administrador se ha registrado exitosamente",
			});
		}
		await new Promise((resolve, reject) => {
			mailgun.messages().send(
				{
					from,
					to: newUser.email,
					subject: "Tripy - Verificación de correo",
					text: `Este es el otp de tu registro: ${otpUpdated.otp}`,
					html: `<body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">
	
				<h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>
	
				<h2 style="color: #333; margin-bottom: 20px;">Este es tu codigo de verificación:</h2>
	
				<div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); display: inline-block;">
					<p style="color: #555; font-size: 18px; margin-bottom: 40px; font-weight: bold; color: #007bff;">${otpUpdated.otp}</p>
				</div>
	
				<div style="color: black; margin-top: 15px;">
					<p>Ingresa este codigo de verificacion en la pagina de tripy para finalizar tu registro</p>
				</div>
	
				<footer style="color: #888; margin-top: 20px;">
					<p>Por favor, no compartas este código con nadie. Si no realizaste esta acción, por favor, contacta con nosotros.</p>
				</footer>
	
			</body>`,
				},
				(err: Mailgun.Error, body: Mailgun.messages.SendResponse) => {
					if (err) {
						reject(err);
					}
					resolve(body);
				}
			);
		});

		res.cookie("verify", token);
		return res.status(200).json({
			id: newUser.id,
			name: newUser.name,
			lastName: newUser.lastName,
			secondLastName: newUser.secondLastName,
			userName: newUser.userName,
			email: newUser.email,
			profileImg: newProfileImg?.image,
			isAdmin: newUser.isAdmin,
			verify: token,
		});
	} catch (error: any) {
		//Se envia un estatus 500 en caso de que falle el servidor
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const login = async (req: Request, res: Response) => {
	//Se obtiene el email y la contraseña de la peticion
	const { email, password } = req.body;

	try {
		//Se busca si ya existe el usuario
		const userFound = await User.findFirst({ where: { email } });

		if (!userFound) {
			//Si no existe se envia un estatus 404 de que no se ha do el usuario
			return res.status(404).json({ message: "Usuario no encontrado" });
		}
		//Se compara la contraseña obtenida con la guardada en la base de datos
		const userPass = userFound.password != null ? userFound.password : "";
		const isMatch = await bcrypt.compare(password, userPass);

		if (!isMatch) {
			//Si no coinciden se envia un estatus 400
			return res.status(400).json({ message: "Contraseña incorrecta" });
		}
		if (!userFound.isActive) {
			return res.status(401).json({ message: "Usuario inactivo" });
		}

		if (!userFound.isVerified) {
			return res.status(401).json({
				message: "El usuario aun no ha sido validado por un administrador",
			});
		}

		const profileImg = await img_User.findUnique({
			where: {
				id: userFound.idProfile_img as string,
			},
		});

		const token = await createAccessToken({ id: userFound.id }, "1w");
		res.cookie("token", token, {
			sameSite: "none",
			secure: true,
			maxAge: 1000 * 60 * 60 * 24,
			httpOnly: true,
		});
		return res.json({
			id: userFound.id,
			name: userFound.name,
			lastName: userFound.lastName,
			secondLastName: userFound.secondLastName,
			userName: userFound.userName,
			email: userFound.email,
			profileImg: profileImg?.image,
			isAdmin: userFound.isAdmin,
			token: token,
		});
	} catch (error: any) {
		//Se envia un estatus 500 en caso de que falle el servidor
		return res.status(500).json({ message: error.message });
	}
};

//Se crea el logout
export const logout = (_req: Request, res: Response) => {
	res.cookie("token", "", {
		expires: new Date(0),
	});
	return res.sendStatus(200);
};

export const profile = async (req: Request, res: Response) => {
	const { id } = req.params;
	const userFound = await User.findUnique({ where: { id: id } });
	if (!userFound) {
		return res.status(404).json(["Usuario no encontrado"]);
	}
	return res.json({
		id: userFound.id,
		name: userFound.name,
		lastName: userFound.lastName,
		secondLastName: userFound.secondLastName,
		userName: userFound.userName,
		email: userFound.email,
		isAdmin: userFound.isAdmin,
		createdAt: userFound.createdAt,
	});
};

//Se crea una funcion para verificar el token que se ingrese
export const verifyToken = async (req: Request, res: Response) => {
	try {
		const { token } = req.cookies;
		console.log(token);
		if (!token) {
			console.log("no hay token");
			return res.status(401).json({ message: "No autorizado" });
		}
		const tokenGoogle = await verifyGoogleToken(token);

		if (tokenGoogle != "Error") {
			const userStoled = await User.findFirst({
				where: { email: tokenGoogle.email as string },
			});
			const image = await img_User.findUnique({
				where: {
					id: userStoled?.idProfile_img as string,
				},
			});
			return res.status(200).json({
				id: userStoled?.id,
				name: userStoled?.name,
				lastName: userStoled?.lastName,
				secondLastName: userStoled?.secondLastName,
				userName: userStoled?.userName,
				email: userStoled?.email,
				profileImg: image?.image,
				isAdmin: userStoled?.isAdmin,
			});
		}

		const key = SECRET_KEY != undefined ? SECRET_KEY : "secret";
		jwt.verify(token, key, async (err: any, user: any) => {
			if (err) {
				console.log("error al validar");
				return res.status(401).json({ message: "No autorizado" });
			}
			const userFound = await User.findFirst({
				where: { id: user.id, isActive: true, isVerified: true },
			});
			if (!userFound) {
				console.log("sin usuario");
				return res.status(401).json({ message: "No autorizado" });
			}
			const profileImg = await img_User.findUnique({
				where: {
					id: userFound.idProfile_img as string,
				},
			});
			return res.json({
				id: userFound.id,
				name: userFound.name,
				lastName: userFound.lastName,
				secondLastName: userFound.secondLastName,
				userName: userFound.userName,
				email: userFound.email,
				profileImg: profileImg?.image,
				isAdmin: userFound.isAdmin,
			});
		});
		return;
	} catch (error) {
		console.log(error);
		return res.status(500).json(["Error al verificar el token"]);
	}
};

export const verifyTokenMovil = async (req: Request, res: Response) => {
	try {
		const { token } = req.body;
		console.log(token);
		if (!token) {
			return res.status(401).json({ message: "No autorizado" });
		}
		const tokenGoogle = await verifyGoogleToken(token);

		if (tokenGoogle != "Error") {
			const userStoled = await User.findFirst({
				where: { email: tokenGoogle.email as string },
			});
			const image = await img_User.findUnique({
				where: {
					id: userStoled?.idProfile_img as string,
				},
			});
			return res.status(200).json({
				id: userStoled?.id,
				name: userStoled?.name,
				lastName: userStoled?.lastName,
				secondLastName: userStoled?.secondLastName,
				userName: userStoled?.userName,
				email: userStoled?.email,
				profileImg: image?.image,
				isAdmin: userStoled?.isAdmin,
			});
		}

		const key = SECRET_KEY != undefined ? SECRET_KEY : "secret";
		jwt.verify(token, key, async (err: any, user: any) => {
			if (err) {
				return res.status(401).json({ message: "No autorizado" });
			}
			const userFound = await User.findFirst({
				where: { id: user.id, isActive: true, isVerified: true },
			});
			if (!userFound) {
				return res.status(401).json({ message: "No autorizado" });
			}
			const profileImg = await img_User.findUnique({
				where: {
					id: userFound.idProfile_img as string,
				},
			});
			return res.json({
				id: userFound.id,
				name: userFound.name,
				lastName: userFound.lastName,
				secondLastName: userFound.secondLastName,
				userName: userFound.userName,
				email: userFound.email,
				profileImg: profileImg?.image,
				isAdmin: userFound.isAdmin,
			});
		});
		return;
	} catch (error) {
		console.log(error);
		return res.status(500).json(["Error al verificar el token"]);
	}
};

export const editUserAcount = async (req: Request, res: Response) => {
	const { email, oldPassword, newPassword, userName, id } = req.body;
	const file = req.file;

	try {
		const userFound = await User.findUnique({ where: { id } });
		if (!userFound) {
			return res.status(404).json(["Usuario no encontrado"]);
		}
		if (file) {
			const response_img: UploadApiResponse | undefined = await new Promise(
				(resolve, reject) => {
					cloudinary.uploader
						.upload_stream({}, (error, result) => {
							if (error) {
								reject(error);
							}
							resolve(result);
						})
						.end(file?.buffer);
				}
			);
			await img_User.update({
				where: {
					id: userFound.idProfile_img as string,
				},
				data: {
					image: response_img?.secure_url,
				},
			});
		}

		const compare = await bcrypt.compare(
			oldPassword,
			userFound.password as string
		);

		if (!compare) {
			return res.status(400).json(["Contraseña incorrecta"]);
		}
		const hash = await bcrypt.hash(newPassword, 12);

		const userUpdated = await User.update({
			where: { id: id },
			data: {
				email: email ? email : userFound.email,
				password: hash ? hash : userFound.password,
				userName: userName ? userName : userFound.userName,
			},
		});
		return res.status(200).json({
			id: userUpdated.id,
			name: userUpdated.name,
			lastName: userUpdated.lastName,
			secondLastName: userUpdated.secondLastName,
			userName: userUpdated.userName,
			email: userUpdated.email,
			isAdmin: userUpdated.isAdmin,
		});
		return;
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const getAuthorizedURL = async (_req: Request, res: Response) => {
	res.header("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN);

	res.header("Referer-Policy", "no-referrer-when-downgrade");

	const redirectUrl = process.env.GOOGLE_REDIRECT_URL;

	const oAuth2Client = new OAuth2Client(
		process.env.CLIENT_ID,
		process.env.CLIENT_SECRET,
		redirectUrl
	);

	const authorizeUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope:
			"https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid",
		prompt: "consent",
	});
	res.json({ url: authorizeUrl });
};

export const googleAuth = async (req: Request, res: Response) => {
	const code = req.query.code;
	try {
		const redirectUrl = process.env.GOOGLE_REDIRECT_URL;
		const oAuth2Client = new OAuth2Client(
			process.env.CLIENT_ID,
			process.env.CLIENT_SECRET,
			redirectUrl
		);
		const _code = code as string;
		const response = await oAuth2Client.getToken(_code);
		await oAuth2Client.setCredentials(response.tokens);
		const user = oAuth2Client.credentials;
		const data = await getUserData(user.access_token);

		const userFound = await User.findFirst({ where: { email: data.email } });
		if (!userFound) {
			console.log(data);
			const surnames = data.given_name.split(" ");
			const name = data.name as string;
			const lastName = surnames[0] as string;
			const secondLastName = surnames[1] ? surnames[1] : null;
			const userName = data.name as string;
			const email = data.email;
			const image = data.picture;

			const profileImg = await img_User.create({
				data: {
					image,
				},
			});

			await User.create({
				data: {
					name,
					lastName,
					secondLastName,
					userName,
					email,
					isActive: true,
					idProfile_img: profileImg.id,
				},
			});
			console.log("Usuario creado correctamente");
		} else {
			console.log("El usuario ya existe");
		}
		const urlEncodedToken = encodeURIComponent(user.id_token as string);

		res.redirect(
			`${process.env.ALLOWED_ORIGIN}/redirectRoute/?token=${urlEncodedToken}`
		);
	} catch (error: any) {
		console.log(error.message);
	}
};

export const verifyOTP = async (req: Request, res: Response) => {
	const { otp } = req.body;
	const { verify } = req.cookies;
	if (!verify || !otp) {
		return res.status(400).json(["No autorizado"]);
	}

	jwt.verify(verify, SECRET_KEY as string, async (err: any, data: any) => {
		if (err) {
			return res.status(401).json(["No autorizado"]);
		}
		const userFound = await User.findUnique({ where: { id: data.id } });
		if (!userFound) {
			return res.status(401).json(["No autorizado"]);
		}
		const idOTP = await OTP.findUnique({
			where: { id: userFound.idOTP as string },
		});

		if (verify != idOTP?.token) {
			return res.status(401).json(["No autorizado"]);
		}

		if (idOTP?.otp != otp || idOTP?.otp != data.otp) {
			console.log(`el otp es ${otp} y el userFound.otp es ${idOTP?.otp}`);
			console.log("aca llega2");
			return res.status(401).json(["No autorizado"]);
		}
		res.cookie("verify", "", {
			expires: new Date(0),
		});

		const token = await createAccessToken({ id: userFound.id }, "1h");
		res.cookie("token", token);
		await User.update({ where: { id: data.id }, data: { isActive: true } });

		const profileImg = await img_User.findUnique({
			where: {
				id: userFound.idProfile_img as string,
			},
		});
		return res.json({
			id: userFound.id,
			name: userFound.name,
			lastName: userFound.lastName,
			secondLastName: userFound.secondLastName,
			userName: userFound.userName,
			email: userFound.email,
			profileImg: profileImg?.image,
			isAdmin: userFound.isAdmin,
		});
	});
	return;
};

export const verifyOTPMovil = async (req: Request, res: Response) => {
	const { otp, verify } = req.body;
	console.log(otp);
	if (!verify || !otp) {
		return res.status(400).json(["No autorizado"]);
	}

	jwt.verify(verify, SECRET_KEY as string, async (err: any, data: any) => {
		if (err) {
			return res.status(401).json(["No autorizado"]);
		}
		const userFound = await User.findUnique({ where: { id: data.id } });
		if (!userFound) {
			return res.status(401).json(["No autorizado"]);
		}
		const idOTP = await OTP.findUnique({
			where: { id: userFound.idOTP as string },
		});

		if (verify != idOTP?.token) {
			return res.status(401).json(["No autorizado"]);
		}

		if (idOTP?.otp != otp || idOTP?.otp != data.otp) {
			console.log(`el otp es ${otp} y el userFound.otp es ${idOTP?.otp}`);
			console.log("aca llega2");
			return res.status(401).json(["No autorizado"]);
		}

		// const token = await createAccessToken({ id: userFound.id }, "1h");
		await User.update({ where: { id: data.id }, data: { isActive: true } });

		const profileImg = await img_User.findUnique({
			where: {
				id: userFound.idProfile_img as string,
			},
		});
		return res.json({
			id: userFound.id,
			name: userFound.name,
			lastName: userFound.lastName,
			secondLastName: userFound.secondLastName,
			userName: userFound.userName,
			email: userFound.email,
			profileImg: profileImg?.image,
			isAdmin: userFound.isAdmin,
		});
	});
	return;
};

export const verifyIsActive = async (req: Request, res: Response) => {
	try {
		const { verify } = req.cookies;
		const token = verify;
		if (!token) {
			return res.status(401).json({ message: "No autorizado" });
		}

		const key = SECRET_KEY != undefined ? SECRET_KEY : "secret";
		jwt.verify(token, key, async (err: any, user: any) => {
			if (err) {
				return res.status(401).json({ message: "No autorizado" });
			}
			const userFound = await User.findFirst({
				where: { id: user?.id },
			});
			if (!userFound) {
				return res.status(401).json({ message: "No autorizado" });
			}
			const profileImg = await img_User.findUnique({
				where: {
					id: userFound.idProfile_img as string,
				},
			});
			return res.json({
				id: userFound.id,
				name: userFound.name,
				lastName: userFound.lastName,
				secondLastName: userFound.secondLastName,
				userName: userFound.userName,
				email: userFound.email,
				profileImg: profileImg?.image,
				isAdmin: userFound.isAdmin,
			});
		});
		return;
	} catch (error) {
		console.log(error);
		return res.status(500).json(["Error al verificar el token"]);
	}
};

export const changeEmail = async (req: Request, res: Response) => {
	const { email } = req.body;
	const { id } = req.params;
	try {
		const userFound = await User.findUnique({ where: { id } });
		if (!userFound) {
			return res.status(400).json(["No se encontro el usuario"]);
		}
		const emailFound = await User.findFirst({ where: { email } });
		if (emailFound) {
			return res.status(400).json(["El correo ya existe"]);
		}
		const userUpdated = await User.update({
			where: {
				id: userFound.id,
			},
			data: {
				email,
			},
		});
		const otp = Math.floor(Math.random() * (9999 - 1000) + 1000);
		const token = await createAccessToken({ otp: otp, id: userUpdated.id });

		const otpUpdated = await OTP.update({
			where: {
				id: userFound.idOTP as string,
			},
			data: {
				otp,
				token: token as string,
			},
		});
		const from = process.env.SENDER_EMAIL;
		await new Promise((resolve, reject) => {
			mailgun.messages().send(
				{
					from,
					to: userFound.email,
					subject: "Tripy - Verificación de correo",
					text: `Este es el otp de tu registro: ${otpUpdated.otp}`,
					html: `
      <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">

        <h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>

        <h2 style="color: #333; margin-bottom: 20px;">Este es tu codigo de verificación:</h2>

        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); display: inline-block;">
          <p style="color: #555; font-size: 18px; margin-bottom: 40px; font-weight: bold; color: #007bff;">${otpUpdated.otp}</p>
        </div>

        <div style="color: black; margin-top: 15px;">
          <p>Ingresa este codigo de verificacion en la pagina de tripy para finalizar tu registro</p>
        </div>

        <footer style="color: #888; margin-top: 20px;">
          <p>Por favor, no compartas este código con nadie. Si no realizaste esta acción, por favor, contacta con nosotros.</p>
        </footer>

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
		res.cookie("verify", token);
		return res.status(200).json({
			id: userUpdated.id,
			name: userUpdated.name,
			lastName: userUpdated.lastName,
			secondLastName: userUpdated.secondLastName,
			userName: userUpdated.userName,
			email: userUpdated.email,
			isAdmin: userUpdated.isAdmin,
		});
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};

export const resendOTP = async (req: Request, res: Response) => {
	const { email } = req.body;
	try {
		const userFound = await User.findFirst({ where: { email } });
		if (!userFound) {
			return res.status(400).json(["No se encontro el usuario"]);
		}
		const otp = Math.floor(Math.random() * (9999 - 1000) + 1000);
		const token = await createAccessToken({ otp: otp, id: userFound.id });

		const otpUpdated = await OTP.update({
			where: {
				id: userFound.idOTP as string,
			},
			data: {
				otp,
				token: token as string,
			},
		});
		const from = process.env.SENDER_EMAIL;
		await new Promise((resolve, reject) => {
			mailgun.messages().send(
				{
					from,
					to: userFound.email,
					subject: "Tripy - Verificación de correo",
					text: `Este es el otp de tu registro: ${otpUpdated.otp}`,
					html: `
      <body style="font-family: 'Arial', sans-serif; background-color: #f4f4f4; text-align: center; padding: 20px;">

        <h1 style="color: #007bff; margin-bottom: 10px;">Tripy</h1>

        <h2 style="color: #333; margin-bottom: 20px;">Este es tu codigo de verificación:</h2>

        <div style="background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); display: inline-block;">
          <p style="color: #555; font-size: 18px; margin-bottom: 40px; font-weight: bold; color: #007bff;">${otpUpdated.otp}</p>
        </div>

        <div style="color: black; margin-top: 15px;">
          <p>Ingresa este codigo de verificacion en la pagina de tripy para finalizar tu registro</p>
        </div>

        <footer style="color: #888; margin-top: 20px;">
          <p>Por favor, no compartas este código con nadie. Si no realizaste esta acción, por favor, contacta con nosotros.</p>
        </footer>

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

		res.cookie("verify", token);
		return res.sendStatus(200);
	} catch (error: any) {
		console.log(error);
		return res.status(500).json([error.message]);
	}
};
