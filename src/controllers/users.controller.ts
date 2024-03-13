import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { getOneUser } from "../lib/travels.lib";
import { Contact } from "../../types";

const prisma = new PrismaClient();
const User = prisma.users;
const Travel = prisma.travels;
const RequestTravel = prisma.travel_Request;
const Commentary = prisma.user_Comments;
const Chat = prisma.chat_Messages;

export const getUsersByRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const requests = await RequestTravel.findMany({ where: { id_user1: id } });
    const userid = [];
    const usersFoundArr = [];
    for (let index = 0; index < requests.length; index++) {
      userid.push(requests[index].id_user2);
      if (userid[index]) {
        const userFound = await User.findUnique({
          where: { id: userid[index] },
        });
        usersFoundArr.push(userFound);
      }
    }
    res.status(200).json(usersFoundArr);
  } catch (error) {
    res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const registerNewCommentary = async (req: Request, res: Response) => {
  const { commentary_text, id_userComented, id_userComent, rate } = req.body;
  try {
    await Commentary.create({
      data: {
        comentary_text: commentary_text,
        id_userComented,
        id_userComent,
        rate,
      },
    });
    res.status(200).json(["Comentario guardado"]);
  } catch (error) {
    console.log(error);
    res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const getComentariesByID = async (req: Request, res: Response) => {
  const { id } = req.params;
  console.log(id);
  const arrUsers = [];
  const arrCommentaries = [];
  try {
    const commentariesFound = await Commentary.findMany({
      where: { id_userComented: id },
    });
    if (commentariesFound.length > 0) {
      for (let index = 0; index < commentariesFound.length; index++) {
        arrCommentaries.push(commentariesFound[index]);
        const userFound = await getOneUser(
          arrCommentaries[index].id_userComent
        );
        arrUsers.push(userFound);
      }
      const data = {
        users: arrUsers,
        commentaries: arrCommentaries,
      };
      return res.status(200).json(data);
    }
    return res.status(200).json([]);
  } catch (error) {
    console.log(error);
    return res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const getContacts = async (req: Request, res: Response) => {
  const { id } = req.params;
  const contacts = [];
  try {
    const travelFoundU1 = await Travel.findMany({
      where: { id_user1: id },
    });
    const travelFoundU2 = await Travel.findMany({
      where: { id_user2: id },
    });
    for (let index = 0; index < travelFoundU1.length; index++) {
      if (travelFoundU1[index]) {
        const userFound = await getOneUser(
          travelFoundU1[index]?.id_user2 as string
        );
        if (userFound) {
          const dataContactsU1 = {
            id: userFound.id,
            name: userFound.name,
            userName: userFound.userName,
            lastName: userFound.lastName,
            email: userFound.email,
          };
          contacts.push(dataContactsU1);
        }
      }
    }
    for (let index = 0; index < travelFoundU2.length; index++) {
      if (travelFoundU2[index]) {
        const userFound = await getOneUser(travelFoundU2[index].id_user1);
        if (userFound) {
          const dataContactsU2 = {
            id: userFound.id,
            name: userFound.name,
            userName: userFound.userName,
            lastName: userFound.lastName,
            email: userFound.email,
          };
          contacts.push(dataContactsU2);
        }
      }
    }
    const uniqueContacts = contacts.reduce((unique, contact) => {
      const existingContact = unique.find(
        (item: Contact) => item.id === contact.id
      );
      if (!existingContact) {
        unique.push(contact as never);
      }
      return unique;
    }, []);
    res.status(200).json(uniqueContacts);
  } catch (error) {
    console.log(error);
    res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  const { id_user1, id_user2 } = req.body;
  try {
    const messages = await Chat.findMany({
      where: {
        users: {
          array_contains: [id_user1, id_user2],
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    const PMessages = messages.map((message) => {
      return {
        fromSelf: message.id_user1 === id_user1,
        message: message.message,
      };
    });
    res.status(200).json(PMessages);
  } catch (error: any) {
    console.log(error.message);
    res.status(500).json(["Ha ocurrido un error"]);
  }
};

export const registerNewMessage = async (req: Request, res: Response) => {
  const { id_user1, id_user2, message } = req.body;
  try {
    const messageSaved = await Chat.create({
      data: {
        id_user1,
        id_user2,
        users: [id_user1, id_user2],
        message,
      },
    });
    return res.status(200).json(messageSaved);
  } catch (error) {
    console.log(error);
    return res.status(500).json(["Ha ocurrido un error"]);
  }
};
