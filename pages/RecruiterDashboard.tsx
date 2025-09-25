import React, { useState, useEffect, useCallback } from 'react';
import { fetchApplicationsForCompany, fetchJobs } from '../services/api';
import { Application, Job, ResumeAnalysis } from '../types';
import { useAuth } from '../hooks/useAuth';
import { analyzeResume } from '../services/geminiService';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import Button from '../components/Button';

const ScoreBadge: React.FC<{ score: number }> = ({ score }) => {
    const getColor = () => {
        if (score >= 8) return 'bg-green-100 text-green-800';
        if (score >= 5) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };
    return (
        React.createElement('span', { className: `px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColor()}` },
            score.toFixed(1), " / 10"
        )
    );
};

const AnalysisDetails: React.FC<{ analysis: ResumeAnalysis }> = ({ analysis }) => (
    React.createElement('div', { className: "space-y-6" },
        React.createElement('div', null,
            React.createElement('h4', { className: "font-semibold text-gray-800" }, "AI Fit Score"),
            React.createElement('div', { className: "mt-2 flex items-center gap-x-2" },
                React.createElement(ScoreBadge, { score: analysis.fitScore }),
                React.createElement('div', { className: "w-full bg-gray-200 rounded-full h-2.5" },
                    React.createElement('div', { className: "bg-primary h-2.5 rounded-full", style: { width: `${analysis.fitScore * 10}%` } })
                )
            )
        ),
        React.createElement('div', null,
            React.createElement('h4', { className: "font-semibold text-gray-800" }, "Summary"),
            React.createElement('p', { className: "mt-1 text-gray-600 text-sm" }, analysis.summary)
        ),
        React.createElement('div', null,
            React.createElement('h4', { className: "font-semibold text-gray-800" }, "Key Skills"),
            React.createElement('div', { className: "mt-2 flex flex-wrap gap-2" },
                analysis.skills.map((skill, i) => (
                    React.createElement('span', { key: i, className: "bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full" }, skill)
                ))
            )
        ),
        React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
            React.createElement('div', null,
                React.createElement('h4', { className: "font-semibold text-green-700" }, "Pros"),
                React.createElement('ul', { className: "mt-1 list-disc list-inside text-gray-600 text-sm space-y-1" },
                    analysis.pros.map((pro, i) => React.createElement('li', { key: i }, pro))
                )
            ),
            React.createElement('div', null,
                React.createElement('h4', { className: "font-semibold text-red-700" }, "Cons"),
                React.createElement('ul', { className: "mt-1 list-disc list-inside text-gray-600 text-sm space-y-1" },
                    analysis.cons.map((con, i) => React.createElement('li', { key: i }, con))
                )
            )
        )
    )
);

const RecruiterDashboard: React.FC = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { user } = useAuth();

    const getJobById = useCallback((id: string) => jobs.find(j => j.id === id), [jobs]);

    useEffect(() => {
        const loadData = async () => {
            if (user?.role !== 'recruiter' || !user.companyId) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const [appsData, jobsData] = await Promise.all([
                    fetchApplicationsForCompany(user.companyId),
                    fetchJobs()
                ]);
                setApplications(appsData);
                setJobs(jobsData);
            } catch (error) {
                console.error("Failed to load dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [user]);

    const handleViewDetails = async (application: Application) => {
        setSelectedApp(application);
        setModalOpen(true);
        setIsAnalyzing(true);
        setAnalysis(null);
        try {
            const job = getJobById(application.jobId);
            if(job) {
                const result = await analyzeResume(application.resumeContent, job);
                setAnalysis(result);
            }
        } catch(error) {
            console.error("Error during analysis:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    if (loading) {
        return React.createElement(Spinner, null);
    }

    if(user?.role !== 'recruiter') {
        return React.createElement('div', { className: "text-center text-muted" }, "This page is for recruiters only.");
    }

    return (
        React.createElement('div', null,
            React.createElement('h1', { className: "text-3xl font-bold mb-6 text-text" }, "Recruiter Dashboard"),
            React.createElement('div', { className: "bg-card rounded-lg shadow-sm overflow-hidden" },
                React.createElement('table', { className: "min-w-full divide-y divide-gray-200" },
                    React.createElement('thead', { className: "bg-gray-50" },
                        React.createElement('tr', null,
                            React.createElement('th', { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Applicant"),
                            React.createElement('th', { scope: "col", className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" }, "Position"),
                            React.createElement('th', { scope: "col", className: "relative px-6 py-3" }, React.createElement('span', { className: "sr-only" }, "View"))
                        )
                    ),
                    React.createElement('tbody', { className: "bg-white divide-y divide-gray-200" },
                        applications.length === 0 && (
                            React.createElement('tr', null, React.createElement('td', { colSpan: 3, className: "text-center py-10 text-muted" }, "No applications found."))
                        ),
                        applications.map(app => (
                            React.createElement('tr', { key: app.id, className: "hover:bg-gray-50" },
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap" },
                                    React.createElement('div', { className: "text-sm font-medium text-gray-900" }, app.userName),
                                    React.createElement('div', { className: "text-sm text-gray-500" }, app.userEmail)
                                ),
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500" }, getJobById(app.jobId)?.title),
                                React.createElement('td', { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium" },
                                    React.createElement(Button, { onClick: () => handleViewDetails(app), variant: "outline" }, "View Details")
                                )
                            )
                        ))
                    )
                )
            ),
            // Fix: Moved children into props object to satisfy Modal's required children prop type.
            React.createElement(Modal, {
                isOpen: isModalOpen,
                onClose: () => setModalOpen(false),
                title: "Application Details",
                children: selectedApp && (
                    React.createElement('div', { className: "space-y-4" },
                        React.createElement('div', null,
                            React.createElement('h3', { className: "text-lg font-bold" }, selectedApp.userName),
                            React.createElement('p', { className: "text-sm text-muted" }, selectedApp.userEmail),
                            React.createElement('p', { className: "text-sm text-muted" }, "Applying for: ", getJobById(selectedApp.jobId)?.title)
                        ),
                        React.createElement('div', { className: "p-4 bg-gray-50 rounded-lg" },
                            React.createElement('h4', { className: "font-semibold text-gray-800 mb-2" }, "AI Resume Analysis"),
                            isAnalyzing && React.createElement(Spinner, null),
                            !isAnalyzing && analysis && React.createElement(AnalysisDetails, { analysis: analysis }),
                            !isAnalyzing && !analysis && React.createElement('p', { className: "text-sm text-red-500" }, "Could not analyze resume.")
                        )
                    )
                )
            })
        )
    );
};

export default RecruiterDashboard;