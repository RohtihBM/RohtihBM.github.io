/**
 * Single source of truth for every word on the site.
 * Everything here is taken from the resume — no invented metrics, users or features.
 */

export const person = {
  name: "Rohith B M",
  first: "Rohith",
  initials: "B M",
  role: "Associate Software Developer",
  company: "Flatworld AI",
  city: "Bengaluru",
  region: "Karnataka, IN",
  coords: "12.97°N 77.59°E",
  email: "rohithbmachar@gmail.com",
  links: {
    linkedin: "https://www.linkedin.com/in/rohith-b-m",
    leetcode: "https://leetcode.com/u/rohithjune11/",
  },
};

export const nav = [
  { id: "work", label: "Work", index: "01" },
  { id: "experience", label: "Experience", index: "02" },
  { id: "about", label: "About", index: "03" },
  { id: "contact", label: "Contact", index: "04" },
] as const;

export type Experience = {
  period: string;
  start: string;
  end: string;
  role: string;
  org: string;
  summary: string;
  groups: { label: string; context?: string; points: string[] }[];
};

export const experience: Experience[] = [
  {
    period: "Aug 2025 — Present",
    start: "2025.08",
    end: "Now",
    role: "Associate Software Developer",
    org: "Flatworld AI",
    summary:
      "Chat and voice widget of an AI customer-support platform, plus an internal HR application I ran on my own.",
    groups: [
      {
        label: "Telenok",
        context: "AI customer-support platform — chat, voice, email, CRM, knowledge base · 8 services · TypeScript / Python",
        points: [
          "Fixed a voice-widget UI state bug that left it stuck in “speaking”; transcript delay fell from 2.2–3.1 s to 0.2–1.8 s and related warnings from 13 to 0.",
          "Added a save-time check that rejects voice languages the speech model doesn’t support.",
          "Led Demo Links end to end (~25K lines): public demo pages where sales share time-limited demos with “Call me” voice calls.",
          "Shipped configurable widget UI options — launcher tooltip, high-contrast accessibility colours, booking picker.",
          "Built the public pages to a WCAG 2.2 AA target with 44 px touch targets, kept the widget inside its bundle-size budget, and secured access with rate limits, hashed link codes and tenant-isolated row-level security.",
          "Cut voice turns missing the knowledge-base search deadline from 46% to ~13% (projected from 14 days of UAT telemetry).",
          "Brought the AI ticket pipeline to 90.9% agreement with the legacy system, against a 90% release gate.",
        ],
      },
      {
        label: "Employee Disciplinary Action Platform",
        context: "Internal enterprise HR application · ASP.NET Core MVC, ABP, EF Core, Azure SQL",
        points: [
          "Ran the application independently for 1,600+ employees.",
          "Built role-based access control, approval workflows, PDF reports and record merging.",
          "Fixed database bottlenecks — N+1 queries and missing indexes.",
        ],
      },
    ],
  },
  {
    period: "Feb 2025 — Jul 2025",
    start: "2025.02",
    end: "2025.07",
    role: "Software Developer Intern",
    org: "Flatworld AI",
    summary: "Angular UI, API integration and database-driven features in a .NET web application.",
    groups: [
      {
        label: "Internship",
        points: [
          "Built Angular UI components for a .NET web application.",
          "Integrated APIs and database-driven features end to end.",
        ],
      },
    ],
  },
];

export const education = [
  { school: "S J B Institute of Technology", detail: "B.E. Information Science · CGPA 8.4", years: "2021 — 2025", place: "Bengaluru" },
  { school: "Vidya Jyothi PU College", detail: "Pre-University · 92.6%", years: "2019 — 2021", place: "Kolar" },
];

export const stack = [
  { label: "Languages", items: ["TypeScript", "JavaScript", "C++", "C#", "Java", "Python", "SQL"] },
  { label: "Interface", items: ["React", "Next.js", "Angular", "Tailwind CSS", "Radix UI", "Fabric.js"] },
  { label: "Server", items: ["Node.js", "Express", "ASP.NET Core", "ABP", "EF Core", "BullMQ", "WebSockets"] },
  { label: "Data", items: ["PostgreSQL", "pgvector", "Redis", "Azure SQL"] },
  { label: "AI / LLM", items: ["RAG", "Embeddings", "Vector search", "Prompt engineering"] },
  { label: "Ship", items: ["Docker", "AWS EC2", "Vercel", "GitHub Actions", "Azure", "Liveblocks"] },
];
