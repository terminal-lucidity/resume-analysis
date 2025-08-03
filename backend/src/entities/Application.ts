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
import { Company } from "./Company";

export enum ApplicationStatus {
  DRAFT = "draft",
  APPLIED = "applied",
  UNDER_REVIEW = "under_review",
  INTERVIEW_SCHEDULED = "interview_scheduled",
  INTERVIEW_COMPLETED = "interview_completed",
  OFFER_RECEIVED = "offer_received",
  OFFER_ACCEPTED = "offer_accepted",
  REJECTED = "rejected",
  WITHDRAWN = "withdrawn",
}

@Entity("applications")
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @ManyToOne(() => User, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column()
  position!: string;

  @Column({ nullable: true })
  jobDescription?: string;

  @Column({ nullable: true })
  salary?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  jobUrl?: string;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.DRAFT,
  })
  status!: ApplicationStatus;

  @Column({ type: "date", nullable: true })
  appliedDate?: Date;

  @Column({ type: "date", nullable: true })
  interviewDate?: Date;

  @Column({ type: "text", nullable: true })
  notes?: string;

  @Column({ type: "jsonb", nullable: true })
  applicationDetails?: {
    resumeVersion?: string;
    coverLetter?: string;
    applicationMethod?: string; // "LinkedIn", "Company Website", "Email", etc.
    recruiterContact?: string;
    followUpDate?: string;
  } | null;

  @Column({ type: "jsonb", nullable: true })
  interviewDetails?: {
    type?: string; // "Phone", "Video", "On-site", "Technical", "Behavioral"
    interviewer?: string;
    questions?: string[];
    feedback?: string;
    nextSteps?: string;
  } | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
