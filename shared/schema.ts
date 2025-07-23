import { z } from "zod";

// Search request schema
export const searchRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

// People also ask question with answer
export const peopleAlsoAskItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

// Search response schema
export const searchResponseSchema = z.object({
  direct_answer: z.string(),
  people_also_ask: z.array(peopleAlsoAskItemSchema),
});

export type SearchRequest = z.infer<typeof searchRequestSchema>;
export type SearchResponse = z.infer<typeof searchResponseSchema>;

// Keep existing user schemas for compatibility
export const users = {
  id: 0,
  username: "",
  password: "",
};

export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = {
  id: number;
  username: string;
  password: string;
};
