import { Prisma } from "../../generated/prisma/client.ts";

const UNIQUE_FIELD_CODES: Record<string, string> = {
  email: "EMAIL_ALREADY_EXISTS",
  name: "NAME_ALREADY_EXISTS",
};

type NormalizedError = { code: string; message: string; status: number };

const normalizePrismaError = (error: unknown): NormalizedError | null => {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;

  switch (error.code) {
    case "P2002": {
      // meta.target removed in Prisma 7.x; driver adapter exposes fields via driverAdapterError
      const meta = error.meta as Record<string, unknown> | undefined;
      const adapterFields = (
        meta?.driverAdapterError as Record<string, unknown> | undefined
      )?.cause as { constraint?: { fields?: string[] } } | undefined;
      const field =
        adapterFields?.constraint?.fields?.[0] ??
        (meta?.target as string[] | undefined)?.[0];

      const code = UNIQUE_FIELD_CODES[field ?? ""] ?? "DATA_ALREADY_EXISTS";
      return { code, message: "Data already exists", status: 409 };
    }
    case "P2025":
      return {
        code: "RECORD_NOT_FOUND",
        message: "Record not found",
        status: 404,
      };
    default:
      return {
        code: "DATABASE_ERROR",
        message: "Database error",
        status: 400,
      };
  }
};

export { normalizePrismaError };
export type { NormalizedError };
