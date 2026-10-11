/**
 * Seed script — run with:
 *   node --loader ts-node/esm scripts/seed.mjs
 * OR (simpler):
 *   npx tsx scripts/seed.ts
 *
 * Make sure MONGODB_URI is set in .env.local first.
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error('❌  Set MONGODB_URI in .env.local')
  process.exit(1)
}

await mongoose.connect(MONGODB_URI)
console.log('✅  Connected to MongoDB')

/* ── Models (inline to avoid ESM import issues in scripts) ────────── */

const CourseSchema = new mongoose.Schema({
  number: String, title: String, slug: String, level: String,
  lessons: Number, accent: String, description: String, longDescription: String,
  tags: [String], featured: Boolean, order: Number,
  xpReward: Number, enrolledCount: Number, isPremium: Boolean,
  courseFile: String,
}, { timestamps: true })

const TeamMemberSchema = new mongoose.Schema({
  name: String, role: String, category: String, bio: String, order: Number,
}, { timestamps: true })

const LeaderboardEntrySchema = new mongoose.Schema({
  rank: Number, username: String, xp: Number, streak: Number, badge: String, specialty: String,
}, { timestamps: true })

const SiteSettingsSchema = new mongoose.Schema({
  key: { type: String, unique: true }, hunterCount: Number, challengeCount: Number,
  badgeCount: Number,
  missionBeliefs: [{ title: String, copy: String }],
  academyMethods: [{ title: String, copy: String }],
}, { timestamps: true })

const AdminUserSchema = new mongoose.Schema({
  email: { type: String, unique: true }, passwordHash: String, name: String,
}, { timestamps: true })

const Course = mongoose.models.Course || mongoose.model('Course', CourseSchema)
const TeamMember = mongoose.models.TeamMember || mongoose.model('TeamMember', TeamMemberSchema)
const LeaderboardEntry = mongoose.models.LeaderboardEntry || mongoose.model('LeaderboardEntry', LeaderboardEntrySchema)
const SiteSettings = mongoose.models.SiteSettings || mongoose.model('SiteSettings', SiteSettingsSchema)
const AdminUser = mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema)

/* ── Wipe existing data ───────────────────────────────────────────── */
await Course.deleteMany({})
await TeamMember.deleteMany({})
await LeaderboardEntry.deleteMany({})
await SiteSettings.deleteMany({})
await AdminUser.deleteMany({})

