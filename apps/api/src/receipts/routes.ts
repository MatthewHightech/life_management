import { Router } from "express";
import multer from "multer";
import { FolderNamespace } from "@prisma/client";
import { prisma } from "@life/db";
import {
  isReceiptMimeType,
  RECEIPT_MAX_BYTE_SIZE,
  receiptStorageKey,
} from "@life/shared";
import { extractBearerToken, verifyAuthToken } from "../auth/jwt.js";
import type { FileStorage } from "../storage/types.js";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: RECEIPT_MAX_BYTE_SIZE, files: 20 },
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

export function createReceiptRouter(fileStorage: FileStorage) {
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

  router.post("/upload", upload.array("files"), async (req, res) => {
    const householdId = res.locals.householdId as string;
    const files = req.files as Express.Multer.File[] | undefined;
    const folderId = typeof req.body.folderId === "string" && req.body.folderId ? req.body.folderId : null;

    if (!files?.length) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, householdId, namespace: FolderNamespace.RECEIPTS },
      });

      if (!folder) {
        res.status(400).json({ error: "Folder not found" });
        return;
      }
    }

    const created = [];

    for (const file of files) {
      if (!isReceiptMimeType(file.mimetype)) {
        res.status(400).json({ error: `Unsupported file type: ${file.mimetype}` });
        return;
      }

      const receipt = await prisma.receipt.create({
        data: {
          householdId,
          folderId,
          fileName: file.originalname,
          mimeType: file.mimetype,
          byteSize: file.size,
          storageKey: "pending",
        },
      });

      const storageKey = receiptStorageKey(householdId, receipt.id, file.originalname);
      await fileStorage.put(storageKey, file.buffer, file.mimetype);

      const saved = await prisma.receipt.update({
        where: { id: receipt.id },
        data: { storageKey },
      });

      created.push(saved);
    }

    res.status(201).json({
      receipts: created.map((receipt) => ({
        id: receipt.id,
        fileName: receipt.fileName,
        mimeType: receipt.mimeType,
        byteSize: receipt.byteSize,
        folderId: receipt.folderId,
        createdAt: receipt.createdAt.toISOString(),
        updatedAt: receipt.updatedAt.toISOString(),
      })),
    });
  });

  router.get("/:id/file", async (req, res) => {
    const householdId = res.locals.householdId as string;
    const receipt = await prisma.receipt.findFirst({
      where: { id: req.params.id, householdId },
    });

    if (!receipt) {
      res.status(404).json({ error: "Receipt not found" });
      return;
    }

    const stored = await fileStorage.get(receipt.storageKey);
    if (!stored) {
      res.status(404).json({ error: "File not found" });
      return;
    }

    res.setHeader("Content-Type", receipt.mimeType);
    res.setHeader("Content-Disposition", `inline; filename="${receipt.fileName}"`);
    res.send(stored.data);
  });

  return router;
}
