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
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getColor()}`}>
            {score.toFixed(1)} / 10
        </span>
    );
};

const AnalysisDetails: React.FC<{ analysis: ResumeAnalysis }> = ({ analysis }) => (
    <div className="space-y-6">
        <div>
            <h4 className="font-semibold text-gray-800">AI Fit Score</h4>
            <div className="mt-2 flex items-center gap-x-2">
                <ScoreBadge score={analysis.fitScore} />
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${analysis.fitScore * 10}%` }}></div>
                </div>
            </div>
        </div>
        <div>
            <h4 className="font-semibold text-gray-800">Summary</h4>
            <p className="mt-1 text-gray-600 text-sm">{analysis.summary}</p>
        </div>
        <div>
            <h4 className="font-semibold text-gray-800">Key Skills</h4>
            <div className="mt-2 flex flex-wrap gap-2">
                {analysis.skills.map((skill, i) => (
                    <span key={i} className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{skill}</span>
                ))}
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <h4 className="font-semibold text-green-700">Pros</h4>
                <ul className="mt-1 list-disc list-inside text-gray-600 text-sm space-y-1">
                    {analysis.pros.map((pro, i) => <li key={i}>{pro}</li>)}
                </ul>
            </div>
            <div>
                <h4 className="font-semibold text-red-700">Cons</h4>
                <ul className="mt-1 list-disc list-inside text-gray-600 text-sm space-y-1">
                    {analysis.cons.map((con, i) => <li key={i}>{con}</li>)}
                </ul>
            </div>
        </div>
    </div>
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
        return <Spinner />;
    }

    if(user?.role !== 'recruiter') {
        return <div className="text-center text-muted">This page is for recruiters only.</div>
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-6 text-text">Recruiter Dashboard</h1>
            <div className="bg-card rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">View</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {applications.length === 0 && (
                            <tr><td colSpan={3} className="text-center py-10 text-muted">No applications found.</td></tr>
                        )}
                        {applications.map(app => (
                            <tr key={app.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">{app.userName}</div>
                                    <div className="text-sm text-gray-500">{app.userEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getJobById(app.jobId)?.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Button onClick={() => handleViewDetails(app)} variant="outline">View Details</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)} title="Application Details">
                {selectedApp && (
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold">{selectedApp.userName}</h3>
                            <p className="text-sm text-muted">{selectedApp.userEmail}</p>
                            <p className="text-sm text-muted">Applying for: {getJobById(selectedApp.jobId)?.title}</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-semibold text-gray-800 mb-2">AI Resume Analysis</h4>
                            {isAnalyzing && <Spinner />}
                            {!isAnalyzing && analysis && <AnalysisDetails analysis={analysis} />}
                            {!isAnalyzing && !analysis && <p className="text-sm text-red-500">Could not analyze resume.</p>}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default RecruiterDashboard;
