export interface Company {
  name: string;
  careerPage: string;
}

export interface Referrer {
  id?: string;
  name: string;
  companies: Company[];
  phone: string;
  email: string;
  linkedin: string;
}

export interface JobPosting {
  id: string; // Changed from id?: string | undefined
  title: string;
  url: string;
  companyName: string;
  careerPage: string;
  location: string;
  description: string;
  timestamp: number;
  query: string;
  sourceType?: string;
}
