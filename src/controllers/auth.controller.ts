import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createAccessToken } from "../lib/jwt.lib";
import { Request, Response } from "express";
import { PrismaClient, Users } from "@prisma/client";
import { getUserData, verifyGoogleToken } from "../lib/google.lib";
import { OAuth2Client } from "google-auth-library";
import transporter from "../lib/otp.lib";
const prisma = new PrismaClient();

const User = prisma.users;
const OTP = prisma.oTP;
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
      },
    });
    const token = await createAccessToken({ id: newUser.id });

    const otpUpdated = await OTP.update({
      where: {
        id: newOTP.id,
      },
      data: {
        token: token != undefined ? token : "",
      },
    });
    const from = process.env.SENDER_EMAIL;

    await transporter.sendMail({
      from,
      to: newUser.email,
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
    });
    res.cookie("verify", token);
    return res.sendStatus(200);
  } catch (error: any) {
    //Se envia un estatus 500 en caso de que falle el servidor
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
    const token = await createAccessToken({ id: userFound.id }, "1h");
    res.cookie("token", token);
    return res.json({
      id: userFound.id,
      username: userFound.userName,
      email: userFound.email,
      createdAt: userFound.cratedAt,
      updatedAt: userFound.updatedAt,
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
    createdAt: userFound.cratedAt,
  });
};

//Se crea una funcion para verificar el token que se ingrese
export const verifyToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ message: "No autorizado" });
    }
    const tokenGoogle = await verifyGoogleToken(token);

    if (tokenGoogle != "Error") {
      return res
        .status(200)
        .json({ name: tokenGoogle.name, email: tokenGoogle.email });
    }

    const key = SECRET_KEY != undefined ? SECRET_KEY : "secret";
    jwt.verify(token, key, async (err: any, user: any) => {
      if (err) {
        return res.status(401).json({ message: "No autorizado" });
      }
      const userFound = await User.findFirst({ where: { id: user.id } });
      if (!userFound) {
        return res.status(401).json({ message: "No autorizado" });
      }
      return res.json({
        id: userFound.id,
        username: userFound.userName,
        email: userFound.email,
      });
    });
    return res.sendStatus(200);
  } catch (error) {
    console.log(error);
    return res.status(500).json(["Error al verificar el token"]);
  }
};

export const verifyTokenMovil = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json(["No autorizado"]);
  }
  const key = SECRET_KEY != undefined ? SECRET_KEY : "secret";

  jwt.verify(token, key, async (err: any, user: any) => {
    if (err) {
      return res.status(401).json(["No autorizado"]);
    }
    const userFound = await User.findUnique({ where: { id: user.id } });
    if (!userFound) {
      return res.status(404).json(["No autorizado"]);
    }
    return res.json({
      id: userFound.id,
      name: userFound.name,
      lastName: userFound.lastName,
      secondLastName: userFound.secondLastName,
      userName: userFound.userName,
      email: userFound.email,
      isAdmin: userFound.isAdmin,
    });
  });
  return res.sendStatus(200);
};

export const editUserAcount = async (req: Request, res: Response) => {
  const { email, newEmail, password, newPassword, userName, id } = req.body;
  try {
    const userFound = await User.findFirst({ where: { email } });
    if (!userFound) {
      return res.status(404).json(["Usuario no encontrado"]);
    }
    const userPass: string =
      userFound.password != null ? userFound.password : "";

    const compare = await bcrypt.compare(password, userPass);

    if (!compare) {
      return res.status(400).json(["Contraseña incorrecta"]);
    }
    const hash = await bcrypt.hash(newPassword, 12);
    const userUpdated = await User.update({
      where: { id: id },
      data: {
        email: newEmail ? newEmail : userFound.email,
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
  } catch (error: any) {
    console.log(error);
    return res.status(500).json([error.message]);
  }
};

export const getAuthorizedURL = async (_req: Request, res: Response) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");

  res.header("Referer-Policy", "no-referrer-when-downgrade");

  const redirectUrl = "http://127.0.0.1:3000/api/oauth";

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
    const redirectUrl = "http://127.0.0.1:3000/api/oauth";
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
      const surnames = data.given_name.split(" ");
      const name: string = data.name as string;
      const lastName: string = surnames[0] as string;
      const secondLastName: string = surnames[1] ? surnames[1] : null;
      const userName: string = data.name as string;
      const email: string = data.email;

      await User.create({
        data: {
          name,
          lastName,
          secondLastName,
          userName,
          email,
          idOTP: "",
        },
      });
      console.log("Usuario creado correctamente");
    } else {
      console.log("El usuario ya existe");
    }
    const urlEncodedToken = encodeURIComponent(user.id_token as string);
    res.redirect(
      `http://localhost:5173/redirectRoute/?token=${urlEncodedToken}`
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
      console.log(err);
      return res.status(401).json(["No autorizado"]);
    }
    const userFound = await User.findUnique({ where: { id: data.id } });
    if (!userFound) {
      return res.status(401).json(["No autorizado"]);
    }
    const idOTP = await OTP.findUnique({ where: { id: userFound.idOTP } });

    if (idOTP?.otp != otp || idOTP?.otp != data.otp) {
      //console.log(`el otp es ${otp} y el userFound.otp es ${idOTP}`);
      console.log("aca llega2");
      return res.status(401).json(["No autorizado"]);
    }
    res.cookie("verify", "", {
      expires: new Date(0),
    });

    await User.findUnique({ where: { id: data.id } });

    return res.sendStatus(200);
  });
  return res.sendStatus(200);
};

export const verifyIsActive = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const userFound = await User.findUnique({ where: { id } });

    if (userFound?.isActive) {
      return res.status(200).json(true);
    }
    return res.status(200).json(false);
  } catch (error) {
    return res.status(500).json(["Error"]);
  }
};
