export type StoredFile = {
  data: Buffer;
  mimeType: string;
};

export type FileStorage = {
  put(key: string, data: Buffer, mimeType: string): Promise<void>;
  get(key: string): Promise<StoredFile | null>;
  delete(key: string): Promise<void>;
};
