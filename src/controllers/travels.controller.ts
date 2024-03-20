import {
  PrismaClient,
  Travels,
  det_Expenses,
  det_Extras,
  Travel_Request,
} from "@prisma/client";
import { Request, Response } from "express";

import {
  getTravel,
  getOneUser,
  getLocation,
  getRequestTravel,
  getExtras,
} from "../lib/travels.lib";

const prisma = new PrismaClient();

const Travel = prisma.travels;
const Location = prisma.cat_Locations;
const Extra = prisma.det_Extras;
const Expenses = prisma.det_Expenses;
const RequestTravel = prisma.travel_Request;
const Images = prisma.img_Users;

export const registerNewTravel = async (req: Request, res: Response) => {
  const {
    id_user1,
    id_location,
    travel_date,
    id_transportation,
    companions,
  }: Travels = req.body;
  const { quantity, expense }: det_Expenses = req.body;
  const { extra_commentary }: det_Extras = req.body;
  const extra = extra_commentary;
  let expenseSaved;
  let extraSaved;
  try {
    const getUser = await getOneUser(id_user1);
    const getLocation = await Location.findUnique({
      where: { id: id_location },
    });
    if (!getLocation || !getUser) {
      return res.status(400).json(["No se encontro el usuario o la ubicacion"]);
    }
    if (quantity) {
      expenseSaved = await Expenses.create({
        data: {
          id_user1,
          expense,
          quantity,
        },
      });
    }
    if (extra) {
      extraSaved = await Extra.create({
        data: {
          extra_commentary,
        },
      });
    }

    const travelSaved = await Travel.create({
      data: {
        id_user1,
        id_location,
        travel_date,
        id_transportation,
        id_extras: extraSaved ? extraSaved.id : null,
        companions,
      },
    });
    await Expenses.update({
      where: { id: expenseSaved?.id },
      data: {
        id_travel: travelSaved.id,
      },
    });
    return res.status(200).json([`Se han registrado los datos con exito`]);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};
export const addSecondUser = async (req: Request, res: Response) => {
  const { id_user2, id_travel, id_request } = req.body;
  try {
    const travelFound = await getTravel(id_travel);
    const userFound = await getOneUser(id_user2);
    const requestFound = await RequestTravel.findFirst({
      where: {
        id_travel,
        isActive: true,
      },
    });

    if (!travelFound || !userFound) {
      return res.status(400).json(["No se encontro el viaje o el usuario"]);
    }
    if (requestFound?.isActive === false) {
      return res
        .status(401)
        .json(["Ya se acepto la solicitud para este viaje"]);
    }

    const travelUpdated = await Travel.update({
      where: {
        id: id_travel,
      },
      data: {
        id_user2,
        isActive: false,
      },
    });
    const requestUpdated = await RequestTravel.update({
      where: {
        id: id_request,
        AND: {
          isActive: true,
        },
      },
      data: {
        isActive: false,
      },
    });

    const data = {
      travel: travelUpdated,
      request: requestUpdated,
    };

    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error.message);
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};

//añadir urgente
export const deleteSecondUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const travelFound = await getTravel(id);
    if (!travelFound) {
      res.status(400).json(["No se encontro el viaje"]);
    }
    const travelUpdated = await Travel.update({
      where: {
        id,
      },
      data: {
        id_user2: null,
      },
    });
    return res.status(200).json(travelUpdated);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};

export const deleteTravel = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const travelFound = await getTravel(id);
    if (!travelFound) {
      res.status(400).json(["No se encontro el viaje"]);
    }
    await Travel.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
    });
    return res.status(200).json(`Se ha eliminado el viaje`);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};

export const getAllExtras = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const extras = await Extra.findUnique({ where: { id } });
    return res.status(200).json(extras);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};

