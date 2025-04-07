export interface Company {
  name: string;
  careerPage: string;
}

export interface Referrer {
  name: string;
  companies: Company[];
  phone: string;
  email: string;
  linkedin: string;
}

export interface JobPosting {
  title: string;
  url: string;
  companyName: string;
  careerPage: string;
  timestamp: number;
  query: string;
  location: string;
}
