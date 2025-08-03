import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Application } from "./Application";

@Entity("companies")
export class Company {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  website?: string;

  @Column({ nullable: true })
  industry?: string;

  @Column({ nullable: true })
  size?: string; // e.g., "1-10", "11-50", "51-200", "201-500", "500+"

  @Column({ nullable: true })
  location?: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "jsonb", nullable: true })
  companyInfo?: {
    founded?: string;
    revenue?: string;
    mission?: string;
    values?: string[];
    benefits?: string[];
    techStack?: string[];
  } | null;

  @Column({ default: false })
  isFavorite!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Application, (application) => application.company)
  applications!: Application[];
}
