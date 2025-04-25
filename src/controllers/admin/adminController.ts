// src/controllers/admin/adminController.ts
import { Request, Response, NextFunction } from 'express';
import AdminModel from '../../models/adminModel';
import userModel from '../../models/userModel';
import {
  createAdmin,
  getAdminById,
  updateAdmin,
} from '../../services/adminService';
import { uploadFileBufferToS3 } from '../../services/s3UploadHelpter';
import { StatusCodes } from '../../utils/httpStatuses';

export const getAdminByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const admin = await getAdminById(req.params.id);
    res.status(StatusCodes.OK).json(admin);
  } catch (err) {
    next(err);
  }
};

export const createAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (typeof req.body.address === 'string') {
      const raw = req.body.address.trim();
      if (raw === '') {
        // no address provided
        delete req.body.address;
      } else {
        try {
          req.body.address = JSON.parse(raw);
        } catch {
          res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Invalid JSON in "address" field',
          });
        }
      }
    }

    // 2) extract the raw file (in memory)
    const file = req.file as Express.Multer.File | undefined;

    // 3) create the admin & user
    const newAdmin = await createAdmin(req.body);

    // 4) if there was a profileImage, now upload it under the newAdmin._id
    if (file) {
      const url = await uploadFileBufferToS3(
        file.buffer,
        file.originalname,
        'users',
        newAdmin._id.toString(),
        file.mimetype,
      );
      // save URL back to the User document
      await userModel.findByIdAndUpdate(newAdmin.user, { profileImage: url });
    }

    // 5) re-fetch the fully populated Admin (so your pre-find hook runs)
    const populated = await AdminModel.findById(newAdmin._id).lean();
    res.status(StatusCodes.CREATED).json(populated);
  } catch (err) {
    next(err);
  }
};

export const updateAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (typeof req.body.address === 'string') {
      const raw = req.body.address.trim();
      if (raw === '') {
        // no address provided
        delete req.body.address;
      } else {
        try {
          req.body.address = JSON.parse(raw);
        } catch {
          res.status(400).json({
            status: 'error',
            statusCode: 400,
            message: 'Invalid JSON in "address" field',
          });
        }
      }
    }

    // if multer-s3 placed location on req.file, copy it into body
    if (req.file && (req.file as any).location) {
      req.body.profileImage = (req.file as any).location;
    }

    const updated = await updateAdmin(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updated);
  } catch (err) {
    next(err);
  }
};
