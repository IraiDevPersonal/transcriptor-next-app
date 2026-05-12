import { Readable } from "node:stream";
import type { IncomingMessage } from "node:http";
import formidable from "formidable";
import type { Fields, Files } from "formidable";

const MAX_FILE_SIZE = 500 * 1024 * 1024;

export interface ParsedUpload {
  fields: Fields;
  files: Files;
}

export async function parseMultipart(
  req: Request,
  uploadDir: string,
): Promise<ParsedUpload> {
  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: MAX_FILE_SIZE,
    multiples: false,
  });

  const nodeReq = await toNodeRequest(req);

  return new Promise<ParsedUpload>((resolve, reject) => {
    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

async function toNodeRequest(req: Request): Promise<IncomingMessage> {
  const headers: Record<string, string> = {};
  req.headers.forEach((value, key) => {
    headers[key] = value;
  });

  if (!req.body) {
    throw new Error("La petición no contiene cuerpo.");
  }

  const readable = Readable.fromWeb(req.body as Parameters<typeof Readable.fromWeb>[0]);
  const fakeReq = readable as unknown as IncomingMessage & { headers: Record<string, string>; method?: string };
  fakeReq.headers = headers;
  fakeReq.method = req.method;
  return fakeReq;
}
