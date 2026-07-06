import { Router } from "express";
import multer from "multer";
import { prisma } from "@life/db";
import {
  GEAR_PHOTO_MAX_BYTE_SIZE,
  gearPhotoStorageKey,
  isGearPhotoMimeType,
} from "@life/shared";
import { extractBearerToken, verifyAuthToken } from "../auth/jwt.js";
import type { FileStorage } from "../storage/types.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: GEAR_PHOTO_MAX_BYTE_SIZE, files: 1 },
});

async function requireHouseholdId(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { householdId: true },
  });

  if (!user?.householdId) {
    return null;
  }

  return user.householdId;
}

export function createGearRouter(fileStorage: FileStorage) {
  const router = Router();

  router.use(async (req, res, next) => {
    const token = extractBearerToken(req.headers.authorization);
    const user = token ? await verifyAuthToken(token) : null;

    if (!user?.id) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const householdId = await requireHouseholdId(user.id);
    if (!householdId) {
      res.status(403).json({ error: "User is not linked to a household" });
      return;
    }

    req.authUser = user;
    res.locals.householdId = householdId;
    next();
  });

  router.post("/items/:id/photo", upload.single("photo"), async (req, res) => {
    const householdId = res.locals.householdId as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No photo uploaded" });
      return;
    }

    if (!isGearPhotoMimeType(file.mimetype)) {
      res.status(400).json({ error: `Unsupported file type: ${file.mimetype}` });
      return;
    }

    const item = await prisma.gearItem.findFirst({
      where: { id: req.params.id, householdId },
    });

    if (!item) {
      res.status(404).json({ error: "Gear item not found" });
      return;
    }

    const storageKey = gearPhotoStorageKey(householdId, "items", item.id, file.originalname);
    await fileStorage.put(storageKey, file.buffer, file.mimetype);

    if (item.photoStorageKey && item.photoStorageKey !== storageKey) {
      await fileStorage.delete(item.photoStorageKey);
    }

    const saved = await prisma.gearItem.update({
      where: { id: item.id },
      data: {
        photoStorageKey: storageKey,
        photoMimeType: file.mimetype,
      },
    });

    res.status(201).json({
      id: saved.id,
      hasPhoto: Boolean(saved.photoStorageKey),
    });
  });

  router.get("/items/:id/photo", async (req, res) => {
    const householdId = res.locals.householdId as string;
    const item = await prisma.gearItem.findFirst({
      where: { id: req.params.id, householdId },
    });

    if (!item?.photoStorageKey || !item.photoMimeType) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }

    const stored = await fileStorage.get(item.photoStorageKey);
    if (!stored) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }

    res.setHeader("Content-Type", item.photoMimeType);
    res.send(stored.data);
  });

  router.delete("/items/:id/photo", async (req, res) => {
    const householdId = res.locals.householdId as string;
    const item = await prisma.gearItem.findFirst({
      where: { id: req.params.id, householdId },
    });

    if (!item) {
      res.status(404).json({ error: "Gear item not found" });
      return;
    }

    if (item.photoStorageKey) {
      await fileStorage.delete(item.photoStorageKey);
    }

    await prisma.gearItem.update({
      where: { id: item.id },
      data: { photoStorageKey: null, photoMimeType: null },
    });

    res.status(204).end();
  });

  router.post("/variants/:id/photo", upload.single("photo"), async (req, res) => {
    const householdId = res.locals.householdId as string;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: "No photo uploaded" });
      return;
    }

    if (!isGearPhotoMimeType(file.mimetype)) {
      res.status(400).json({ error: `Unsupported file type: ${file.mimetype}` });
      return;
    }

    const variant = await prisma.gearVariant.findFirst({
      where: { id: req.params.id, class: { householdId } },
    });

    if (!variant) {
      res.status(404).json({ error: "Gear variant not found" });
      return;
    }

    const storageKey = gearPhotoStorageKey(householdId, "variants", variant.id, file.originalname);
    await fileStorage.put(storageKey, file.buffer, file.mimetype);

    if (variant.photoStorageKey && variant.photoStorageKey !== storageKey) {
      await fileStorage.delete(variant.photoStorageKey);
    }

    const saved = await prisma.gearVariant.update({
      where: { id: variant.id },
      data: {
        photoStorageKey: storageKey,
        photoMimeType: file.mimetype,
      },
    });

    res.status(201).json({
      id: saved.id,
      hasPhoto: Boolean(saved.photoStorageKey),
    });
  });

  router.get("/variants/:id/photo", async (req, res) => {
    const householdId = res.locals.householdId as string;
    const variant = await prisma.gearVariant.findFirst({
      where: { id: req.params.id, class: { householdId } },
    });

    if (!variant?.photoStorageKey || !variant.photoMimeType) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }

    const stored = await fileStorage.get(variant.photoStorageKey);
    if (!stored) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }

    res.setHeader("Content-Type", variant.photoMimeType);
    res.send(stored.data);
  });

  router.delete("/variants/:id/photo", async (req, res) => {
    const householdId = res.locals.householdId as string;
    const variant = await prisma.gearVariant.findFirst({
      where: { id: req.params.id, class: { householdId } },
    });

    if (!variant) {
      res.status(404).json({ error: "Gear variant not found" });
      return;
    }

    if (variant.photoStorageKey) {
      await fileStorage.delete(variant.photoStorageKey);
    }

    await prisma.gearVariant.update({
      where: { id: variant.id },
      data: { photoStorageKey: null, photoMimeType: null },
    });

    res.status(204).end();
  });

  return router;
}
