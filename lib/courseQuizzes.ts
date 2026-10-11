export interface SeedQuizData {
  title: string
  slug: string
  courseRef: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  xpReward: number
  creditReward: number
  passingScore: number
  timeLimit: number
  active: boolean
  attemptCount: number
  questions: {
    question: string
    options: string[]
    correctIndex: number
    explanation: string
  }[]
}

export const ALL_COURSE_QUIZZES: SeedQuizData[] = [
  // 1. Cybersecurity Foundations
  {
    title: 'Cybersecurity Fundamentals Certification Exam',
    slug: 'cybersecurity-fundamentals-quiz',
    courseRef: 'cybersecurity-foundations',
    description: 'Master core concepts of the CIA triad, threat vectors, defense fundamentals, and terminology.',
    difficulty: 'easy',
    xpReward: 120,
    creditReward: 18,
    passingScore: 70,
    timeLimit: 600,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'What does the CIA triad stand for in information security?',
        options: [
          'Confidentiality, Integrity, Availability',
          'Central Intelligence Agency',
          'Cyber Incident Analysis',
          'Control, Inspection, Authentication',
        ],
        correctIndex: 0,
        explanation: 'The CIA triad (Confidentiality, Integrity, Availability) represents the foundational pillars of information security.',
      },
      {
        question: 'Which social engineering attack tricks victims into revealing sensitive credentials via spoofed communications?',
        options: [
          'Phishing',
          'SQL Injection',
          'Buffer Overflow',
          'SYN Flood',
        ],
        correctIndex: 0,
        explanation: 'Phishing uses deceptive emails, websites, or messages masquerading as trustworthy entities to harvest credentials.',
      },
      {
        question: 'What is the primary function of a network firewall?',
        options: [
          'To clean infected files from client computers',
          'To monitor and filter incoming and outgoing traffic based on predetermined rules',
          'To assign public IP addresses via DHCP',
          'To store encrypted copies of sensitive database records',
        ],
        correctIndex: 1,
        explanation: 'A firewall acts as a barrier between networks, inspecting packets and enforcing security policies.',
      },
      {
        question: 'What security principle dictates that users and systems should only possess the minimum permissions necessary for their duties?',
        options: [
          'Principle of Least Privilege (PoLP)',
          'Defense in Depth',
          'Zero Trust Perimeter',
          'Separation of Environments',
        ],
        correctIndex: 0,
        explanation: 'The Principle of Least Privilege limits damage from compromises by granting only the minimum necessary rights.',
      },
      {
        question: 'What cryptographic protocol encrypts HTTP traffic between browsers and web servers to ensure transport security?',
        options: [
          'TLS (Transport Layer Security)',
          'FTP',
          'Telnet',
          'DNSSEC',
        ],
        correctIndex: 0,
        explanation: 'TLS encrypts web communications in HTTPS, preventing eavesdropping and man-in-the-middle attacks.',
      },
    ],
  },

  // 2. Web Hacking Essentials
  {
    title: 'Web Application Security & OWASP Exam',
    slug: 'web-hacking-basics-quiz',
    courseRef: 'web-hacking-essentials',
    description: 'Validate your skills across the OWASP Top 10, SQLi, Cross-Site Scripting, and authentication controls.',
    difficulty: 'medium',
    xpReward: 180,
    creditReward: 25,
    passingScore: 70,
    timeLimit: 600,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'What vulnerability occurs when untrusted user input is directly concatenated into a database query?',
        options: [
          'Cross-Site Scripting (XSS)',
          'SQL Injection (SQLi)',
          'Denial of Service (DoS)',
          'Server-Side Request Forgery (SSRF)',
        ],
        correctIndex: 1,
        explanation: 'SQL Injection allows attackers to manipulate backend database queries when inputs are not parameterized or sanitized.',
      },
      {
        question: 'How can developers reliably prevent Stored and Reflected Cross-Site Scripting (XSS)?',
        options: [
          'Proper contextual output encoding and implementing a strict Content-Security-Policy (CSP)',
          'Encrypting the database passwords with MD5',
          'Restricting HTTP requests to POST only',
          'Disabling CORS across all endpoints',
        ],
        correctIndex: 0,
        explanation: 'Contextual output encoding ensures user input is rendered safely as data rather than executable code, reinforced by CSP.',
      },
      {
        question: 'What is Cross-Site Request Forgery (CSRF)?',
        options: [
          'An attack forcing an authenticated browser to transmit unauthorized commands to a trusted application',
          'Dumping SQL database contents through blind timing queries',
          'Decrypting SSL certificates using quantum factoring',
          'Flooding a web server with half-open SYN packets',
        ],
        correctIndex: 0,
        explanation: 'CSRF exploits a web application’s automatic trust in browser session credentials (cookies) to execute unauthorized state changes.',
      },
      {
        question: 'What HTTP response header restricts the browser from embedding a page inside an <iframe>, mitigating clickjacking?',
        options: [
          'X-Frame-Options: DENY (or CSP frame-ancestors)',
          'Access-Control-Allow-Origin: *',
          'Cache-Control: no-cache',
          'X-XSS-Protection: 0',
        ],
        correctIndex: 0,
        explanation: 'X-Frame-Options: DENY (or CSP frame-ancestors \'none\') prevents malicious framing of pages.',
      },
      {
        question: 'What is an Insecure Direct Object Reference (IDOR)?',
        options: [
          'An access control flaw where an app provides direct access to objects based on user-supplied input without authorization checks',
          'An unquoted service path vulnerability on Windows servers',
          'A DNS rebinding attack that breaks browser origin boundaries',
          'A type of race condition in multi-threaded web applications',
        ],
        correctIndex: 0,
        explanation: 'IDOR occurs when an application references internal objects (like account_id=105) without validating if the current user has permission.',
      },
    ],
  },

  // 3. The Art of Reconnaissance
  {
    title: 'OSINT & Target Reconnaissance Certification',
    slug: 'art-of-reconnaissance-quiz',
    courseRef: 'art-of-reconnaissance',
    description: 'Assess capability in passive/active reconnaissance, OSINT discovery, Shodan mapping, and attack surface enumeration.',
    difficulty: 'medium',
    xpReward: 140,
    creditReward: 20,
    passingScore: 70,
    timeLimit: 600,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'What is the key difference between passive reconnaissance and active reconnaissance?',
        options: [
          'Passive recon interacts only with public secondary sources without directly touching the target; active recon sends packets directly to the target system',
          'Passive recon is illegal, whereas active recon is always legal without permission',
          'Passive recon only works on Windows machines, while active recon requires Linux',
          'Passive recon uses brute force, while active recon uses social engineering',
        ],
        correctIndex: 0,
        explanation: 'Passive recon gathers intelligence without direct contact with the target’s infrastructure, leaving no audit logs on the target.',
      },
      {
        question: 'Which DNS query type attempts to retrieve the entire zone file of a domain from a misconfigured name server?',
        options: [
          'AXFR (Zone Transfer)',
          'AAAA (IPv6 record)',
          'PTR (Reverse DNS lookup)',
          'TXT (SPF / DKIM verification)',
        ],
        correctIndex: 0,
        explanation: 'An AXFR zone transfer query requests the complete zone contents, exposing internal hostnames if not restricted.',
      },
      {
        question: 'Which Google Dork operator would search specifically for publicly exposed environment config files?',
        options: [
          'filetype:env "DB_PASSWORD"',
          'search:environment "password"',
          'show:credentials "database"',
          'inurl:login "root"',
        ],
        correctIndex: 0,
        explanation: 'Google Dorking with `filetype:env "DB_PASSWORD"` targets exposed configuration files containing database credentials.',
      },
      {
        question: 'What is Shodan primarily utilized for in offensive and defensive reconnaissance?',
        options: [
          'Indexing internet-connected devices, open ports, service banners, and IoT infrastructure',
          'Cracking salted bcrypt passwords via GPU clusters',
          'Hosting decentralized phishing landing pages',
          'Sending automated SMS spoofing payloads',
        ],
        correctIndex: 0,
        explanation: 'Shodan continually scans IPv4 space, cataloging banners, open ports, and device metadata across connected systems.',
      },
      {
        question: 'Which public repository logs SSL/TLS certificates issued for domains, providing an invaluable passive source for finding hidden subdomains?',
        options: [
          'Certificate Transparency (CT) Logs (e.g., crt.sh)',
          'BGP Routing Tables',
          'ARIN WHOIS Database',
          'NVD CVE Registry',
        ],
        correctIndex: 0,
        explanation: 'Certificate Transparency logs publicly record issued SSL certificates, exposing subdomains like staging.target.com or dev.target.com.',
      },
    ],
  },

  // 4. Linux for Hackers
  {
    title: 'Linux Systems & Shell Mastery Certification',
    slug: 'linux-cli-quiz',
    courseRef: 'linux-for-hackers',
    description: 'Test essential Linux shell commands, permissions, process handling, privilege escalation vectors, and Kali utilities.',
    difficulty: 'easy',
    xpReward: 150,
    creditReward: 22,
    passingScore: 70,
    timeLimit: 600,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'What command displays file details including permissions, owner, size, and hidden dotfiles in Linux?',
        options: [
          'ls -la',
          'dir /w',
          'show -all',
          'get -detail',
        ],
        correctIndex: 0,
        explanation: '`ls -la` lists directory contents with extended attributes (`-l`) and includes hidden files starting with a dot (`-a`).',
      },
      {
        question: 'What security implication arises when the SUID bit is set on a binary owned by root (`chmod u+s`)?',
        options: [
          'Any user executing the binary runs it with the effective privileges of the root owner',
          'The binary is automatically encrypted using AES-256',
          'The file can only be modified in single-user recovery mode',
          'The kernel drops all network sockets initiated by the process',
        ],
        correctIndex: 0,
        explanation: 'SUID (Set User ID) executes the binary with the file owner\'s permissions (often root), creating high-risk privilege escalation paths if misconfigured.',
      },
      {
        question: 'Which Linux system file stores encrypted password hashes and is only readable by root/privileged accounts?',
        options: [
          '/etc/shadow',
          '/etc/passwd',
          '/var/log/auth.log',
          '/etc/security/hashes',
        ],
        correctIndex: 0,
        explanation: '`/etc/shadow` securely holds password hashes with restrictive 0640 or 0600 permissions, whereas `/etc/passwd` is world-readable.',
      },
      {
        question: 'Which command combination searches for all active processes associated with an SSH session?',
        options: [
          'ps aux | grep ssh',
          'netstat -l | echo ssh',
          'cat /proc/ssh',
          'find / -name sshd',
        ],
        correctIndex: 0,
        explanation: '`ps aux` outputs all running processes, and piping to `grep ssh` filters for processes containing ssh.',
      },
      {
        question: 'Where are public SSH keys stored on a target Linux server to grant automated key-based access to a user?',
        options: [
          '~/.ssh/authorized_keys',
          '/etc/ssh/ssh_host_rsa_key',
          '~/.ssh/known_hosts',
          '/var/ssh/keys.db',
        ],
        correctIndex: 0,
        explanation: '`~/.ssh/authorized_keys` stores the public keys allowed to log into that account without passwords.',
      },
    ],
  },

  // 5. Network Security & Protocols
  {
    title: 'Network Security & Traffic Analysis Certification',
    slug: 'network-security-protocols-quiz',
    courseRef: 'network-security-protocols',
    description: 'Prove your grasp of TCP/IP handshakes, Wireshark packet dissection, ARP poisoning, and firewall inspection.',
    difficulty: 'medium',
    xpReward: 160,
    creditReward: 24,
    passingScore: 70,
    timeLimit: 600,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'What is the correct sequence of packets in a standard 3-way TCP handshake?',
        options: [
          'SYN -> SYN-ACK -> ACK',
          'ACK -> SYN -> FIN',
          'SYN -> ACK -> DATA',
          'RST -> SYN -> ACK',
        ],
        correctIndex: 0,
        explanation: 'TCP establishes reliable connections via the classic SYN (synchronize), SYN-ACK (acknowledge sync), and ACK sequence.',
      },
      {
        question: 'How does an ARP spoofing (poisoning) attack function on a local Ethernet subnet?',
        options: [
          'By transmitting unsolicited ARP replies associating the attacker\'s MAC address with a legitimate IP (such as the default gateway)',
          'By flooding the DNS server with spoofed UDP root zone responses',
          'By modifying BGP routes on upstream Tier-1 autonomous systems',
          'By sending malformed ICMP packets that crash network interface cards',
        ],
        correctIndex: 0,
        explanation: 'ARP lacks authentication; gratuitous ARP messages allow attackers to poison neighbors\' caches and redirect traffic through themselves (MITM).',
      },
      {
        question: 'What Nmap scan type is known as a "stealth scan" because it never completes a full TCP handshake?',
        options: [
          'TCP SYN Scan (-sS)',
          'TCP Connect Scan (-sT)',
          'UDP Scan (-sU)',
          'Ping Sweep (-sn)',
        ],
        correctIndex: 0,
        explanation: 'A SYN scan (-sS) sends a SYN, waits for SYN-ACK to confirm the port is open, and immediately responds with RST rather than ACK, avoiding connection logging.',
      },
      {
        question: 'Which Wireshark display filter isolates all unencrypted HTTP POST requests sent over the wire?',
        options: [
          'http.request.method == "POST"',
          'tcp.port == 80 && ip.post',
          'packet.type == "HTTP-POST"',
          'stream.http.payload contains "POST"',
        ],
        correctIndex: 0,
        explanation: 'Wireshark\'s display filter `http.request.method == "POST"` filters for HTTP traffic using the POST method.',
      },
      {
        question: 'Which protocol operates at the Transport Layer (Layer 4) of the OSI model and provides connectionless, low-latency transmission?',
        options: [
          'UDP (User Datagram Protocol)',
          'IP (Internet Protocol)',
          'ICMP (Internet Control Message Protocol)',
          'ARP (Address Resolution Protocol)',
        ],
        correctIndex: 0,
        explanation: 'UDP provides connectionless, lightweight data transmission at Layer 4 without the handshake and verification overhead of TCP.',
      },
    ],
  },

  // 6. Malware Analysis & Reverse Engineering
  {
    title: 'Malware Analysis & Reverse Engineering Certification',
    slug: 'malware-analysis-quiz',
    courseRef: 'malware-analysis',
    description: 'Examine reverse engineering principles, static disassembly in Ghidra, sandbox behavior tracking, and YARA signatures.',
    difficulty: 'hard',
    xpReward: 240,
    creditReward: 35,
    passingScore: 70,
    timeLimit: 720,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'What is the primary difference between static and dynamic malware analysis?',
        options: [
          'Static analysis inspects code without executing the binary; dynamic analysis executes the malware in an isolated sandbox to observe runtime behavior',
          'Static analysis only inspects network pcaps; dynamic analysis reads source code',
          'Static analysis requires a debugger; dynamic analysis only reads assembly',
          'Static analysis is safe on production hosts; dynamic analysis is purely theoretical',
        ],
        correctIndex: 0,
        explanation: 'Static analysis extracts hashes, strings, and disassembles instructions without running the code. Dynamic analysis observes actual behavior during execution.',
      },
      {
        question: 'In PE (Portable Executable) binaries, which table reveals external Windows API functions imported by the specimen?',
        options: [
          'Import Address Table (IAT)',
          'Export Directory Table (EDT)',
          'Relocation Section (.reloc)',
          'Certificate Table',
        ],
        correctIndex: 0,
        explanation: 'The IAT lists the Windows APIs imported by the binary (e.g. VirtualAlloc, WriteProcessMemory, InternetOpen), hinting at capabilities.',
      },
      {
        question: 'What purpose do YARA rules serve in security operations and incident analysis?',
        options: [
          'Classifying and identifying malware samples based on textual and binary pattern definitions',
          'Decoupling malware encryption keys using quantum gates',
          'Emulating CPU instructions on mobile Android devices',
          'Generating automated buffer overflow shellcode',
        ],
        correctIndex: 0,
        explanation: 'YARA helps researchers identify and classify malware families through rule-based pattern matching on strings, bytes, and regex.',
      },
      {
        question: 'What evasive technique does modern malware use when detecting analysis tools like Wireshark or debuggers?',
        options: [
          'Anti-Debugging and Sandbox Evasion (e.g., IsDebuggerPresent, timing checks, sleep throttling)',
          'Zero-Knowledge Proofs',
          'BGP Hijacking',
          'Cross-Site Scripting Injection',
        ],
        correctIndex: 0,
        explanation: 'Malware employs anti-analysis checks (detecting hypervisors, debug flags, or accelerating time) to remain dormant when observed.',
      },
      {
        question: 'What is the function of a decompiler in reverse engineering tools such as NSA Ghidra?',
        options: [
          'Translating machine bytecode and disassembly back into readable high-level C-like pseudocode',
          'Executing the binary inside an automated sandbox',
          'Generating cryptographic private keys from public certs',
          'Compressing executable binaries to bypass AV heuristic engines',
        ],
        correctIndex: 0,
        explanation: 'Decompilers reconstruct control flow and data types from binary assembly into high-level pseudocode for human comprehension.',
      },
    ],
  },

  // 7. Cryptography for Defenders
  {
    title: 'Applied Cryptography & Data Protection Certification',
    slug: 'cryptography-defenders-quiz',
    courseRef: 'cryptography-defenders',
    description: 'Test your understanding of symmetric ciphers, asymmetric public keys, hash functions, PKI, and key exchange.',
    difficulty: 'medium',
    xpReward: 160,
    creditReward: 22,
    passingScore: 70,
    timeLimit: 600,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'What characterizes symmetric encryption compared to asymmetric encryption?',
        options: [
          'Symmetric encryption uses the same shared secret key for both encryption and decryption',
          'Symmetric encryption uses a public key to encrypt and a private key to decrypt',
          'Symmetric encryption cannot be decrypted once applied',
          'Symmetric encryption is only capable of encrypting alphanumeric strings',
        ],
        correctIndex: 0,
        explanation: 'Symmetric algorithms (like AES-256) utilize one shared secret key for encrypting and decrypting data.',
      },
      {
        question: 'Which of the following is considered a modern, collision-resistant cryptographic hash function suitable for secure integrity checks?',
        options: [
          'SHA-256',
          'MD5',
          'SHA-1',
          'CRC32',
        ],
        correctIndex: 0,
        explanation: 'MD5 and SHA-1 have proven collision vulnerabilities. SHA-256 (and SHA-3) remains cryptographically secure.',
      },
      {
        question: 'Why must user passwords always be salted before being processed by adaptive hash functions like bcrypt or Argon2?',
        options: [
          'To ensure identical passwords generate distinct hashes, defeating precomputed rainbow table attacks',
          'To compress password strings so they take less database storage',
          'To allow administrators to recover plain passwords during support tickets',
          'To prevent SQL injection during query execution',
        ],
        correctIndex: 0,
        explanation: 'Salting appends unique random data to each password prior to hashing, rendering precomputed rainbow tables useless.',
      },
      {
        question: 'What is the role of a Certificate Authority (CA) in Public Key Infrastructure (PKI)?',
        options: [
          'To digitally sign and validate certificates binding public keys to verified domain identities',
          'To decrypt all corporate HTTPS traffic without alerting endpoints',
          'To generate random passwords for internal administrative users',
          'To act as a central firewall routing internet traffic',
        ],
        correctIndex: 0,
        explanation: 'A CA validates identity and signs certificates, allowing browsers to establish trust through recognized root certificates.',
      },
      {
        question: 'What critical problem does the Diffie-Hellman key exchange algorithm solve?',
        options: [
          'Enabling two parties to securely establish a shared secret over an untrusted public communication channel',
          'Compressing video streams in real-time over UDP',
          'Permanently encrypting hard drives against hardware theft',
          'Detecting brute-force password attacks on authentication endpoints',
        ],
        correctIndex: 0,
        explanation: 'Diffie-Hellman allows two parties to compute a shared encryption key over an insecure channel without transmitting the key itself.',
      },
    ],
  },

  // 8. Penetration Testing Methodology
  {
    title: 'Penetration Testing & Red Teaming Certification',
    slug: 'penetration-testing-methodology-quiz',
    courseRef: 'penetration-testing-methodology',
    description: 'Demonstrate methodology across scoping, Rules of Engagement, exploitation, pivoting, and professional reporting.',
    difficulty: 'hard',
    xpReward: 280,
    creditReward: 40,
    passingScore: 70,
    timeLimit: 720,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'What document establishes authorized targets, testing time windows, and restricted techniques before any pentest begins?',
        options: [
          'Rules of Engagement (RoE)',
          'Non-Disclosure Agreement (NDA) only',
          'Public Bug Bounty Policy',
          'Terms of Service (ToS)',
        ],
        correctIndex: 0,
        explanation: 'The Rules of Engagement (RoE) defines boundaries, authorized IP ranges, emergency contacts, and restrictions to keep tests legal and safe.',
      },
      {
        question: 'What sequence accurately represents the standard Penetration Testing Execution Standard (PTES) phases?',
        options: [
          'Pre-engagement -> Reconnaissance -> Threat Modeling -> Vulnerability Analysis -> Exploitation -> Post-Exploitation -> Reporting',
          'Exploitation -> Denial of Service -> Rootkit Deployment -> Extortion',
          'Scanning -> Deletion -> Restoration -> Invoicing',
          'Phishing -> Data Exfiltration -> Malware Selling -> Auditing',
        ],
        correctIndex: 0,
        explanation: 'PTES structures ethical penetration tests through systematic scoping, intelligence gathering, exploitation, and reporting.',
      },
      {
        question: 'What is "pivoting" in the context of network penetration testing?',
        options: [
          'Using a compromised host as a jump-point to route traffic and attack internal network segments not directly reachable from outside',
          'Switching the penetration tester\'s operating system from Windows to Linux mid-engagement',
          'Rotating through proxy IP addresses to bypass rate limiting',
          'Switching from offensive testing to code remediation without notifying the client',
        ],
        correctIndex: 0,
        explanation: 'Pivoting uses an initial compromised machine to route traffic into deeper, segmented internal networks.',
      },
      {
        question: 'In the Metasploit Framework, what is the key advantage of a Meterpreter payload over a standard command shell?',
        options: [
          'Meterpreter runs entirely in-memory, provides an encrypted channel, and offers rich post-exploitation modules like token manipulation and hash dumping',
          'Meterpreter automatically writes shellcode permanently to the master boot record',
          'Meterpreter does not require an exploit to be executed on the target',
          'Meterpreter disables physical network routers on the target local subnet',
        ],
        correctIndex: 0,
        explanation: 'Meterpreter is an advanced, in-memory stager that executes dynamically without creating new processes, bypassing many basic AV logs.',
      },
      {
        question: 'What section of a professional penetration test report is specifically written for executives, board members, and non-technical leadership?',
        options: [
          'Executive Summary (high-level risk posture, business impact, strategic remediation)',
          'Raw Wireshark Packet Dumps',
          'Terminal Screen Captures of Hex Dumps',
          'Appendix C: C++ Proof of Concept Exploit Code',
        ],
        correctIndex: 0,
        explanation: 'The Executive Summary translates technical findings into strategic business risk, financial impact, and prioritized organizational next steps.',
      },
    ],
  },

  // 9. Cloud Security Fundamentals
  {
    title: 'Cloud Security & IAM Architecture Certification',
    slug: 'cloud-security-fundamentals-quiz',
    courseRef: 'cloud-security-fundamentals',
    description: 'Assess cloud security posture across AWS/Azure, IAM policies, public storage risks, container isolation, and audit trails.',
    difficulty: 'medium',
    xpReward: 160,
    creditReward: 24,
    passingScore: 70,
    timeLimit: 600,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'Under the AWS Shared Responsibility Model, what aspect is the cloud customer directly responsible for in an IaaS (EC2) deployment?',
        options: [
          'Operating system patching, application configuration, firewall rules (security groups), and customer data',
          'Physical security of the AWS data centers',
          'Hardware replacement of faulty power supplies and servers',
          'Hypervisor maintenance and physical network virtualization cables',
        ],
        correctIndex: 0,
        explanation: 'AWS manages security OF the cloud (physical facilities, virtualization), while customers manage security IN the cloud (OS, configurations, data).',
      },
      {
        question: 'What dangerous misconfiguration in an AWS IAM Policy violates the principle of least privilege?',
        options: [
          'Granting `Action: "*"` and `Resource: "*"` without condition constraints',
          'Enforcing Multi-Factor Authentication (MFA) for administrative roles',
          'Restricting access to specific source IP CIDR ranges',
          'Attaching read-only managed policies to audit service roles',
        ],
        correctIndex: 0,
        explanation: 'Specifying wildcard `*` for actions and resources grants unrestricted superuser administrative authority across all cloud services.',
      },
      {
        question: 'Which cloud audit service records API activity and console logins across an entire AWS account for security monitoring and forensics?',
        options: [
          'AWS CloudTrail',
          'Amazon Route 53',
          'AWS Elastic Beanstalk',
          'Amazon ElastiCache',
        ],
        correctIndex: 0,
        explanation: 'AWS CloudTrail provides an event history of AWS account activity, including actions taken through the AWS Management Console, SDKs, and CLI.',
      },
      {
        question: 'What common misconfiguration has historically led to massive public data exposures in cloud object storage?',
        options: [
          'Misconfigured S3 bucket policies or ACLs granting `AllUsers` public read/write permissions',
          'Enabling Server-Side Encryption with KMS (SSE-KMS)',
          'Setting lifecycle rules to transition old objects to Glacier',
          'Enabling S3 Object Versioning and MFA Delete',
        ],
        correctIndex: 0,
        explanation: 'Public access granted through loose bucket policies or ACLs allows unauthenticated internet users to browse and download sensitive objects.',
      },
      {
        question: 'What security risk arises when running Docker containers with the `--privileged` flag in production?',
        options: [
          'The container gets full root capabilities on the host kernel, enabling simple container breakouts and host compromise',
          'The container becomes read-only and refuses to serve HTTP traffic',
          'The Docker image is automatically deleted from local storage',
          'Network throughput is capped at 10 Mbps by Linux cgroups',
        ],
        correctIndex: 0,
        explanation: '`--privileged` grants the container nearly all host root capabilities, removing isolation and allowing direct host takeover.',
      },
    ],
  },

  // 10. Threat Intelligence & Incident Response
  {
    title: 'Threat Intelligence & Incident Response Certification',
    slug: 'threat-intelligence-ir-quiz',
    courseRef: 'threat-intelligence-ir',
    description: 'Master incident handling through PICERL phases, SIEM triage, MITRE ATT&CK alignment, and forensic containment.',
    difficulty: 'hard',
    xpReward: 220,
    creditReward: 32,
    passingScore: 70,
    timeLimit: 720,
    active: true,
    attemptCount: 0,
    questions: [
      {
        question: 'In the NIST / SANS Incident Response lifecycle (PICERL), what step immediately follows "Identification"?',
        options: [
          'Containment',
          'Preparation',
          'Eradication',
          'Recovery',
        ],
        correctIndex: 0,
        explanation: 'The PICERL framework steps are: Preparation -> Identification -> Containment -> Eradication -> Recovery -> Lessons Learned.',
      },
      {
        question: 'What is the MITRE ATT&CK framework primarily used for in defensive security operations?',
        options: [
          'A globally-accessible knowledge base of adversary tactics, techniques, and procedures (TTPs) based on real-world observations',
          'An automated scanner that removes rootkits from active domain controllers',
          'A proprietary encryption standard replacing AES in defense contracts',
          'A database of end-of-life hardware components and warranty expirations',
        ],
        correctIndex: 0,
        explanation: 'MITRE ATT&CK maps real-world adversary behavior into matrixes of Tactics (goals) and Techniques (methods).',
      },
      {
        question: 'According to David Bianco’s "Pyramid of Pain", which Indicator of Compromise (IoC) is the most painful and costly for an adversary when defenders detect and block it?',
        options: [
          'TTPs (Tactics, Techniques, and Procedures)',
          'Hash Values (MD5/SHA256)',
          'IP Addresses',
          'Domain Names',
        ],
        correctIndex: 0,
        explanation: 'Blocking TTPs forces adversaries to relearn entire attack behaviors, whereas hashes and IPs can be changed trivially in seconds.',
      },
      {
        question: 'What is the primary role of a Security Information and Event Management (SIEM) system in a Security Operations Center (SOC)?',
        options: [
          'Aggregating log streams across heterogeneous systems, correlating events, and triggering alerts on anomalous or malicious patterns',
          'Serving as an authoritative DNS resolver for corporate networks',
          'Automatically rewriting flawed source code in GitHub pull requests',
          'Distributing monthly employee payroll slips with digital signatures',
        ],
        correctIndex: 0,
        explanation: 'A SIEM collects, normalizes, and correlates logs from endpoints, firewalls, and cloud services to detect intrusions.',
      },
      {
        question: 'Why should incident responders preserve live volatile memory (RAM) before shutting down or rebooting a compromised system?',
        options: [
          'Because RAM contains running processes, open network sockets, unencrypted keys, injected code, and credentials that are permanently lost upon power down',
          'Because powering down a machine automatically destroys the physical hard drive platter',
          'Because Linux kernels refuse to boot if shut down without root approval',
          'Because RAM data is permanently synchronized with the public domain controller',
        ],
        correctIndex: 0,
        explanation: 'Live memory captures running malware in-memory, decrypted secrets, network connections, and command histories that vanish when power is lost.',
      },
    ],
  },
]
