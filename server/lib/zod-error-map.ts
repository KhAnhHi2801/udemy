import { z } from "zod";

const zodErrorFn: z.ZodErrorMap = (issue) => {
  switch (issue.code) {
    case "too_small":
      if (issue.type === "string") return `FIELD_TOO_SHORT:${issue.minimum}`;
      break;
    case "too_big":
      if (issue.type === "string") return `FIELD_TOO_LONG:${issue.maximum}`;
      break;
    case "invalid_format":
      if (issue.format === "email") return "INVALID_EMAIL";
      break;
  }
  return undefined;
};

export default zodErrorFn;
