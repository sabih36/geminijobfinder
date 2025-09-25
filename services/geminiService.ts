import { GoogleGenAI, Type } from "@google/genai";
import { Job, ResumeAnalysis } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        summary: {
            type: Type.STRING,
            description: "A 2-3 sentence summary of the candidate's profile and experience."
        },
        skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key technical and soft skills mentioned in the resume."
        },
        fitScore: {
            type: Type.NUMBER,
            description: "A score from 1 to 10 indicating how well the candidate's profile matches the job description. 1 is a very poor match, 10 is a perfect match."
        },
        pros: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of key strengths and positive points for this candidate regarding the job."
        },
        cons: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of potential weaknesses or missing qualifications for this candidate regarding the job."
        }
    },
    required: ["summary", "skills", "fitScore", "pros", "cons"],
};

export const analyzeResume = async (resumeContent: string, job: Job): Promise<ResumeAnalysis | null> => {
    try {
        const prompt = `
            Analyze the following resume for the position of "${job.title}".

            Job Description:
            ---
            ${job.description}
            ---

            Resume Content:
            ---
            ${resumeContent}
            ---

            Based on the job description and the resume, provide a structured analysis.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });

        const jsonText = response.text.trim();
        const analysisResult: ResumeAnalysis = JSON.parse(jsonText);
        
        return analysisResult;

    } catch (error) {
        console.error("Error analyzing resume with Gemini API:", error);
        return null;
    }
};