export const addTravelRequest = async (req: Request, res: Response) => {
  const { id_user1, id_user2, id_travel }: Travel_Request = req.body;
  try {
    const travelFound = await getTravel(id_travel);
    const user1Found = await getOneUser(id_user1);
    const user2Found = await getOneUser(id_user2);
    if (!user1Found) {
      return res.status(404).json(["No se encontro al usuario"]);
    }
    if (!user2Found) {
      return res.status(404).json(["Tu usuario no existe"]);
    }
    if (!travelFound) {
      return res.status(404).json(["No se encontro el viaje"]);
    }
    const requestFound = await RequestTravel.findFirst({
      where: { id_user2: id_user2, isActive: true, id_user1: id_user1 },
    });
    if (requestFound) {
      return res.status(401).json(["Ya tienes una solicitud pendiente"]);
    }

    const requestSaved = await RequestTravel.create({
      data: {
        id_user1,
        id_user2,
        id_travel,
      },
    });

    const requestTravel = await getTravel(requestSaved.id_travel);
    const requestLocation = await getLocation(travelFound.id_location);

    const requestUser = await getOneUser(requestSaved.id_user2);

    const objData = {
      request: requestSaved,
      travel: requestTravel,
      locations: requestLocation,
      users: requestUser,
    };

    return res.status(200).json(objData);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};

export const declineRequest = async (req: Request, res: Response) => {
  const { id_request } = req.body;
  try {
    const requestFound = await getRequestTravel(id_request);
    if (!requestFound) {
      return res.status(404).json(["No se encontro la solicitud"]);
    }
    const requestUpdated = await RequestTravel.update({
      where: {
        id: id_request,
      },
      data: {
        isActive: false,
      },
    });
    return res.status(200).json(requestUpdated);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};

export const getTravelsI = async (req: Request, res: Response) => {
  const { id } = req.params;
  const expenses = [];
  const locations = [];
  const extras = [];
  try {
    const travelsFoundUser1 = await Travel.findMany({
      where: {
        id_user1: id,
        isActive: false,
      },
    });
    const travelsFoundUser2 = await Travel.findMany({
      where: {
        id_user2: id,
        isActive: false,
      },
    });
    if (!travelsFoundUser1 && !travelsFoundUser2) {
      return res.status(200).json(["No hay viajes"]);
    }
    for (let index = 0; index < travelsFoundUser1.length; index++) {
      if (travelsFoundUser1[index]) {
        const expensesFound = await Expenses.findMany({
          where: { id: travelsFoundUser1[index].id },
        });
        expenses.push(expensesFound);
        const locationFound = await getLocation(
          travelsFoundUser1[index].id_location
        );
        locations.push(locationFound);
        const extrasFound = await getExtras(
          travelsFoundUser1[index].id_extras as string
        );
        if (extrasFound) {
          extras.push(extrasFound);
        }
      }
    }
    const data = {
      travels: travelsFoundUser1,
      sharedTravels: travelsFoundUser2,
      locations: locations,
      expenses: expenses,
      extras: extras,
    };
    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};
export const getTravelsA = async (req: Request, res: Response) => {
  const { id } = req.params;
  const expenses1 = [];
  const locations1 = [];
  const extras1 = [];
  const expenses2 = [];
  const locations2 = [];
  const extras2 = [];
  const usersU1 = [];
  const usersU2 = [];
  try {
    const travelsFoundUser1 = await Travel.findMany({
      where: {
        id_user1: id,
        isActive: true,
      },
    });
    const travelsFoundUser2 = await Travel.findMany({
      where: {
        id_user2: id,
        isActive: true,
      },
    });
    if (!travelsFoundUser1 && !travelsFoundUser2) {
      return res.status(200).json(["No hay viajes"]);
    }
    for (let index = 0; index < travelsFoundUser1.length; index++) {
      if (travelsFoundUser1[index]) {
        const expensesFound = await Expenses.findMany({
          where: { id: travelsFoundUser1[index].id },
        });
        expenses1.push(expensesFound);
        const locationFound = await getLocation(
          travelsFoundUser1[index].id_location
        );
        locations1.push(locationFound);
        const extrasFound = await getExtras(
          travelsFoundUser1[index].id_extras as string
        );
        if (extrasFound) {
          extras1.push(extrasFound);
        }
        const usersFound = await getOneUser(
          travelsFoundUser1[index].id_user2 as string
        );
        if (usersFound) {
          usersU1.push(usersFound);
        }
      }
    }
    for (let index = 0; index < travelsFoundUser2.length; index++) {
      if (travelsFoundUser2[index]) {
        const expensesFound = await Expenses.findMany({
          where: { id: travelsFoundUser2[index].id },
        });
        expenses2.push(expensesFound);
        const locationFound = await getLocation(
          travelsFoundUser2[index].id_location
        );
        locations2.push(locationFound);
        const extrasFound = await getExtras(
          travelsFoundUser2[index].id_extras as string
        );
        if (extrasFound) {
          extras2.push(extrasFound);
        }
        const usersFound = await getOneUser(travelsFoundUser2[index].id_user1);
        if (usersFound) {
          usersU2.push(usersFound);
        }
      }
    }
    const data = {
      travels: travelsFoundUser1,
      usersU1: usersU1,
      sharedTravels: travelsFoundUser2,
      locations_user1: locations1,
      expenses_user1: expenses1,
      extras_user1: extras1,
      locations_user2: locations2,
      expenses_user2: expenses2,
      usersU2: usersU2,
      extras_user2: extras2,
    };
    return res.status(200).json(data);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};

export const getRequest = async (req: Request, res: Response) => {
  const { id } = req.params;
  const arrRequest = [];
  const arrTravels = [];
  const arrLocations = [];
  const arrUsers = [];
  const arrImges = [];
  try {
    const requestValue = await RequestTravel.findMany({
      where: { id_user1: id, isActive: true },
    });

    for (let index = 0; index < requestValue.length; index++) {
      arrRequest.push(requestValue[index]);
      const requestTravel = await getTravel(requestValue[index].id_travel);
      arrTravels.push(requestTravel);

      const requestLocation = await getLocation(
        requestTravel?.id_location as string
      );
      arrLocations.push(requestLocation);

      const requestUser = await getOneUser(requestValue[index].id_user2);
      arrUsers.push(requestUser);

      const imageFound = await Images.findUnique({
        where: {
          id: requestUser?.idProfile_img as string,
        },
      });
      arrImges.push(imageFound);
    }
    const objData = {
      request: arrRequest,
      travels: arrTravels,
      locations: arrLocations,
      users: arrUsers,
      images: arrImges,
    };
    return res.status(200).json(objData);
  } catch (error: any) {
    console.log(error);
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};
