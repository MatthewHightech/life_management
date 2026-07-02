import { mkdir, readFile, unlink, writeFile } from "fs/promises";
import path from "path";
import type { FileStorage, StoredFile } from "./types.js";

function getUploadRoot() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "data", "uploads");
}

function resolvePath(key: string) {
  const root = path.resolve(getUploadRoot());
  const filePath = path.resolve(root, key);

  if (!filePath.startsWith(`${root}${path.sep}`) && filePath !== root) {
    throw new Error("Invalid storage key");
  }

  return filePath;
}

export function createLocalFileStorage(): FileStorage {
  return {
    async put(key, data, _mimeType) {
      const filePath = resolvePath(key);
      await mkdir(path.dirname(filePath), { recursive: true });
      await writeFile(filePath, data);
    },

    async get(key) {
      const filePath = resolvePath(key);

      try {
        const data = await readFile(filePath);
        return { data, mimeType: "application/octet-stream" } satisfies StoredFile;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code === "ENOENT") {
          return null;
        }
        throw error;
      }
    },

    async delete(key) {
      const filePath = resolvePath(key);

      try {
        await unlink(filePath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          throw error;
        }
      }
    },
  };
}
