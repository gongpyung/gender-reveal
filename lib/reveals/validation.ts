import { z } from "zod";
import { parseDateInput } from "./date";

export const revealInputSchema = z.object({
  babyNickname: z.string().transform((val) => val.trim()).pipe(z.string().min(1, "아기 별명을 입력해주세요")),
  dueDate: z
    .string()
    .transform((val) => val.trim())
    .refine((val) => parseDateInput(val) !== null, {
      message: "올바른 날짜를 입력해주세요",
    }),
  recipientName: z.string().transform((val) => val.trim()).pipe(z.string().min(1, "받는 사람을 입력해주세요")),
  babyGender: z.enum(["son", "daughter"], {
    message: "성별을 선택해주세요",
  }),
});
