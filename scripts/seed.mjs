// seed.mjs — run with: node scripts/seed.mjs
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://manankamboj66_db_user:manankamboj2010@cluster0.dcio5tf.mongodb.net/zerohunt?appName=Cluster0'

await mongoose.connect(MONGODB_URI)
console.log('✅  Connected to MongoDB')

const C = (name, schema) => mongoose.models[name] || mongoose.model(name, schema)

const CourseSchema = new mongoose.Schema({ number: String, title: String, slug: { type: String, unique: true }, level: String, lessons: Number, accent: String, description: String, longDescription: String, tags: [String], featured: Boolean, order: Number, xpReward: Number, creditReward: Number, enrolledCount: Number, isPremium: Boolean, courseFile: String }, { timestamps: true })
const TeamSchema = new mongoose.Schema({ name: String, role: String, category: String, bio: String, order: Number }, { timestamps: true })
const LbSchema = new mongoose.Schema({ rank: Number, username: { type: String, unique: true }, xp: Number, streak: Number, badge: String, specialty: String, userId: String }, { timestamps: true })
const SettingsSchema = new mongoose.Schema({ key: { type: String, unique: true }, hunterCount: Number, challengeCount: Number, badgeCount: Number, missionBeliefs: [{ title: String, copy: String }], academyMethods: [{ title: String, copy: String }] }, { timestamps: true })
const AdminSchema = new mongoose.Schema({ email: { type: String, unique: true }, passwordHash: String, name: String }, { timestamps: true })
const BadgeSchema = new mongoose.Schema({ name: String, slug: { type: String, unique: true }, description: String, icon: String, condition: String, conditionValue: Number, tier: String, creditBonus: Number }, { timestamps: true })
const StoreSchema = new mongoose.Schema({ name: String, description: String, icon: String, type: String, creditCost: Number, stock: Number, active: Boolean, courseRef: String }, { timestamps: true })
const QuizSchema = new mongoose.Schema({ title: String, slug: { type: String, unique: true }, courseRef: String, description: String, difficulty: String, questions: [{ question: String, options: [String], correctIndex: Number, explanation: String }], xpReward: Number, creditReward: Number, passingScore: Number, timeLimit: Number, active: Boolean, attemptCount: Number }, { timestamps: true })

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true }, email: { type: String, unique: true },
  passwordHash: String, displayName: String, bio: String, avatarColor: String,
  xp: Number, credits: Number, globalRank: Number, streak: Number,
  badges: [String], completedCourses: [String], completedQuizzes: [String],
  ownedItems: [String],
  settings: { emailNotifications: Boolean, publicProfile: Boolean, theme: String }
}, { timestamps: true })

const Course = C('Course', CourseSchema)
const TeamMember = C('TeamMember', TeamSchema)
const LeaderboardEntry = C('LeaderboardEntry', LbSchema)
const SiteSettings = C('SiteSettings', SettingsSchema)
const AdminUser = C('AdminUser', AdminSchema)
const Badge = C('Badge', BadgeSchema)
const StoreItem = C('StoreItem', StoreSchema)
const Quiz = C('Quiz', QuizSchema)
const User = C('User', UserSchema)

// Wipe
await Promise.all([Course, TeamMember, LeaderboardEntry, SiteSettings, AdminUser, Badge, StoreItem, Quiz, User].map(M => M.deleteMany({})))

