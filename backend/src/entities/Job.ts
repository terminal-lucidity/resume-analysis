import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Company } from "./Company";

export enum JobLevel {
  ENTRY = "entry",
  JUNIOR = "junior",
  MID = "mid",
  SENIOR = "senior",
  LEAD = "lead",
  EXECUTIVE = "executive",
}

export enum JobType {
  FULL_TIME = "full_time",
  PART_TIME = "part_time",
  CONTRACT = "contract",
  INTERNSHIP = "internship",
  FREELANCE = "freelance",
}

@Entity("jobs")
export class Job {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ type: "text" })
  description!: string;

  @Column()
  companyId!: string;

  @ManyToOne(() => Company, { onDelete: "CASCADE" })
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column({
    type: "enum",
    enum: JobLevel,
    default: JobLevel.MID,
  })
  level!: JobLevel;

  @Column({
    type: "enum",
    enum: JobType,
    default: JobType.FULL_TIME,
  })
  type!: JobType;

  @Column({ nullable: true })
  location?: string;

  @Column({ nullable: true })
  salary?: string;

  @Column({ nullable: true })
  remote?: boolean;

  @Column({ type: "text", nullable: true })
  requirements?: string;

  @Column({ type: "jsonb", nullable: true })
  skills?: string[];

  @Column({ type: "jsonb", nullable: true })
  benefits?: string[];

  @Column({ type: "jsonb", nullable: true })
  responsibilities?: string[];

  @Column({ nullable: true })
  experienceYears?: number;

  @Column({ nullable: true })
  applicationUrl?: string;

  @Column({ type: "jsonb", nullable: true })
  jobDetails?: {
    department?: string;
    team?: string;
    techStack?: string[];
    industry?: string;
    keywords?: string[];
  } | null;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: "date", nullable: true })
  postedDate?: Date;

  @Column({ type: "date", nullable: true })
  deadline?: Date;

  @Column({ nullable: true })
  source?: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
