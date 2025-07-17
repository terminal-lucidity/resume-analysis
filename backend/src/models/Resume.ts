import mongoose, { Document, Schema } from "mongoose";

interface IResume extends Document {
  userId: string;
  originalText: string;
  parsedData: {
    skills: string[];
    experience: Array<{
      company: string;
      position: string;
      duration: string;
      description: string[];
    }>;
    education: Array<{
      institution: string;
      degree: string;
      year: string;
    }>;
  };
  aiAnalysis: {
    strengths: string[];
    improvements: string[];
    suggestedRoles: string[];
    score: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: String, required: true, index: true },
    originalText: { type: String, required: true },
    parsedData: {
      skills: [String],
      experience: [
        {
          company: String,
          position: String,
          duration: String,
          description: [String],
        },
      ],
      education: [
        {
          institution: String,
          degree: String,
          year: String,
        },
      ],
    },
    aiAnalysis: {
      strengths: [String],
      improvements: [String],
      suggestedRoles: [String],
      score: Number,
    },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model<IResume>("Resume", ResumeSchema);