// ── Courses ──────────────────────────────────────────────────────────
await Course.insertMany([
  { number:'01', title:'Cybersecurity Foundations', slug:'cybersecurity-foundations', level:'Beginner', lessons:12, accent:'lime', featured:true, order:1, xpReward:120, creditReward:18, enrolledCount:8420, isPremium:false, description:'The essential mental models, vocabulary, and habits every hunter needs.', longDescription:'Start from zero. This course gives you the language, mindset, and foundational knowledge to navigate the world of cybersecurity with confidence. Covers threat landscapes, the CIA triad, basic networking, and how defenders think.', tags:['networking','fundamentals','terminology'] },
  { number:'02', title:'Web Hacking Essentials', slug:'web-hacking-essentials', level:'Intermediate', lessons:18, accent:'blue', featured:true, order:2, xpReward:180, creditReward:25, enrolledCount:6210, isPremium:false, description:'Understand the web stack and learn how to test it safely.', longDescription:'Dive into HTTP, browser security, cookies, and authentication flows. Practice finding and exploiting OWASP Top 10 vulnerabilities including SQL injection, XSS, and CSRF.', tags:['web','owasp','http','xss','sqli'] },
  { number:'03', title:'The Art of Reconnaissance', slug:'art-of-reconnaissance', level:'Intermediate', lessons:9, accent:'violet', featured:true, order:3, xpReward:90, creditReward:14, enrolledCount:4850, isPremium:false, description:'Turn scattered signals into useful intelligence before the first exploit.', longDescription:'Learn passive and active recon: OSINT, DNS enumeration, Google dorking, Shodan, and building a target profile like a pro.', tags:['osint','recon','dns','enumeration'] },
  { number:'04', title:'Linux for Hackers', slug:'linux-for-hackers', level:'Beginner', lessons:15, accent:'lime', featured:true, order:4, xpReward:150, creditReward:22, enrolledCount:7130, isPremium:false, description:"Master the command line — the most powerful tool in a hunter's arsenal.", longDescription:'Linux is the OS of security. Learn the shell, file permissions, process management, networking tools, scripting, and Kali Linux.', tags:['linux','bash','kali','cli'] },
  { number:'05', title:'Network Security & Protocols', slug:'network-security-protocols', level:'Intermediate', lessons:14, accent:'blue', featured:true, order:5, xpReward:140, creditReward:20, enrolledCount:3920, isPremium:false, description:'Understand how networks work so you know exactly where they break.', longDescription:'TCP/IP to TLS — learn protocols and where they fail. Use Wireshark, nmap, netcat. Practice ARP spoofing, MITM, and network defence.', tags:['networking','protocols','wireshark','mitm'] },
  { number:'06', title:'Malware Analysis & Reverse Engineering', slug:'malware-analysis', level:'Advanced', lessons:16, accent:'violet', featured:true, order:6, xpReward:240, creditReward:35, enrolledCount:2140, isPremium:true, description:"Dissect real-world malware and understand what it's doing.", longDescription:'Set up a safe analysis environment. Static analysis with Ghidra, dynamic analysis with sandboxes, YARA rules. Covers ransomware, RATs, and droppers.', tags:['malware','reverse-engineering','ghidra','yara'] },
  { number:'07', title:'Cryptography for Defenders', slug:'cryptography-defenders', level:'Intermediate', lessons:11, accent:'lime', featured:true, order:7, xpReward:110, creditReward:16, enrolledCount:3310, isPremium:false, description:"Understand the cryptographic primitives that keep data safe — and when they don't.", longDescription:'Symmetric/asymmetric encryption, hashing, digital signatures, PKI, TLS internals, and common mistakes. Break weak cipher implementations in hands-on challenges.', tags:['cryptography','tls','pki','hashing'] },
  { number:'08', title:'Penetration Testing Methodology', slug:'penetration-testing-methodology', level:'Advanced', lessons:20, accent:'blue', featured:true, order:8, xpReward:280, creditReward:40, enrolledCount:1780, isPremium:true, description:'A full-cycle pentest from scoping to reporting — done right.', longDescription:'Full pentest lifecycle: scoping, recon, exploitation, post-exploitation, pivoting, reporting. Metasploit, Burp Suite Pro, custom scripts.', tags:['pentest','metasploit','burp','red-team'] },
  { number:'09', title:'Cloud Security Fundamentals', slug:'cloud-security-fundamentals', level:'Intermediate', lessons:13, accent:'violet', featured:true, order:9, xpReward:160, creditReward:24, enrolledCount:2940, isPremium:false, description:'Secure AWS, GCP, and Azure environments against modern cloud threats.', longDescription:'Shared responsibility, IAM misconfigurations, S3 bucket exposure, Lambda security, container security, cloud-native attack paths.', tags:['aws','cloud','iam','containers'] },
  { number:'10', title:'Threat Intelligence & Incident Response', slug:'threat-intelligence-ir', level:'Advanced', lessons:17, accent:'lime', featured:true, order:10, xpReward:220, creditReward:32, enrolledCount:1560, isPremium:true, description:'Go from alert to resolution — understand and respond to real breaches.', longDescription:'SOC triage, threat intel, incident response through the kill chain. SIEM, log analysis, MITRE ATT&CK, and building playbooks.', tags:['soc','siem','mitre','incident-response'] },
])

