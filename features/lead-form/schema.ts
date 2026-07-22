import { z } from "zod";

const phoneRegex = /^(\+7|8|7)?[\s(]?\d{3}[\s)]?[\s]?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

export const leadFormSchema = z.object({
  name: z
    .string()
    .min(2, "Укажите имя")
    .max(60, "Слишком длинное имя"),
  phone: z
    .string()
    .min(1, "Укажите телефон")
    .regex(phoneRegex, "Введите корректный номер телефона"),
  service: z.string().optional(),
  message: z.string().max(1000, "Слишком длинное сообщение").optional(),
  // honeypot — bots fill this, humans don't
  company: z.string().max(0).optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Нужно согласие на обработку данных" }),
  }),
});

export type LeadFormValues = z.infer<typeof leadFormSchema>;

/** Payload sent to the API (без honeypot и служебных полей). */
export const leadPayloadSchema = leadFormSchema
  .omit({ company: true, consent: true })
  .extend({
    source: z.string().optional(),
    total: z.number().optional(),
  });

export type LeadPayload = z.infer<typeof leadPayloadSchema>;
