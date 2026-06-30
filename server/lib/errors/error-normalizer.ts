import {
  normalizePrismaError,
  type NormalizedError,
} from "./prisma-error-normalizer.ts";

const normalizers: Array<(error: unknown) => NormalizedError | null> = [
  normalizePrismaError,
];

const normalizeError = (error: unknown): NormalizedError => {
  for (const normalize of normalizers) {
    const result = normalize(error);
    if (result) return result;
  }
  return {
    code: "SOMETHING_WENT_WRONG",
    message: "Something went wrong",
    status: 500,
  };
};

export { normalizeError };