/* ── Courses (10 real courses) ───────────────────────────────────── */
await Course.insertMany([
  {
    number: '01', title: 'Cybersecurity Foundations', slug: 'cybersecurity-foundations',
    level: 'Beginner', lessons: 12, accent: 'lime', featured: true, order: 1,
    xpReward: 120, enrolledCount: 8420, isPremium: false,
    description: 'The essential mental models, vocabulary, and habits every hunter needs.',
    longDescription: 'Start from zero. This course gives you the language, mindset, and foundational knowledge to navigate the world of cybersecurity with confidence. Covers threat landscapes, the CIA triad, basic networking, and how defenders think.',
    tags: ['networking', 'fundamentals', 'terminology'],
  },
  {
    number: '02', title: 'Web Hacking Essentials', slug: 'web-hacking-essentials',
    level: 'Intermediate', lessons: 18, accent: 'blue', featured: true, order: 2,
    xpReward: 180, enrolledCount: 6210, isPremium: false,
    description: 'Understand the web stack and learn how to test it safely.',
    longDescription: 'Dive into the HTTP protocol, browser security model, cookies, and authentication flows. Practice finding and exploiting the OWASP Top 10 vulnerabilities including SQL injection, XSS, CSRF, and more in safe lab environments.',
    tags: ['web', 'owasp', 'http', 'xss', 'sqli'],
  },
  {
    number: '03', title: 'The Art of Reconnaissance', slug: 'art-of-reconnaissance',
    level: 'Intermediate', lessons: 9, accent: 'violet', featured: true, order: 3,
    xpReward: 90, enrolledCount: 4850, isPremium: false,
    description: 'Turn scattered signals into useful intelligence before the first exploit.',
    longDescription: 'Learn passive and active reconnaissance techniques. Cover OSINT tools, DNS enumeration, Google dorking, Shodan, social engineering surfaces, and how to build a target profile like a professional red-teamer.',
    tags: ['osint', 'recon', 'dns', 'enumeration'],
  },
  {
    number: '04', title: 'Linux for Hackers', slug: 'linux-for-hackers',
    level: 'Beginner', lessons: 15, accent: 'lime', featured: true, order: 4,
    xpReward: 150, enrolledCount: 7130, isPremium: false,
    description: 'Master the command line — the most powerful tool in a hunter\'s arsenal.',
    longDescription: 'Linux is the operating system of security. Learn the shell, file permissions, process management, networking tools, scripting, and how to navigate Kali Linux. Includes practical CTF-style challenges throughout.',
    tags: ['linux', 'bash', 'kali', 'cli'],
  },
  {
    number: '05', title: 'Network Security & Protocols', slug: 'network-security-protocols',
    level: 'Intermediate', lessons: 14, accent: 'blue', featured: true, order: 5,
    xpReward: 140, enrolledCount: 3920, isPremium: false,
    description: 'Understand how networks work so you know exactly where they break.',
    longDescription: 'From TCP/IP to TLS, this course breaks down how modern network protocols work and where they fail. Learn to use Wireshark, nmap, and netcat. Practice ARP spoofing, MITM attacks, and network-layer defence.',
    tags: ['networking', 'protocols', 'wireshark', 'mitm'],
  },
  {
    number: '06', title: 'Malware Analysis & Reverse Engineering', slug: 'malware-analysis',
    level: 'Advanced', lessons: 16, accent: 'violet', featured: true, order: 6,
    xpReward: 240, enrolledCount: 2140, isPremium: true,
    description: 'Dissect real-world malware and understand what it\'s actually doing.',
    longDescription: 'Set up a safe analysis environment and examine real malware samples. Learn static analysis with strings and Ghidra, dynamic analysis with sandboxes, and how to write YARA rules. Covers ransomware, RATs, and droppers.',
    tags: ['malware', 'reverse-engineering', 'ghidra', 'yara'],
  },
  {
    number: '07', title: 'Cryptography for Defenders', slug: 'cryptography-defenders',
    level: 'Intermediate', lessons: 11, accent: 'lime', featured: true, order: 7,
    xpReward: 110, enrolledCount: 3310, isPremium: false,
    description: 'Understand the cryptographic primitives that keep data safe — and when they don\'t.',
    longDescription: 'Covers symmetric and asymmetric encryption, hashing, digital signatures, PKI, TLS internals, and common cryptographic mistakes. Includes hands-on challenges breaking weak implementations of classic ciphers.',
    tags: ['cryptography', 'tls', 'pki', 'hashing'],
  },
  {
    number: '08', title: 'Penetration Testing Methodology', slug: 'penetration-testing-methodology',
    level: 'Advanced', lessons: 20, accent: 'blue', featured: true, order: 8,
    xpReward: 280, enrolledCount: 1780, isPremium: true,
    description: 'A full-cycle pentest from scoping to reporting — done right.',
    longDescription: 'Follow the professional penetration testing lifecycle: scoping, recon, exploitation, post-exploitation, pivoting, and reporting. Uses Metasploit, Burp Suite Pro, and custom scripts. Mirrors real-world engagements.',
    tags: ['pentest', 'metasploit', 'burp', 'red-team'],
  },
  {
    number: '09', title: 'Cloud Security Fundamentals', slug: 'cloud-security-fundamentals',
    level: 'Intermediate', lessons: 13, accent: 'violet', featured: true, order: 9,
    xpReward: 160, enrolledCount: 2940, isPremium: false,
    description: 'Secure AWS, GCP, and Azure environments against modern cloud threats.',
    longDescription: 'Understand shared responsibility models, IAM misconfigurations, S3 bucket exposure, Lambda security, container security, and cloud-native attack paths. Hands-on labs use real cloud trial accounts.',
    tags: ['aws', 'cloud', 'iam', 'containers'],
  },
  {
    number: '10', title: 'Threat Intelligence & Incident Response', slug: 'threat-intelligence-ir',
    level: 'Advanced', lessons: 17, accent: 'lime', featured: true, order: 10,
    xpReward: 220, enrolledCount: 1560, isPremium: true,
    description: 'Go from alert to resolution — understand and respond to real breaches.',
    longDescription: 'Learn how SOC analysts triage alerts, how threat intel feeds into defence, and how incident response teams work through the kill chain. Covers SIEM tooling, log analysis, MITRE ATT&CK, and building playbooks.',
    tags: ['soc', 'siem', 'mitre', 'incident-response'],
  },
])