// ── Team ─────────────────────────────────────────────────────────────
await TeamMember.insertMany([
  { name:'The Educators', role:'Security Educators', category:'education', order:1, bio:'Practitioners who turn hard-won experience into clear, no-nonsense lessons that actually work in the real world.' },
  { name:'The Builders', role:'Product & Engineering', category:'product', order:2, bio:'Product minds obsessed with crafting a better way to learn and practice cybersecurity at every skill level.' },
  { name:'The Community', role:'Community & Growth', category:'community', order:3, bio:'Hunters who share knowledge, curiosity, and momentum — growing the Zero Hunt community every single day.' },
])

// ── Leaderboard ──────────────────────────────────────────────────────
await LeaderboardEntry.insertMany([
  { rank:1, username:'NIGHTOWL', xp:12840, streak:47, badge:'🦉', specialty:'Recon specialist with a perfect weekly streak. Top of the Linux path.' },
  { rank:2, username:'PACKETPUNK', xp:11420, streak:31, badge:'📡', specialty:'Web hunter climbing fast through the labs. Completed every web module.' },
  { rank:3, username:'ROOTED', xp:10980, streak:28, badge:'🌳', specialty:'Linux tactician. Three challenge chains completed this month.' },
  { rank:4, username:'SHELLSHOCKER', xp:9750, streak:22, badge:'💥', specialty:'Exploit developer focused on buffer overflows.' },
  { rank:5, username:'ARPWATCH', xp:8930, streak:19, badge:'🔍', specialty:'Network analyst and traffic auditor.' },
  { rank:6, username:'CIPHERBREAKER', xp:8420, streak:15, badge:'🔑', specialty:'Cryptography specialist — loves breaking weak ciphers.' },
  { rank:7, username:'REDTEAM_X', xp:7680, streak:14, badge:'🎯', specialty:'Penetration tester with enterprise experience.' },
  { rank:8, username:'MALWAREWITCH', xp:7210, streak:12, badge:'🧙', specialty:'Malware analyst and reverse engineer.' },
  { rank:9, username:'CLOUDPOKER', xp:6850, streak:9, badge:'☁️', specialty:'Cloud security researcher, AWS IAM expert.' },
  { rank:10, username:'PWNSTAR', xp:6420, streak:8, badge:'⭐', specialty:'CTF champion — 47 flags captured this season.' },
])

// ── Site Settings ────────────────────────────────────────────────────
await SiteSettings.create({
  key:'global', hunterCount:24000, challengeCount:145, badgeCount:42,
  missionBeliefs:[
    { title:'Make security human', copy:'Remove the jargon and give curious people a clear place to begin. Security is for everyone.' },
    { title:'Practice responsibly', copy:'Learn to break things safely, ethically, and with intent. Real skills, real ethics.' },
    { title:'Share the signal', copy:'Build a global community that helps more people defend what matters most.' },
  ],
  academyMethods:[
    { title:'LEARN BY DOING', copy:'Short lessons, real tools, and zero filler. Every module is built around a practical outcome.' },
    { title:'PRACTICE ANYWHERE', copy:'Curated labs for every stage of your journey. No environment setup required.' },
    { title:'EARN YOUR EDGE', copy:'Collect XP, unlock perks, and rise through the ranks. Progress that actually means something.' },
  ],
})

// ── Badges ───────────────────────────────────────────────────────────
await Badge.insertMany([
  { name:'First Hunt', slug:'first-hunt', description:'Complete your first quiz', icon:'🎯', condition:'quiz_count', conditionValue:1, tier:'bronze', creditBonus:10 },
  { name:'Quiz Streak', slug:'quiz-streak', description:'Complete 5 quizzes', icon:'🔥', condition:'quiz_count', conditionValue:5, tier:'bronze', creditBonus:25 },
  { name:'Knowledge Seeker', slug:'knowledge-seeker', description:'Complete 10 quizzes', icon:'📚', condition:'quiz_count', conditionValue:10, tier:'silver', creditBonus:50 },
  { name:'Quiz Master', slug:'quiz-master', description:'Complete 25 quizzes', icon:'👑', condition:'quiz_count', conditionValue:25, tier:'gold', creditBonus:100 },
  { name:'XP Rookie', slug:'xp-rookie', description:'Earn 500 XP', icon:'⚡', condition:'xp_threshold', conditionValue:500, tier:'bronze', creditBonus:15 },
  { name:'XP Hunter', slug:'xp-hunter', description:'Earn 2000 XP', icon:'🏹', condition:'xp_threshold', conditionValue:2000, tier:'silver', creditBonus:40 },
  { name:'XP Elite', slug:'xp-elite', description:'Earn 5000 XP', icon:'💎', condition:'xp_threshold', conditionValue:5000, tier:'gold', creditBonus:80 },
  { name:'XP Legend', slug:'xp-legend', description:'Earn 10000 XP', icon:'🌟', condition:'xp_threshold', conditionValue:10000, tier:'platinum', creditBonus:200 },
])

