import { z } from "zod/mini";

export const Uploaded = z.object({ storageId: z.string() });
