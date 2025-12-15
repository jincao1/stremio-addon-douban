import { compressSync, decompressSync, strFromU8, strToU8 } from "fflate";
import { z } from "zod";
import { DEFAULT_COLLECTION_IDS } from "./constants";

export const configSchema = z.object({
  catalogIds: z.array(z.string()).default(DEFAULT_COLLECTION_IDS),
});

export type Config = z.infer<typeof configSchema>;
export type ConfigInput = z.input<typeof configSchema>;

export const encodeConfig = (config?: ConfigInput | null): string => {
  const stringified = JSON.stringify(configSchema.parse(config ?? {}));
  const result = btoa(String.fromCharCode(...compressSync(strToU8(stringified), { level: 6, mem: 8 })));
  return Buffer.from(result).toString("base64url");
};

export const decodeConfig = (encoded: string): Config => {
  try {
    const fromBase64 = Uint8Array.from(atob(Buffer.from(encoded, "base64url").toString()), (c) => c.charCodeAt(0));
    const decompressed = strFromU8(decompressSync(fromBase64));
    return configSchema.parse(JSON.parse(decompressed.toString()));
  } catch {
    return configSchema.parse({});
  }
};