// ── Store ────────────────────────────────────────────────────────────
await StoreItem.insertMany([
  { name:'Red Hunter Theme', description:'Unlock the deep red hunter interface theme', icon:'🔴', type:'theme', creditCost:50, stock:-1, active:true },
  { name:'Cyan Operative Theme', description:'Cool cyan operative UI theme', icon:'🔵', type:'theme', creditCost:50, stock:-1, active:true },
  { name:'Gold Badge Frame', description:'Premium gold frame for your profile badge', icon:'🖼️', type:'badge_frame', creditCost:80, stock:-1, active:true },
  { name:'XP Boost x1.5', description:'1.5× XP multiplier for 24 hours', icon:'⚡', type:'xp_boost', creditCost:120, stock:-1, active:true },
  { name:'Malware Analysis Unlock', description:'Early access to the Malware Analysis course', icon:'🧬', type:'course_unlock', creditCost:200, stock:-1, active:true, courseRef:'malware-analysis' },
  { name:'Recon Expert Badge', description:'Show the world you mastered recon', icon:'🔍', type:'cosmetic', creditCost:35, stock:-1, active:true },
])

// ── Quizzes ──────────────────────────────────────────────────────────
await Quiz.insertMany([
  {
    title:'Cybersecurity Fundamentals Quiz', slug:'cybersecurity-fundamentals-quiz',
    courseRef:'cybersecurity-foundations', description:'Test your knowledge of core cybersecurity concepts.',
    difficulty:'easy', xpReward:80, creditReward:12, passingScore:70, timeLimit:480, active:true, attemptCount:0,
    questions:[
      { question:'What does CIA stand for in cybersecurity?', options:['Confidentiality, Integrity, Availability','Central Intelligence Agency','Cyber Incident Analysis','Classified Information Act'], correctIndex:0, explanation:'The CIA Triad — Confidentiality, Integrity, Availability — is the foundation of information security.' },
      { question:'Which of these is an example of a phishing attack?', options:['Sending a fake email to steal credentials','Overloading a server with traffic','Exploiting a buffer overflow','Intercepting network packets'], correctIndex:0, explanation:'Phishing uses fake emails/sites to steal login credentials or personal information.' },
      { question:'What is a firewall?', options:['A physical barrier in data centres','A network security system that monitors and controls traffic','A type of malware','An encryption algorithm'], correctIndex:1, explanation:'A firewall monitors and controls incoming/outgoing network traffic based on security rules.' },
      { question:'What does VPN stand for?', options:['Virtual Private Network','Verified Protocol Node','Variable Packet Navigation','Virtual Public Network'], correctIndex:0, explanation:'VPN (Virtual Private Network) encrypts your internet connection and hides your IP address.' },
      { question:'Which protocol is used for secure web browsing?', options:['HTTP','FTP','HTTPS','SMTP'], correctIndex:2, explanation:'HTTPS (HTTP Secure) encrypts communication between your browser and web servers using TLS.' },
    ],
  },
  {
    title:'Web Hacking Basics Quiz', slug:'web-hacking-basics-quiz',
    courseRef:'web-hacking-essentials', description:'Test your web security knowledge.',
    difficulty:'medium', xpReward:120, creditReward:18, passingScore:70, timeLimit:600, active:true, attemptCount:0,
    questions:[
      { question:'What does SQL injection exploit?', options:['Weak passwords','Unsanitised database queries','Buffer overflow','Weak encryption'], correctIndex:1, explanation:'SQL injection inserts malicious SQL code into queries through unsanitised user input.' },
      { question:'What is XSS (Cross-Site Scripting)?', options:['A type of DDoS attack','Injecting malicious scripts into web pages viewed by other users','A network scanning technique','A type of ransomware'], correctIndex:1, explanation:'XSS allows attackers to inject client-side scripts into pages viewed by other users.' },
      { question:'What HTTP status code means "Forbidden"?', options:['401','404','403','500'], correctIndex:2, explanation:'HTTP 403 Forbidden means the server understands the request but refuses to authorise it.' },
      { question:'What is CSRF?', options:['Cross-Site Request Forgery','Cyber Security Response Framework','Cross-Server Resource Fetch','Content Security Ruleset Filter'], correctIndex:0, explanation:'CSRF tricks authenticated users into submitting requests they did not intend to make.' },
      { question:'Which HTTP method is typically used to submit a form?', options:['GET','PUT','POST','DELETE'], correctIndex:2, explanation:'POST is used to submit data (like form data) to be processed by the server.' },
    ],
  },
  {
    title:'Linux Command Line Quiz', slug:'linux-cli-quiz',
    courseRef:'linux-for-hackers', description:'Prove your Linux shell skills.',
    difficulty:'easy', xpReward:80, creditReward:12, passingScore:70, timeLimit:480, active:true, attemptCount:0,
    questions:[
      { question:'Which command lists files in a directory?', options:['dir','ls','list','show'], correctIndex:1, explanation:'`ls` lists directory contents. `ls -la` shows all files including hidden ones with details.' },
      { question:'How do you make a file executable in Linux?', options:['chmod +x file','chown +x file','exec file','run file'], correctIndex:0, explanation:'`chmod +x file` adds execute permission to the file for all users.' },
      { question:'Which command shows the current directory?', options:['cd','dir','pwd','loc'], correctIndex:2, explanation:'`pwd` (Print Working Directory) shows your current location in the filesystem.' },
      { question:'What does `sudo` do?', options:['Switches user','Runs a command as superuser/root','Saves a file','Shows user details'], correctIndex:1, explanation:'`sudo` (Super User DO) runs a command with root/superuser privileges.' },
      { question:'Which file contains user password hashes in Linux?', options:['/etc/passwd','/etc/shadow','/etc/users','/var/passwords'], correctIndex:1, explanation:'`/etc/shadow` stores hashed passwords. `/etc/passwd` is readable by all users but contains no passwords.' },
    ],
  },
])

