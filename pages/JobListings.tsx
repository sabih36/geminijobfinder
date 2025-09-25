import React, { useState, useEffect, useMemo } from 'react';
import { fetchJobs, fetchCompanies, submitApplication } from '../services/api';
import { Job, Company } from '../types';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/Modal';
import Button from '../components/Button';
import Spinner from '../components/Spinner';

const JobCard: React.FC<{ job: Job; company?: Company; onApply: (job: Job) => void }> = ({ job, company, onApply }) => {
    return (
        React.createElement('div', { className: "bg-card p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col" },
            React.createElement('div', { className: "flex items-start mb-4" },
                React.createElement('img', { src: company?.logoUrl, alt: `${company?.name} logo`, className: "w-12 h-12 rounded-full mr-4" }),
                React.createElement('div', null,
                    React.createElement('h3', { className: "text-lg font-bold text-text" }, job.title),
                    React.createElement('p', { className: "text-sm text-muted" }, company?.name)
                )
            ),
            React.createElement('p', { className: "text-gray-600 text-sm mb-4 flex-grow" }, job.description.substring(0, 120), "..."),
            React.createElement('div', { className: "flex justify-between items-center mt-auto" },
                React.createElement('span', { className: "text-xs font-semibold bg-primary/10 text-primary py-1 px-3 rounded-full" }, job.category),
                React.createElement(Button, { onClick: () => onApply(job) }, "Apply Now")
            )
        )
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
        React.createElement('div', null,
            React.createElement('div', { className: "bg-card p-6 rounded-lg shadow-sm mb-8" },
                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-4" },
                    // Fix: Cast props to 'any' to bypass incorrect type error on the 'className' attribute.
                    React.createElement('input', {
                        type: "text",
                        placeholder: "Search for jobs...",
                        className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
                        value: searchTerm,
                        onChange: (e) => setSearchTerm(e.target.value)
                    } as any),
                    React.createElement('select', {
                        className: "w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
                        value: selectedCategory,
                        onChange: (e) => setSelectedCategory(e.target.value)
                    },
                        categories.map(cat => React.createElement('option', { key: cat, value: cat }, cat))
                    )
                )
            ),
            loading ? React.createElement(Spinner, null) : (
                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" },
                    filteredJobs.map(job => (
                        React.createElement(JobCard, {
                            key: job.id,
                            job: job,
                            company: getCompanyById(job.companyId),
                            onApply: handleApplyClick
                        })
                    ))
                )
            ),
            // Fix: Moved children into props object to satisfy Modal's required children prop type.
            React.createElement(Modal, {
                isOpen: isApplyModalOpen,
                onClose: () => setApplyModalOpen(false),
                title: `Apply for ${selectedJob?.title}`,
                children: React.createElement('div', null,
                    React.createElement('p', { className: "mb-4 text-muted" }, "Upload your resume to apply. Supported format: .txt"),
                    React.createElement('div', { className: "mb-6" },
                        React.createElement('label', { htmlFor: "resume-upload", className: "block text-sm font-medium text-gray-700 mb-2" }, "Resume"),
                        React.createElement('input', {
                            id: "resume-upload",
                            type: "file",
                            accept: ".txt",
                            onChange: handleFileChange,
                            className: "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                        })
                    ),
                    React.createElement('div', { className: "flex justify-end space-x-3" },
                        React.createElement(Button, { variant: "outline", onClick: () => setApplyModalOpen(false) }, "Cancel"),
                        React.createElement(Button, { onClick: handleSubmitApplication, isLoading: isSubmitting, disabled: !resumeFile }, "Submit Application")
                    )
                )
            })
        )
    );
};

export default JobListings;