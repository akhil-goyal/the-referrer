// src/types/referrer.ts
export interface Referrer {
  name: string;
  companies: { name: string; careerPage: string }[];
  phone?: string;
  email?: string;
  linkedin?: string;
}