// ── Users ────────────────────────────────────────────────────────────
const userHash = await bcrypt.hash('hunter2026!', 10)
await User.insertMany([
  {
    username: 'ghost_hunter', email: 'ghost@zerohunt.io', passwordHash: userHash,
    displayName: 'Ghost Hunter', bio: 'Offensive security enthusiast & bug hunter. Breaking web apps and breaking bad habits.',
    avatarColor: '#FF4D5E', xp: 2840, credits: 120, globalRank: 24, streak: 7,
    badges: ['first-blood', 'recon-master'], completedCourses: [], completedQuizzes: [], ownedItems: [],
    settings: { emailNotifications: true, publicProfile: true, theme: 'dark' }
  },
  {
    username: 'cipher_fox', email: 'cipher@zerohunt.io', passwordHash: userHash,
    displayName: 'Cipher Fox', bio: 'Cryptography researcher and reverse engineering lab rat.',
    avatarColor: '#a855f7', xp: 4120, credits: 240, globalRank: 12, streak: 15,
    badges: ['first-blood', 'quiz-streak-5', 'xp-legend'], completedCourses: [], completedQuizzes: [], ownedItems: [],
    settings: { emailNotifications: true, publicProfile: true, theme: 'dark' }
  },
  {
    username: 'null_pointer', email: 'null@zerohunt.io', passwordHash: userHash,
    displayName: 'Null Pointer', bio: 'Kernel exploits, low-level memory corruption and assembly tinkering.',
    avatarColor: '#3b82f6', xp: 5980, credits: 380, globalRank: 5, streak: 22,
    badges: ['first-blood', 'quiz-streak-5', 'xp-legend', 'speed-demon'], completedCourses: [], completedQuizzes: [], ownedItems: [],
    settings: { emailNotifications: true, publicProfile: true, theme: 'dark' }
  }
])

// ── Admin User ───────────────────────────────────────────────────────
const passwordHash = await bcrypt.hash('admin123', 12)
await AdminUser.create({ email:'admin@zerohunt.io', passwordHash, name:'Zero Hunt Admin' })

console.log('✅  Seeded: 10 courses, 3 team members, 10 leaderboard entries, site settings, 8 badges, 6 store items, 3 quizzes, 3 users')
console.log('   Admin: admin@zerohunt.io / admin123')
console.log('⚠️  Change admin password in production!')

await mongoose.disconnect()
