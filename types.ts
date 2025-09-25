export interface Company {
  id: string;
  name: string;
  logoUrl: string;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  companyId: string;
  category: string;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  userName: string;
  userEmail: string;
  resumeUrl: string;
  resumeContent: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter';
  companyId?: string;
  // This is for mock purposes only. In a real app, never store plaintext passwords.
  password?: string;
}

export interface ResumeAnalysis {
  summary: string;
  skills: string[];
  fitScore: number;
  pros: string[];
  cons:string[];
}

export enum Page {
    JobListings = 'JobListings',
    RecruiterDashboard = 'RecruiterDashboard',
}