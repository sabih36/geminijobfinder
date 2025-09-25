import { Job, Company, Application, User } from '../types';

// MOCK DATA
let companies: Company[] = [
  { id: 'comp1', name: 'Innovate Inc.', logoUrl: 'https://picsum.photos/seed/innovate/100' },
  { id: 'comp2', name: 'Quantum Solutions', logoUrl: 'https://picsum.photos/seed/quantum/100' },
  { id: 'comp3', name: 'Cybernetic Corp', logoUrl: 'https://picsum.photos/seed/cyber/100' },
];

let jobs: Job[] = [
  { id: 'job1', title: 'Senior Frontend Engineer', description: 'Build beautiful and responsive user interfaces with React and Tailwind CSS.', companyId: 'comp1', category: 'Engineering' },
  { id: 'job2', title: 'Backend Developer (Node.js)', description: 'Design and implement scalable backend services and APIs.', companyId: 'comp2', category: 'Engineering' },
  { id: 'job3', title: 'UX/UI Designer', description: 'Create intuitive and visually appealing designs for our web and mobile apps.', companyId: 'comp1', category: 'Design' },
  { id: 'job4', title: 'Product Manager', description: 'Lead product strategy and roadmap for our flagship product.', companyId: 'comp3', category: 'Product' },
  { id: 'job5', title: 'Data Scientist', description: 'Analyze large datasets to extract meaningful insights and build predictive models.', companyId: 'comp2', category: 'Data Science' },
];

let applications: Application[] = [
    { id: 'app1', jobId: 'job1', userId: 'user2', userName: 'Bob Johnson', userEmail: 'bob@example.com', resumeUrl: 'mock_resume_bob.pdf', resumeContent: 'Experienced React developer with 5 years in the industry. Proficient in TypeScript, Next.js, and state management libraries like Redux.' },
];

let users: User[] = [
    { id: 'user1', name: 'Alice Student', email: 'student@test.com', role: 'student', password: 'password123' },
    { id: 'recruiter1', name: 'Charles Recruiter', email: 'recruiter@innovate.com', role: 'recruiter', companyId: 'comp1', password: 'password123' },
];


// MOCK API FUNCTIONS
const simulateDelay = <T,>(data: T): Promise<T> => {
    return new Promise(resolve => setTimeout(() => resolve(data), 500));
}

export const signInUser = async (email: string, password_unused: string): Promise<User | null> => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    // In a real app, you'd compare hashed passwords. Here we just check for existence.
    if (user) {
        return simulateDelay(user);
    }
    return simulateDelay(null);
}

export const signUpUser = async (
    name: string,
    email: string,
    password_unused: string,
    role: 'student' | 'recruiter',
    companyName?: string
): Promise<User | null> => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        // User already exists
        return simulateDelay(null);
    }

    let companyId: string | undefined = undefined;
    if (role === 'recruiter' && companyName) {
        let company = companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());
        if (!company) {
            // Create a new company
            company = {
                id: `comp${companies.length + 1}`,
                name: companyName,
                logoUrl: `https://picsum.photos/seed/${companyName.replace(/\s+/g, '-')}/100`,
            };
            companies.push(company);
        }
        companyId = company.id;
    }

    const newUser: User = {
        id: `user${users.length + 1}`,
        name,
        email,
        role,
        companyId,
        password: 'password123' // mock password
    };
    users.push(newUser);
    return simulateDelay(newUser);
}


export const fetchJobs = async (): Promise<Job[]> => {
    return simulateDelay(jobs);
};

export const fetchCompanies = async (): Promise<Company[]> => {
    return simulateDelay(companies);
};

export const fetchApplicationsForCompany = async (companyId: string): Promise<Application[]> => {
    const companyJobs = jobs.filter(job => job.companyId === companyId).map(job => job.id);
    const companyApplications = applications.filter(app => companyJobs.includes(app.jobId));
    return simulateDelay(companyApplications);
};

export const submitApplication = async (jobId: string, user: User, resume: File): Promise<Application> => {
    const resumeContent = await resume.text();
    const newApplication: Application = {
        id: `app${applications.length + 1}`,
        jobId,
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        resumeUrl: `resumes/${user.id}/${resume.name}`, // Mock storage path
        resumeContent,
    };
    applications.push(newApplication);
    return simulateDelay(newApplication);
}