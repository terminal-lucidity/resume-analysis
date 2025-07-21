import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

@Entity("resumes")
export class Resume {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column()
  fileName: string;

  @Column()
  originalText: string;

  @Column({ type: "jsonb", nullable: true })
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
    contact: {
      name: string;
      email: string;
      phone?: string;
      location?: string;
    };
  };

  @Column({ type: "jsonb", nullable: true })
  aiAnalysis: {
    strengths: string[];
    improvements: string[];
    suggestedRoles: string[];
    score: number;
    summary: string;
  };

  @Column({ default: false })
  isActive: boolean;

  @Column({ type: "text", nullable: true })
  fileUrl: string;

  @Column({ type: "text", nullable: true })
  fileType: string;

  @Column({ type: "int", nullable: true })
  fileSize: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
