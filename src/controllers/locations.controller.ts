import { PrismaClient, cat_Locations, img_Locations } from "@prisma/client";
import { Request, Response } from "express";
import { resizeImage } from "../lib/sharp.lib";
import { getLocation as getOneLocation } from "../lib/travels.lib";
import { DataCards } from "../../types";
const prisma = new PrismaClient();

const Locations = prisma.cat_Locations;
const img_Locations = prisma.img_Locations;
const Transports = prisma.cat_Transport;
const Travel = prisma.travels;
const Expenses = prisma.det_Expenses;
const User = prisma.users;

export const registerLocation = async (req: Request, res: Response) => {
  const {
    location_name,
    location,
    description,
    cost,
    schedule,
  }: cat_Locations = req.body;

  const file1 = (req.files as { [fieldname: string]: Express.Multer.File[] })[
    "image1"
  ][0];

  const file2 = (req.files as { [fieldname: string]: Express.Multer.File[] })[
    "image2"
  ][0];

  try {
    const image1 = await resizeImage(file1.buffer);
    const image2 = await resizeImage(file2.buffer, 200, 300);

    const newImage1 = await img_Locations.create({
      data: {
        image: image1,
      },
    });

    const newImage2 = await img_Locations.create({
      data: {
        image: image2,
      },
    });
    await Locations.create({
      data: {
        location_name,
        location,
        description,
        cost,
        schedule,
        id_locationImage1: newImage1.id,
        id_locationImage2: newImage2.id,
      },
    });
    return res.status(200).json(["Se ha registrado la locacion con exito"]);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error}`]);
  }
};

export const editLocation = async (req: Request, res: Response) => {
  const {
    location_name,
    location,
    description,
    cost,
    schedule,
  }: cat_Locations = req.body;
  const { id } = req.params;
  const file1 = (req.files as { [fieldname: string]: Express.Multer.File[] })[
    "image1"
  ][0];

  const file2 = (req.files as { [fieldname: string]: Express.Multer.File[] })[
    "image2"
  ][0];

  try {
    const locationFound = await Locations.findUnique({ where: { id } });
    if (!locationFound) {
      return res.status(400).json(["No esta registrada la ubicacion"]);
    }

    const image1 = await resizeImage(file1.buffer);
    const image2 = await resizeImage(file2.buffer, 200, 300);

    await img_Locations.update({
      where: { id: locationFound.id_locationImage1 },
      data: {
        image: image1,
      },
    });

    await img_Locations.update({
      where: { id: locationFound.id_locationImage2 },
      data: {
        image: image2,
      },
    });
    await Locations.update({
      where: { id },
      data: {
        location_name,
        location,
        description,
        cost,
        schedule,
      },
    });
    return res.status(200).json(["Se ha editado la locacion con exito"]);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};

export const getAllLocationsAndImages1 = async (
  _req: Request,
  res: Response
) => {
  try {
    const locationsFound = await Locations.findMany();
    const imagesarr: img_Locations[] = [];

    locationsFound.map(async (location) => {
      const img = await img_Locations.findUnique({
        where: { id: location.id_locationImage1 },
      });
      imagesarr.push(img as img_Locations);
    });
    const data = {
      locations: locationsFound,
      images: imagesarr,
    };
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json([`Ocurrio un Error: ${error.message}`]);
  }
};

export const getLocation = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const locationFound = await Locations.findUnique({ where: { id } });
    if (!locationFound) {
      return res.status(400).json(["No esta registrada la ubicacion"]);
    }
    return res.status(200).json(locationFound);
  } catch (error: any) {
    return res.status(500).json([`Ocurrio un Error: ${error.message}`]);
  }
};

export const deleteLocation = async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const locationFound = await Locations.findUnique({ where: { id } });
    if (!locationFound) {
      return res.status(400).json(["No esta registrada la ubicacion"]);
    }
    await Locations.delete({ where: { id } });
    return res.status(200).json(["Se ha eliminado el registro"]);
  } catch (error: any) {
    return res.status(500).json([`Ocurrio un Error: ${error.message}`]);
  }
};

export const getAllLocationsAndImages2 = async (
  _req: Request,
  res: Response
) => {
  try {
    const locationsFound = await Locations.findMany();
    const imagesarr: img_Locations[] = [];

    locationsFound.map(async (location) => {
      const img = await img_Locations.findUnique({
        where: { id: location.id_locationImage2 },
      });
      imagesarr.push(img as img_Locations);
    });
    const data = {
      locations: locationsFound,
      images: imagesarr,
    };
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json([`Ocurrio un Error: ${error.message}`]);
  }
};

export const getLocationsAndTransports = async (
  _req: Request,
  res: Response
) => {
  try {
    const locationsFound = await Locations.findMany();
    const transportsFound = await Transports.findMany();
    if (!locationsFound || !transportsFound) {
      return res
        .status(400)
        .json(["No hay locaciones o transportes registrados"]);
    }
    const data = {
      locations: locationsFound,
      transports: transportsFound,
    };
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json([`Ocurrio un Error: ${error.message}`]);
  }
};

export const locationData = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dataCards: DataCards[] = [];
  try {
    const travels = await Travel.findMany({ where: { id_location: id } });
    const location = await getOneLocation(id);
    travels.map(async (travel) => {
      let temporal_expense = null;
      let temporal_user;
      const expense = await Expenses.findFirst({
        where: { id_travel: travel.id, id_user1: travel.id_user1 },
      });
      if (expense) {
        temporal_expense = expense;
      }
      const user = await User.findUnique({
        where: {
          id: travel.id_user1,
        },
        select: {
          id: true,
          name: true,
          cratedAt: true,
        },
      });
      temporal_user = user;

      dataCards.push({
        id: travel.id,
        usersName: temporal_user?.name,
        quantity: temporal_expense?.quantity,
        expenseName: temporal_expense?.expense,
        date: travel.travel_date,
        companions: travel.companions,
      });
    });
    const data = {
      location,
      dataCards,
    };
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json([`Ha ocurrido un error: ${error.message}`]);
  }
};
