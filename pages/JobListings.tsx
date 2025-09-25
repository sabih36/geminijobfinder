import React, { useState, useEffect, useMemo } from 'react';
import { fetchJobs, fetchCompanies, submitApplication } from '../services/api';
import { Job, Company } from '../types';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

const JobCard: React.FC<{ job: Job; company?: Company; onApply: (job: Job) => void }> = ({ job, company, onApply }) => {
    return (
        <div className="bg-card p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col">
            <div className="flex items-start mb-4">
                <img src={company?.logoUrl} alt={`${company?.name} logo`} className="w-12 h-12 rounded-full mr-4" />
                <div>
                    <h3 className="text-lg font-bold text-text">{job.title}</h3>
                    <p className="text-sm text-muted">{company?.name}</p>
                </div>
            </div>
            <p className="text-gray-600 text-sm mb-4 flex-grow">{job.description.substring(0, 120)}...</p>
            <div className="flex justify-between items-center mt-auto">
                <span className="text-xs font-semibold bg-primary/10 text-primary py-1 px-3 rounded-full">{job.category}</span>
                <Button onClick={() => onApply(job)}>Apply Now</Button>
            </div>
        </div>
    );
}

const JobListings: React.FC = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isApplyModalOpen, setApplyModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [jobsData, companiesData] = await Promise.all([fetchJobs(), fetchCompanies()]);
                setJobs(jobsData);
                setCompanies(companiesData);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleApplyClick = (job: Job) => {
        setSelectedJob(job);
        setApplyModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setResumeFile(e.target.files[0]);
        }
    };

    const handleSubmitApplication = async () => {
        if (!selectedJob || !resumeFile || !user) return;
        setIsSubmitting(true);
        try {
            await submitApplication(selectedJob.id, user, resumeFile);
            alert('Application submitted successfully!');
            setApplyModalOpen(false);
            setResumeFile(null);
            setSelectedJob(null);
        } catch (error) {
            console.error("Failed to submit application", error);
            alert('Failed to submit application. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const categories = useMemo(() => ['All', ...new Set(jobs.map(j => j.category))], [jobs]);

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || job.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [jobs, searchTerm, selectedCategory]);

    const getCompanyById = (id: string) => companies.find(c => c.id === id);

    return (
        <div>
            <div className="bg-card p-6 rounded-lg shadow-sm mb-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <input
                        type="text"
                        placeholder="Search for jobs..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <Spinner />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.map(job => (
                        <JobCard
                            key={job.id}
                            job={job}
                            company={getCompanyById(job.companyId)}
                            onApply={handleApplyClick}
                        />
                    ))}
                </div>
            )}

            <Modal isOpen={isApplyModalOpen} onClose={() => setApplyModalOpen(false)} title={`Apply for ${selectedJob?.title}`}>
                <div>
                    <p className="mb-4 text-muted">Upload your resume to apply. Supported format: .txt</p>
                    <div className="mb-6">
                        <label htmlFor="resume-upload" className="block text-sm font-medium text-gray-700 mb-2">Resume</label>
                        <input
                            id="resume-upload"
                            type="file"
                            accept=".txt"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        />
                    </div>
                    <div className="flex justify-end space-x-3">
                        <Button variant="outline" onClick={() => setApplyModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSubmitApplication} isLoading={isSubmitting} disabled={!resumeFile}>Submit Application</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default JobListings;