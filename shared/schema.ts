import { z } from "zod";

// Search request schema
export const searchRequestSchema = z.object({
  query: z.string().min(1, "Query cannot be empty"),
});

// Search response schema
export const searchResponseSchema = z.object({
  direct_answer: z.string(),
  people_also_ask: z.array(z.string()),
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