/* ── Team Members ───────────────────────────────────────────────────── */
await TeamMember.insertMany([
  { name: 'The Educators', role: 'Security Educators', category: 'education', order: 1, bio: 'Practitioners who turn hard-won experience into clear, no-nonsense lessons that actually work in the real world.' },
  { name: 'The Builders', role: 'Product & Engineering', category: 'product', order: 2, bio: 'Product minds obsessed with crafting a better way to learn and practice cybersecurity at every skill level.' },
  { name: 'The Community', role: 'Community & Growth', category: 'community', order: 3, bio: 'Hunters who share knowledge, curiosity, and momentum — growing the Zero Hunt community every single day.' },
])

/* ── Leaderboard ────────────────────────────────────────────────────── */
await LeaderboardEntry.insertMany([
  { rank: 1, username: 'NIGHTOWL', xp: 12840, streak: 47, badge: '🦉', specialty: 'Recon specialist with a perfect weekly streak. Top of the Linux path.' },
  { rank: 2, username: 'PACKETPUNK', xp: 11420, streak: 31, badge: '📡', specialty: 'Web hunter climbing fast through the labs. Completed every web module.' },
  { rank: 3, username: 'ROOTED', xp: 10980, streak: 28, badge: '🌳', specialty: 'Linux tactician. Three challenge chains completed this month.' },
  { rank: 4, username: 'SHELLSHOCKER', xp: 9750, streak: 22, badge: '💥', specialty: 'Exploit developer with focus on buffer overflows.' },
  { rank: 5, username: 'ARPWATCH', xp: 8930, streak: 19, badge: '🔍', specialty: 'Network analyst and traffic auditor.' },
  { rank: 6, username: 'CIPHERBREAKER', xp: 8420, streak: 15, badge: '🔑', specialty: 'Cryptography specialist — loves breaking weak ciphers.' },
  { rank: 7, username: 'REDTEAM_X', xp: 7680, streak: 14, badge: '🎯', specialty: 'Penetration tester with enterprise experience.' },
  { rank: 8, username: 'MALWAREWITCH', xp: 7210, streak: 12, badge: '🧙', specialty: 'Malware analyst and reverse engineer.' },
  { rank: 9, username: 'CLOUDPOKER', xp: 6850, streak: 9, badge: '☁️', specialty: 'Cloud security researcher, AWS IAM expert.' },
  { rank: 10, username: 'PWNSTAR', xp: 6420, streak: 8, badge: '⭐', specialty: 'CTF champion — 47 flags captured this season.' },
])

/* ── Site Settings ──────────────────────────────────────────────────── */
await SiteSettings.create({
  key: 'global',
  hunterCount: 24000,
  challengeCount: 145,
  badgeCount: 42,
  missionBeliefs: [
    { title: 'Make security human', copy: 'Remove the jargon and give curious people a clear place to begin. Security is for everyone.' },
    { title: 'Practice responsibly', copy: 'Learn to break things safely, ethically, and with intent. Real skills, real ethics.' },
    { title: 'Share the signal', copy: 'Build a global community that helps more people defend what matters most.' },
  ],
  academyMethods: [
    { title: 'Learn by doing', copy: 'Short lessons, real tools, and zero filler. Every module is built around a practical outcome.' },
    { title: 'Practice anywhere', copy: 'Curated labs for every stage of your journey. No environment setup required.' },
    { title: 'Earn your edge', copy: 'Collect XP, unlock perks, and rise through the ranks. Progress that actually means something.' },
  ],
})

/* ── Admin User ─────────────────────────────────────────────────────── */
const passwordHash = await bcrypt.hash('admin123', 12)
await AdminUser.create({ email: 'admin@zerohunt.io', passwordHash, name: 'Zero Hunt Admin' })

console.log('✅  Seeded:')
console.log('   10 courses')
console.log('   3 team member categories')
console.log('   10 leaderboard entries')
console.log('   Site settings')
console.log('   Admin user: admin@zerohunt.io / admin123')
console.log('')
console.log('⚠️   Change the admin password in production!')

await mongoose.disconnect()
