import mongoose, { Schema, model, models, type Document } from 'mongoose'

/* ══════════════════════════════════════════════════════════════
   COURSE
══════════════════════════════════════════════════════════════ */
export interface ICourse extends Document {
  number: string; title: string; slug: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  lessons: number; accent: 'lime' | 'blue' | 'violet'
  description: string; longDescription: string; tags: string[]
  featured: boolean; order: number; xpReward: number
  creditReward: number; enrolledCount: number; isPremium: boolean
  courseFile?: string
  createdAt: Date; updatedAt: Date
}
const CourseSchema = new Schema<ICourse>({
  number: String, title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  lessons: { type: Number, default: 0 }, accent: { type: String, enum: ['lime', 'blue', 'violet'], default: 'lime' },
  description: { type: String, default: '' }, longDescription: { type: String, default: '' },
  tags: [String], featured: { type: Boolean, default: false }, order: { type: Number, default: 0 },
  xpReward: { type: Number, default: 100 }, creditReward: { type: Number, default: 10 },
  enrolledCount: { type: Number, default: 0 }, isPremium: { type: Boolean, default: false },
  courseFile: { type: String, default: '' },
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   BADGE
══════════════════════════════════════════════════════════════ */
export interface IBadge extends Document {
  name: string; slug: string; description: string; icon: string
  condition: 'quiz_count' | 'xp_threshold' | 'streak' | 'course_complete' | 'manual'
  conditionValue: number; tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  creditBonus: number; createdAt: Date
}
const BadgeSchema = new Schema<IBadge>({
  name: { type: String, required: true }, slug: { type: String, unique: true },
  description: String, icon: { type: String, default: '🏆' },
  condition: { type: String, enum: ['quiz_count', 'xp_threshold', 'streak', 'course_complete', 'manual'], default: 'manual' },
  conditionValue: { type: Number, default: 0 },
  tier: { type: String, enum: ['bronze', 'silver', 'gold', 'platinum'], default: 'bronze' },
  creditBonus: { type: Number, default: 0 },
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   STORE ITEM
══════════════════════════════════════════════════════════════ */
export interface IStoreItem extends Document {
  name: string; description: string; icon: string
  type: 'theme' | 'badge_frame' | 'xp_boost' | 'course_unlock' | 'cosmetic'
  creditCost: number; stock: number; active: boolean
  courseRef?: string
  deliverableType: 'link' | 'text' | 'code'
  deliverableContent: string
  deliverableLabel: string
  createdAt: Date
}
const StoreItemSchema = new Schema<IStoreItem>({
  name: { type: String, required: true }, description: String,
  icon: { type: String, default: '🎁' },
  type: { type: String, enum: ['theme', 'badge_frame', 'xp_boost', 'course_unlock', 'cosmetic'], default: 'cosmetic' },
  creditCost: { type: Number, required: true }, stock: { type: Number, default: -1 },
  active: { type: Boolean, default: true }, courseRef: String,
  deliverableType: { type: String, enum: ['link', 'text', 'code'], default: 'link' },
  deliverableContent: { type: String, default: '' },
  deliverableLabel: { type: String, default: 'Access Asset' },
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   USER
══════════════════════════════════════════════════════════════ */
export interface IUser extends Document {
  username: string; email: string; passwordHash: string
  displayName: string; bio: string; avatarColor: string
  xp: number; credits: number; globalRank: number
  streak: number; lastActive: Date
  badges: string[]; completedCourses: string[]; completedQuizzes: string[]
  ownedItems: string[]; certificates: string[]
  settings: { emailNotifications: boolean; publicProfile: boolean; theme: string }
  createdAt: Date; updatedAt: Date
}
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  displayName: { type: String, default: '' }, bio: { type: String, default: '' },
  avatarColor: { type: String, default: '#FF4D5E' },
  xp: { type: Number, default: 0 }, credits: { type: Number, default: 0 },
  globalRank: { type: Number, default: 0 }, streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  badges: [String], completedCourses: [String], completedQuizzes: [String],
  ownedItems: [String], certificates: [String],
  settings: {
    emailNotifications: { type: Boolean, default: true },
    publicProfile: { type: Boolean, default: true },
    theme: { type: String, default: 'dark' },
  },
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   QUIZ
══════════════════════════════════════════════════════════════ */
export interface IQuizQuestion {
  question: string; options: string[]; correctIndex: number; explanation: string
}
export interface IQuiz extends Document {
  title: string; slug: string; courseRef: string; description: string
  difficulty: 'easy' | 'medium' | 'hard'; questions: IQuizQuestion[]
  xpReward: number; creditReward: number; passingScore: number
  timeLimit: number; active: boolean; attemptCount: number
  createdAt: Date; updatedAt: Date
}
const QuizSchema = new Schema<IQuiz>({
  title: { type: String, required: true }, slug: { type: String, unique: true },
  courseRef: String, description: String,
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  questions: [{
    question: String, options: [String], correctIndex: Number, explanation: String,
  }],
  xpReward: { type: Number, default: 100 }, creditReward: { type: Number, default: 15 },
  passingScore: { type: Number, default: 70 }, timeLimit: { type: Number, default: 600 },
  active: { type: Boolean, default: true }, attemptCount: { type: Number, default: 0 },
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   QUIZ ATTEMPT
══════════════════════════════════════════════════════════════ */
export interface IQuizAttempt extends Document {
  userId: string; quizId: string; quizTitle: string
  answers: number[]; score: number; passed: boolean
  xpEarned: number; creditsEarned: number; timeTaken: number
  createdAt: Date
}
const QuizAttemptSchema = new Schema<IQuizAttempt>({
  userId: { type: String, required: true }, quizId: { type: String, required: true },
  quizTitle: String, answers: [Number], score: Number, passed: Boolean,
  xpEarned: Number, creditsEarned: Number, timeTaken: Number,
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   CREDIT TRANSACTION
══════════════════════════════════════════════════════════════ */
export interface ICreditTransaction extends Document {
  userId: string; amount: number; type: 'earn' | 'spend'
  reason: string; balanceAfter: number; createdAt: Date
}
const CreditTransactionSchema = new Schema<ICreditTransaction>({
  userId: { type: String, required: true }, amount: Number,
  type: { type: String, enum: ['earn', 'spend'] },
  reason: String, balanceAfter: Number,
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   TEAM MEMBER
══════════════════════════════════════════════════════════════ */
export interface ITeamMember extends Document {
  name: string; role: string; category: string; bio: string; order: number
}
const TeamMemberSchema = new Schema<ITeamMember>({
  name: String, role: String,
  category: { type: String, enum: ['education', 'product', 'community'] },
  bio: String, order: { type: Number, default: 0 },
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   LEADERBOARD ENTRY (cache / snapshot)
══════════════════════════════════════════════════════════════ */
export interface ILeaderboardEntry extends Document {
  rank: number; username: string; xp: number; streak: number
  badge: string; specialty: string; userId?: string
}
const LeaderboardEntrySchema = new Schema<ILeaderboardEntry>({
  rank: Number, username: { type: String, unique: true }, xp: Number,
  streak: Number, badge: String, specialty: String, userId: String,
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   SITE SETTINGS
══════════════════════════════════════════════════════════════ */
export interface ISiteSettings extends Document {
  key: string
  siteName: string
  heroKicker: string
  heroTagline: string
  systemStatusText: string
  maintenanceMode: boolean
  registrationOpen: boolean
  defaultUserCredits: number
  defaultUserXp: number
  announcementTicker: string
  discordUrl: string
  githubUrl: string
  terminalWelcomeMsg: string
  hunterCount: number
  challengeCount: number
  badgeCount: number
  missionBeliefs: { title: string; copy: string }[]
  academyMethods: { title: string; copy: string }[]
}
const SiteSettingsSchema = new Schema<ISiteSettings>({
  key: { type: String, default: 'global', unique: true },
  siteName: { type: String, default: 'ZERO HUNT' },
  heroKicker: { type: String, default: 'THE CYBERSECURITY ACADEMY' },
  heroTagline: { type: String, default: 'Cybersecurity is not a spectator sport. Build the skills, sharpen your instincts, and find what others miss.' },
  systemStatusText: { type: String, default: 'SYSTEM STATUS: ONLINE' },
  maintenanceMode: { type: Boolean, default: false },
  registrationOpen: { type: Boolean, default: true },
  defaultUserCredits: { type: Number, default: 120 },
  defaultUserXp: { type: Number, default: 500 },
  announcementTicker: { type: String, default: 'LIVE: Zero-Day Challenge Series 2026 is now live across all regions' },
  discordUrl: { type: String, default: 'https://discord.gg/zerohunt' },
  githubUrl: { type: String, default: 'https://github.com/zerohunt' },
  terminalWelcomeMsg: { type: String, default: 'Zero Hunt Sandbox Terminal v4.2.0 (Linux x86_64)' },
  hunterCount: { type: Number, default: 24000 },
  challengeCount: { type: Number, default: 145 },
  badgeCount: { type: Number, default: 42 },
  missionBeliefs: [{ title: String, copy: String }],
  academyMethods: [{ title: String, copy: String }],
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   BROADCAST
══════════════════════════════════════════════════════════════ */
export interface IBroadcast extends Document {
  title: string
  message: string
  level: 'info' | 'warning' | 'alert' | 'success'
  link?: string
  linkText?: string
  active: boolean
  pinned: boolean
  author?: string
  createdAt: Date
}
const BroadcastSchema = new Schema<IBroadcast>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  level: { type: String, enum: ['info', 'warning', 'alert', 'success'], default: 'info' },
  link: { type: String, default: '' },
  linkText: { type: String, default: 'VIEW INTEL' },
  active: { type: Boolean, default: true },
  pinned: { type: Boolean, default: false },
  author: { type: String, default: 'HQ Security Command' },
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   ADMIN USER
══════════════════════════════════════════════════════════════ */
export interface IAdminUser extends Document {
  email: string; passwordHash: string; name: string; createdAt: Date
}
const AdminUserSchema = new Schema<IAdminUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: String, name: String,
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   CERTIFICATE
══════════════════════════════════════════════════════════════ */
export interface ICertificate extends Document {
  certificateId: string
  userId: string
  username: string
  userDisplayName: string
  courseSlug: string
  courseTitle: string
  quizId: string
  quizTitle: string
  score: number
  grade: 'Distinction' | 'Proficient' | 'Certified'
  issuedAt: Date
  signature: string
  createdAt: Date
  updatedAt: Date
}
const CertificateSchema = new Schema<ICertificate>({
  certificateId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  userDisplayName: { type: String, default: '' },
  courseSlug: { type: String, required: true },
  courseTitle: { type: String, required: true },
  quizId: { type: String, required: true },
  quizTitle: { type: String, required: true },
  score: { type: Number, required: true },
  grade: { type: String, enum: ['Distinction', 'Proficient', 'Certified'], default: 'Certified' },
  issuedAt: { type: Date, default: Date.now },
  signature: { type: String, required: true },
}, { timestamps: true })

/* ══════════════════════════════════════════════════════════════
   EXPORTS
══════════════════════════════════════════════════════════════ */
export const Course            = models.Course            || model('Course', CourseSchema)
export const Badge             = models.Badge             || model('Badge', BadgeSchema)
export const StoreItem         = models.StoreItem         || model('StoreItem', StoreItemSchema)
export const User              = models.User              || model('User', UserSchema)
export const Quiz              = models.Quiz              || model('Quiz', QuizSchema)
export const QuizAttempt       = models.QuizAttempt       || model('QuizAttempt', QuizAttemptSchema)
export const Certificate       = models.Certificate       || model('Certificate', CertificateSchema)
export const CreditTransaction = models.CreditTransaction || model('CreditTransaction', CreditTransactionSchema)
export const TeamMember        = models.TeamMember        || model('TeamMember', TeamMemberSchema)
export const LeaderboardEntry  = models.LeaderboardEntry  || model('LeaderboardEntry', LeaderboardEntrySchema)
export const SiteSettings      = models.SiteSettings      || model('SiteSettings', SiteSettingsSchema)
export const AdminUser         = models.AdminUser         || model('AdminUser', AdminUserSchema)
export const Broadcast         = models.Broadcast         || model('Broadcast', BroadcastSchema)
