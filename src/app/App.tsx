import { useState, useRef } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import {
  Upload, FileText, Calendar, BookOpen, Settings, User,
  ChevronRight, Check, Clock, Download, Edit, ExternalLink,
  BarChart2, X, ArrowRight, Sparkles, MapPin, Mail,
  BookMarked, Menu, Bell, ChevronLeft, Zap, Shield,
  GraduationCap, AlertTriangle, Plus, Search,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type AppView = "landing" | "dashboard";
type DashboardTab = "upload" | "analyzing" | "summary" | "calendar" | "courses" | "settings";

// ─── Static data ─────────────────────────────────────────────────────────────

const GRADE_WEIGHTS = [
  { name: "Exams", value: 50, color: "#5b4cf5" },
  { name: "Assignments", value: 30, color: "#8b5cf6" },
  { name: "Participation", value: 10, color: "#a78bfa" },
  { name: "Final Project", value: 10, color: "#c4b5fd" },
];

const GRADE_CURVE = [
  { letter: "A", range: "90–100", bg: "#dcfce7", text: "#166534" },
  { letter: "B", range: "80–89", bg: "#dbeafe", text: "#1e40af" },
  { letter: "C", range: "70–79", bg: "#fef9c3", text: "#854d0e" },
  { letter: "D", range: "60–69", bg: "#ffedd5", text: "#9a3412" },
  { letter: "F", range: "Below 60", bg: "#fee2e2", text: "#991b1b" },
];

const EVENT_TYPES = {
  exam:       { label: "Exam",       dot: "#ef4444", bg: "#fee2e2", text: "#991b1b" },
  quiz:       { label: "Quiz",       dot: "#f97316", bg: "#ffedd5", text: "#9a3412" },
  assignment: { label: "Assignment", dot: "#3b82f6", bg: "#dbeafe", text: "#1e40af" },
  project:    { label: "Project",    dot: "#8b5cf6", bg: "#ede9fe", text: "#6d28d9" },
  reading:    { label: "Reading",    dot: "#0d9488", bg: "#ccfbf1", text: "#0f766e" },
} as const;

type EventType = keyof typeof EVENT_TYPES;

const JULY_EVENTS: Record<number, { title: string; type: EventType; time: string }[]> = {
  5:  [{ title: "Quiz 1 – Variables & Control Flow", type: "quiz", time: "11:00 AM" }],
  10: [{ title: "Assignment 2 Due – Loops & Arrays", type: "assignment", time: "11:59 PM" }],
  14: [{ title: "Midterm Exam", type: "exam", time: "2:00 PM" }],
  18: [{ title: "Project Proposal Due", type: "project", time: "11:59 PM" }],
  21: [{ title: "Reading – Chapters 8–10", type: "reading", time: "Before class" }],
  25: [{ title: "Quiz 2 – Functions & OOP", type: "quiz", time: "11:00 AM" }],
  28: [{ title: "Final Project Submitted", type: "project", time: "11:59 PM" }],
  31: [{ title: "Final Exam", type: "exam", time: "9:00 AM" }],
};

// July 1 2026 = Wednesday → offset 3 (Sun=0)
function buildCalendarGrid(): (number | null)[] {
  const cells: (number | null)[] = Array(3).fill(null);
  for (let d = 1; d <= 31; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
const CALENDAR_CELLS = buildCalendarGrid();

const UPCOMING_DEADLINES: { date: string; daysLeft: number; title: string; type: EventType }[] = [
  { date: "Jul 5",  daysLeft: 5,  title: "Quiz 1 – Variables & Control Flow", type: "quiz" },
  { date: "Jul 10", daysLeft: 10, title: "Assignment 2 Due – Loops & Arrays",  type: "assignment" },
  { date: "Jul 14", daysLeft: 14, title: "Midterm Exam",                        type: "exam" },
  { date: "Jul 18", daysLeft: 18, title: "Project Proposal Due",                type: "project" },
  { date: "Jul 21", daysLeft: 21, title: "Reading – Chapters 8–10",             type: "reading" },
  { date: "Jul 28", daysLeft: 28, title: "Final Project Submitted",              type: "project" },
  { date: "Jul 31", daysLeft: 31, title: "Final Exam",                           type: "exam" },
];

// ─── Serif heading helper ─────────────────────────────────────────────────────

const serif: React.CSSProperties = { fontFamily: "'Instrument Serif', Georgia, serif" };

// ─── Root component ───────────────────────────────────────────────────────────

export default function App() {
  const [view, setView]           = useState<AppView>("landing");
  const [tab, setTab]             = useState<DashboardTab>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = () => {
    setTab("analyzing");
    setTimeout(() => setTab("summary"), 3200);
  };

  const goToDashboard = (startTab: DashboardTab = "upload") => {
    setView("dashboard");
    setTab(startTab);
  };

  if (view === "landing") {
    return (
      <LandingPage
        onGetStarted={() => goToDashboard("upload")}
        onDemo={() => goToDashboard("summary")}
      />
    );
  }

  return (
    <div className="flex h-screen bg-[#f6f5fb] overflow-hidden">
      <Sidebar
        tab={tab}
        setTab={setTab}
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        onHome={() => setView("landing")}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar tab={tab} onToggleSidebar={() => setSidebarOpen(v => !v)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {tab === "upload" && (
            <UploadPage
              isDragging={isDragging}
              setIsDragging={setIsDragging}
              onDrop={e => { e.preventDefault(); setIsDragging(false); simulateUpload(); }}
              onUpload={simulateUpload}
              fileInputRef={fileInputRef}
            />
          )}
          {tab === "analyzing" && <AnalyzingPage />}
          {tab === "summary"   && <SummaryPage setTab={setTab} />}
          {tab === "calendar"  && <CalendarPage />}
          {tab === "courses"   && <CoursesPage onUpload={() => setTab("upload")} />}
          {tab === "settings"  && <SettingsPage />}
        </main>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────

function LandingPage({ onGetStarted, onDemo }: { onGetStarted: () => void; onDemo: () => void }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[#ede9fe]">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-8 text-sm text-[#7c6fcd]">
            {["Features", "How it works", "Pricing"].map(l => (
              <a key={l} href="#" className="hover:text-[#5b4cf5] transition-colors">{l}</a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button className="hidden md:block text-sm text-[#7c6fcd] hover:text-[#5b4cf5] transition-colors">
              Sign in
            </button>
            <button
              onClick={onGetStarted}
              className="bg-[#5b4cf5] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#4a3de0] transition-colors shadow-sm shadow-indigo-200"
            >
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-20 pb-20">
        <div className="grid lg:grid-cols-2 gap-14 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-[#ede9fe] text-[#6d28d9] text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
              <Sparkles size={12} /> AI-powered syllabus analysis
            </span>
            <h1 className="text-5xl lg:text-[3.5rem] leading-[1.1] font-bold text-[#1a1840] mb-6" style={serif}>
              Turn any syllabus into a clear student-friendly summary.
            </h1>
            <p className="text-lg text-[#7c6fcd] leading-relaxed mb-8">
              Upload your syllabus and instantly extract grading policies, attendance rules, office hours, required materials, and important deadlines.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <button
                onClick={onGetStarted}
                className="inline-flex items-center gap-2 bg-[#5b4cf5] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#4a3de0] transition-all shadow-lg shadow-indigo-200/60"
              >
                <Upload size={16} /> Upload Syllabus
              </button>
              <button
                onClick={onDemo}
                className="inline-flex items-center gap-2 border border-[#ede9fe] text-[#5b4cf5] px-6 py-3 rounded-xl font-semibold hover:bg-[#f6f5fb] transition-all"
              >
                View Demo <ArrowRight size={16} />
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-5 text-sm text-[#9ca3af]">
              {["Free to start", "No signup required", "Instant results"].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={14} className="text-emerald-500" /> {t}
                </span>
              ))}
            </div>
          </div>

          {/* Preview card */}
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-[#ede9fe] via-[#e0e7ff] to-[#dbeafe] rounded-3xl blur-2xl opacity-60" />
            <div className="relative bg-white rounded-2xl shadow-xl shadow-indigo-100 border border-[#ede9fe] p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-[#9ca3af] mb-0.5">Analyzed in 18 seconds</p>
                  <h3 className="font-bold text-[#1a1840] text-lg" style={serif}>Intro to Computer Science</h3>
                  <p className="text-sm text-[#7c6fcd]">Dr. Sarah Chen · Fall 2026</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#5b4cf5] flex items-center justify-center shrink-0">
                  <FileText size={18} className="text-white" />
                </div>
              </div>

              <div className="space-y-2.5">
                {[
                  { icon: "📋", label: "Attendance Policy",   preview: "3 unexcused absences allowed · 4th drops grade by one letter" },
                  { icon: "📊", label: "Grade Weights",        preview: "Exams 50% · Assignments 30% · Participation 10%" },
                  { icon: "🕐", label: "Office Hours",         preview: "Mon/Wed 2–4 PM · Room 214B · chen@cs.edu" },
                  { icon: "📅", label: "8 deadlines found",    preview: "Next: Quiz 1 — Jul 5 at 11:00 AM" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[#f6f5fb]">
                    <span className="text-base mt-px shrink-0">{item.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-[#1a1840]">{item.label}</p>
                      <p className="text-xs text-[#7c6fcd] mt-0.5 leading-relaxed">{item.preview}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1 flex items-center justify-between">
                <span className="text-xs text-[#9ca3af]">Confidence score</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-28 bg-[#ede9fe] rounded-full overflow-hidden">
                    <div className="h-full w-[94%] bg-[#5b4cf5] rounded-full" />
                  </div>
                  <span className="text-xs font-bold text-[#5b4cf5]">94%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature strip */}
      <section className="bg-[#f6f5fb] py-16 border-y border-[#ede9fe]">
        <div className="max-w-6xl mx-auto px-5">
          <p className="text-center text-xs font-bold text-[#9ca3af] uppercase tracking-widest mb-10">
            Everything you need from your syllabus, in one place
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: <Zap size={20} />, title: "Instant Analysis", desc: "Upload your syllabus and get a complete breakdown in under 30 seconds." },
              { icon: <Shield size={20} />, title: "Accurate Extraction", desc: "Our AI finds dates, policies, and grading info with 90%+ accuracy." },
              { icon: <Calendar size={20} />, title: "Smart Calendar", desc: "All deadlines automatically organized into a visual calendar you can export to Google Calendar." },
            ].map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#ede9fe] hover:shadow-md hover:shadow-indigo-100 transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-[#ede9fe] flex items-center justify-center text-[#5b4cf5] mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-[#1a1840] mb-2" style={serif}>{f.title}</h3>
                <p className="text-sm text-[#7c6fcd] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-[#f0effe]">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between text-sm text-[#9ca3af]">
          <Logo />
          <p>© 2026 SyllabusSnap · Built for students</p>
        </div>
      </footer>
    </div>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-[#5b4cf5] flex items-center justify-center shrink-0">
        <BookMarked size={15} className="text-white" />
      </div>
      <span className="font-bold text-[#1a1840] text-lg" style={serif}>SyllabusSnap</span>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS: { id: DashboardTab; icon: React.ReactNode; label: string }[] = [
  { id: "upload",   icon: <Upload size={18} />,    label: "Upload" },
  { id: "summary",  icon: <FileText size={18} />,  label: "Summary" },
  { id: "calendar", icon: <Calendar size={18} />,  label: "Calendar" },
  { id: "courses",  icon: <BookOpen size={18} />,  label: "Courses" },
  { id: "settings", icon: <Settings size={18} />,  label: "Settings" },
];

function Sidebar({
  tab, setTab, open, setOpen, onHome,
}: {
  tab: DashboardTab;
  setTab: (t: DashboardTab) => void;
  open: boolean;
  setOpen: (v: boolean) => void;
  onHome: () => void;
}) {
  return (
    <aside
      className={`${open ? "w-56" : "w-16"} bg-white border-r border-[#ede9fe] flex flex-col shrink-0 transition-all duration-200 ease-in-out`}
    >
      {/* Logo row */}
      <div className="h-16 flex items-center px-4 border-b border-[#f0effe] gap-3">
        <button
          onClick={open ? onHome : () => setOpen(true)}
          className="w-8 h-8 rounded-lg bg-[#5b4cf5] flex items-center justify-center shrink-0"
        >
          <BookMarked size={15} className="text-white" />
        </button>
        {open && (
          <button onClick={onHome} className="font-bold text-[#1a1840] text-[15px] leading-none" style={serif}>
            SyllabusSnap
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setTab(item.id)}
            title={!open ? item.label : undefined}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === item.id
                ? "bg-[#ede9fe] text-[#5b4cf5]"
                : "text-[#7c6fcd] hover:bg-[#f6f5fb] hover:text-[#5b4cf5]"
            }`}
          >
            <span className="shrink-0">{item.icon}</span>
            {open && <span>{item.label}</span>}
          </button>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[#f0effe]">
        <div className={`flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#f6f5fb] cursor-pointer ${!open && "justify-center"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5b4cf5] to-[#8b5cf6] flex items-center justify-center shrink-0">
            <span className="text-[11px] font-bold text-white">JD</span>
          </div>
          {open && (
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-[#1a1840] truncate">Jordan Davis</p>
              <p className="text-xs text-[#9ca3af] truncate">CS Major · Junior</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ tab, onToggleSidebar }: { tab: DashboardTab; onToggleSidebar: () => void }) {
  const showCourse = tab === "summary" || tab === "calendar";
  return (
    <header className="h-16 bg-white border-b border-[#f0effe] flex items-center px-5 gap-4 shrink-0">
      <button onClick={onToggleSidebar} className="text-[#7c6fcd] hover:text-[#5b4cf5] transition-colors">
        <Menu size={20} />
      </button>

      {showCourse ? (
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <p className="font-semibold text-[#1a1840] text-sm truncate">Intro to Computer Science</p>
            <p className="text-xs text-[#9ca3af]">Dr. Sarah Chen · Fall 2026 · CS 101</p>
          </div>
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
            <Check size={10} /> Analyzed
          </span>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-[#1a1840] text-sm">Dashboard</p>
          <p className="text-xs text-[#9ca3af]">Welcome back, Jordan</p>
        </div>
      )}

      <div className="ml-auto flex items-center gap-2">
        {showCourse && (
          <>
            <button className="hidden sm:inline-flex items-center gap-1.5 text-sm text-[#7c6fcd] border border-[#ede9fe] px-3 py-1.5 rounded-lg hover:bg-[#f6f5fb] transition-colors">
              <Edit size={13} /> Edit Info
            </button>
            <button className="inline-flex items-center gap-1.5 text-sm text-white bg-[#5b4cf5] px-3 py-1.5 rounded-lg hover:bg-[#4a3de0] transition-colors">
              <Download size={13} /> Download
            </button>
          </>
        )}
        <button className="relative w-9 h-9 flex items-center justify-center text-[#7c6fcd] hover:text-[#5b4cf5] hover:bg-[#f6f5fb] rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#5b4cf5] rounded-full" />
        </button>
      </div>
    </header>
  );
}

// ─── Upload Page ──────────────────────────────────────────────────────────────

function UploadPage({
  isDragging, setIsDragging, onDrop, onUpload, fileInputRef,
}: {
  isDragging: boolean;
  setIsDragging: (v: boolean) => void;
  onDrop: (e: React.DragEvent) => void;
  onUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1a1840]" style={serif}>Upload Your Syllabus</h2>
        <p className="text-[#7c6fcd] mt-1">We'll analyze it and generate a clean, organized summary in seconds.</p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-14 text-center cursor-pointer transition-all select-none ${
          isDragging
            ? "border-[#5b4cf5] bg-[#ede9fe] scale-[1.01]"
            : "border-[#d4d0fa] bg-white hover:border-[#5b4cf5] hover:bg-[#f6f5fb]"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".pdf,.docx,.txt"
          onChange={onUpload}
        />
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${isDragging ? "bg-[#5b4cf5]" : "bg-[#ede9fe]"}`}>
          <Upload size={28} className={isDragging ? "text-white" : "text-[#5b4cf5]"} />
        </div>
        <h3 className="font-bold text-[#1a1840] text-xl mb-2" style={serif}>
          {isDragging ? "Drop it here!" : "Drop your syllabus here"}
        </h3>
        <p className="text-[#9ca3af] text-sm mb-6">Upload PDF, DOCX, or TXT syllabus · Max 10 MB</p>
        <button
          onClick={e => { e.stopPropagation(); onUpload(); }}
          className="bg-[#5b4cf5] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#4a3de0] transition-colors shadow-md shadow-indigo-200"
        >
          Choose File
        </button>
      </div>

      {/* Format badges */}
      <div className="grid grid-cols-3 gap-4 mt-5">
        {[
          { label: "PDF", icon: "📄", desc: "Most common" },
          { label: "DOCX", icon: "📝", desc: "Word documents" },
          { label: "TXT",  icon: "📃", desc: "Plain text" },
        ].map(f => (
          <div key={f.label} className="bg-white rounded-xl p-4 border border-[#f0effe] text-center">
            <span className="text-2xl">{f.icon}</span>
            <p className="font-bold text-[#1a1840] text-sm mt-2">{f.label}</p>
            <p className="text-xs text-[#9ca3af] mt-0.5">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Error state example */}
      <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-red-700">Having trouble?</p>
          <p className="text-xs text-red-500 mt-0.5">
            If your file is scanned or image-based, try copy-pasting the syllabus text directly. We support plain text uploads too.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Analyzing Page ───────────────────────────────────────────────────────────

function AnalyzingPage() {
  const steps = [
    { label: "Reading document structure",    done: true },
    { label: "Extracting course information", done: true },
    { label: "Identifying grading policies",  done: false },
    { label: "Finding important dates",       done: false },
    { label: "Generating summary",            done: false },
  ];
  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[65vh]">
      <div className="bg-white rounded-2xl border border-[#ede9fe] p-8 w-full shadow-sm shadow-indigo-100">
        {/* Spinner */}
        <div className="flex items-center justify-center mb-6">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-[3px] border-[#ede9fe]" />
            <div className="absolute inset-0 rounded-full border-[3px] border-[#5b4cf5] border-t-transparent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-[#f6f5fb] flex items-center justify-center">
              <Sparkles size={18} className="text-[#5b4cf5]" />
            </div>
          </div>
        </div>

        <h3 className="text-center font-bold text-[#1a1840] text-xl mb-1" style={serif}>Analyzing syllabus…</h3>
        <p className="text-center text-sm text-[#9ca3af] mb-7">This usually takes 15–30 seconds</p>

        <div className="space-y-3 mb-6">
          {steps.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-colors ${step.done ? "bg-emerald-100" : "bg-[#f0effe]"}`}>
                {step.done
                  ? <Check size={11} className="text-emerald-600" />
                  : <div className="w-2 h-2 rounded-full bg-[#c4b5fd]" />}
              </div>
              <span className={`text-sm ${step.done ? "text-[#1a1840] font-semibold" : "text-[#9ca3af]"}`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="h-2 bg-[#f0effe] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#5b4cf5] to-[#8b5cf6] rounded-full" style={{ width: "40%" }} />
        </div>
        <p className="text-xs text-center text-[#9ca3af] mt-2">40% complete</p>
      </div>
    </div>
  );
}

// ─── Summary Page ─────────────────────────────────────────────────────────────

function SummaryPage({ setTab }: { setTab: (t: DashboardTab) => void }) {
  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Tab switcher */}
      <div className="flex gap-1.5 bg-white rounded-xl p-1 border border-[#ede9fe] w-fit">
        {(["Summary", "Calendar"] as const).map((label, i) => (
          <button
            key={label}
            onClick={() => i === 1 && setTab("calendar")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              i === 0 ? "bg-[#5b4cf5] text-white shadow-sm" : "text-[#7c6fcd] hover:text-[#5b4cf5]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 2-col grid */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Attendance Policy */}
        <Card icon="📋" iconBg="#fef9c3" title="Attendance Policy">
          <ul className="space-y-2.5">
            {[
              { text: "3 unexcused absences allowed per semester", warn: false },
              { text: "4th absence drops final grade by one letter grade", warn: true },
              { text: "Tardiness (10+ min) counts as half an absence", warn: false },
              { text: "Participation accounts for 10% of final grade", warn: false },
              { text: "No make-ups for missed in-class quizzes without documentation", warn: true },
            ].map((item, i) => (
              <li key={i} className={`flex items-start gap-2 text-sm ${item.warn ? "text-red-600 font-medium" : "text-[#374151]"}`}>
                <span className="mt-px shrink-0">{item.warn ? "⚠️" : "·"}</span>
                {item.text}
              </li>
            ))}
          </ul>
        </Card>

        {/* Grade Weights */}
        <Card icon={<BarChart2 size={18} className="text-[#5b4cf5]" />} iconBg="#ede9fe" title="Grade Weights">
          <div className="flex items-center gap-4">
            <div className="w-32 h-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={GRADE_WEIGHTS} cx="50%" cy="50%" innerRadius={30} outerRadius={58} dataKey="value" strokeWidth={0}>
                    {GRADE_WEIGHTS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 space-y-2.5">
              {GRADE_WEIGHTS.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                      <span className="text-xs text-[#374151]">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-[#1a1840]">{item.value}%</span>
                  </div>
                  <div className="h-1.5 bg-[#f0effe] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${item.value}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Required Materials */}
        <Card icon="📚" iconBg="#dbeafe" title="Required Materials">
          <div className="space-y-4">
            {[
              { category: "Textbooks", items: ["Introduction to Algorithms (CLRS), 4th Ed.", "Python Crash Course, 3rd Edition"] },
              { category: "Software",  items: ["Python 3.11+", "VS Code (free)", "Git & GitHub"] },
              { category: "Platforms", items: ["Gradescope (homework submission)", "Ed Discussion (class Q&A)"] },
              { category: "Optional",  items: ["Automate the Boring Stuff with Python"] },
            ].map((section, i) => (
              <div key={i}>
                <p className="text-[10px] font-bold text-[#7c6fcd] uppercase tracking-widest mb-1.5">{section.category}</p>
                <ul className="space-y-1">
                  {section.items.map((item, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm text-[#374151]">
                      <Check size={12} className="text-emerald-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Grade Curve */}
        <Card icon={<GraduationCap size={18} className="text-emerald-600" />} iconBg="#dcfce7" title="Grade Scale">
          <div className="space-y-2">
            {GRADE_CURVE.map((row, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ background: row.bg }}>
                <span className="w-7 text-center font-bold text-2xl shrink-0" style={{ color: row.text, ...serif }}>
                  {row.letter}
                </span>
                <span className="text-sm font-semibold" style={{ color: row.text }}>{row.range}</span>
                <div className="ml-auto flex-1 max-w-20 h-1.5 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ background: row.text, width: i === 4 ? "25%" : `${(5 - i) * 20}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Office Hours — full width */}
      <div className="bg-white rounded-2xl border border-[#ede9fe] p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <User size={18} className="text-violet-600" />
          </div>
          <h3 className="font-bold text-[#1a1840] text-lg" style={serif}>Professor &amp; Office Hours</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#5b4cf5] to-[#8b5cf6] flex items-center justify-center text-white font-bold text-lg shrink-0" style={serif}>
                SC
              </div>
              <div>
                <p className="font-bold text-[#1a1840]">Dr. Sarah Chen</p>
                <p className="text-sm text-[#7c6fcd]">Professor of Computer Science</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-[#374151]">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-[#7c6fcd] shrink-0" />
                chen@cs.university.edu
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#7c6fcd] shrink-0" />
                Computer Science Building, Room 214B
              </div>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold text-[#7c6fcd] uppercase tracking-widest mb-3">Weekly Schedule</p>
            <div className="space-y-2">
              {[
                { day: "Monday",    time: "2:00 PM – 4:00 PM" },
                { day: "Wednesday", time: "2:00 PM – 4:00 PM" },
                { day: "Friday",    time: "By appointment" },
              ].map((oh, i) => (
                <div key={i} className="flex items-center justify-between text-sm p-2.5 rounded-xl bg-[#f6f5fb]">
                  <span className="font-semibold text-[#1a1840]">{oh.day}</span>
                  <span className="text-[#7c6fcd]">{oh.time}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full inline-flex items-center justify-center gap-2 text-sm text-[#5b4cf5] border border-[#ede9fe] py-2.5 rounded-xl hover:bg-[#f6f5fb] transition-colors font-semibold">
              <Calendar size={14} /> Add Office Hours to Calendar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Calendar Page ────────────────────────────────────────────────────────────

function CalendarPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex gap-5 max-w-6xl mx-auto flex-col lg:flex-row">
      {/* Left: calendar */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-[#1a1840]" style={serif}>July 2026</h2>
            <p className="text-sm text-[#7c6fcd]">Intro to Computer Science · CS 101</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#ede9fe] text-[#7c6fcd] hover:bg-[#f6f5fb] transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#ede9fe] text-[#7c6fcd] hover:bg-[#f6f5fb] transition-colors">
              <ChevronRight size={16} />
            </button>
            <button className="inline-flex items-center gap-1.5 text-sm text-[#5b4cf5] border border-[#ede9fe] px-3 py-1.5 rounded-lg hover:bg-[#f6f5fb] transition-colors font-semibold">
              <ExternalLink size={13} /> Export to Google Calendar
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="bg-white rounded-2xl border border-[#ede9fe] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#f0effe]">
            {DAY_HEADERS.map(d => (
              <div key={d} className="py-3 text-center text-[10px] font-bold text-[#9ca3af] uppercase tracking-widest">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {CALENDAR_CELLS.map((day, i) => {
              const events = day ? JULY_EVENTS[day] || [] : [];
              const isSelected = day === selectedDay;
              const isLast = i === CALENDAR_CELLS.length - 1;
              return (
                <div
                  key={i}
                  onClick={() => day && setSelectedDay(day === selectedDay ? null : day)}
                  className={`min-h-[72px] p-2 border-b border-r border-[#f6f5fb] ${isLast ? "border-r-0" : ""} ${
                    day ? "cursor-pointer hover:bg-[#f6f5fb]" : "bg-[#fafafa]"
                  } ${isSelected ? "bg-[#f0effe]" : ""} transition-colors`}
                >
                  {day && (
                    <>
                      <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                        isSelected ? "bg-[#5b4cf5] text-white" : "text-[#374151]"
                      }`}>
                        {day}
                      </span>
                      <div className="space-y-0.5">
                        {events.map((ev, j) => {
                          const cfg = EVENT_TYPES[ev.type];
                          return (
                            <div
                              key={j}
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded truncate"
                              style={{ background: cfg.bg, color: cfg.text }}
                            >
                              {ev.title.split("–")[0].trim()}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {(Object.entries(EVENT_TYPES) as [EventType, typeof EVENT_TYPES[EventType]][]).map(([key, cfg]) => (
            <span key={key} className="flex items-center gap-1.5 text-xs text-[#7c6fcd]">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: cfg.dot }} />
              {cfg.label}
            </span>
          ))}
        </div>
      </div>

      {/* Right: Upcoming Deadlines */}
      <div className="w-full lg:w-72 shrink-0">
        <div className="bg-white rounded-2xl border border-[#ede9fe] overflow-hidden">
          <div className="px-4 py-4 border-b border-[#f0effe]">
            <h3 className="font-bold text-[#1a1840]" style={serif}>Upcoming Deadlines</h3>
            <p className="text-xs text-[#9ca3af] mt-0.5">Intro to Computer Science</p>
          </div>
          <div className="p-3 space-y-2.5 max-h-[520px] overflow-y-auto">
            {UPCOMING_DEADLINES.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-[#f6f5fb] flex items-center justify-center mx-auto mb-3">
                  <Calendar size={18} className="text-[#c4b5fd]" />
                </div>
                <p className="text-sm font-semibold text-[#1a1840]">No deadlines found</p>
                <p className="text-xs text-[#9ca3af] mt-1">Upload a syllabus to extract dates automatically.</p>
              </div>
            ) : (
              UPCOMING_DEADLINES.map((d, i) => {
                const cfg = EVENT_TYPES[d.type];
                return (
                  <div key={i} className="p-3 rounded-xl border border-[#f0effe] hover:border-[#ede9fe] hover:shadow-sm transition-all cursor-pointer">
                    <p className="text-sm font-semibold text-[#1a1840] leading-snug mb-2">{d.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: cfg.bg, color: cfg.text }}>
                        {cfg.label}
                      </span>
                      <span className="text-[10px] text-[#9ca3af] font-medium">{d.date}</span>
                      <span className="text-[10px] text-[#9ca3af]">· CS 101</span>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-[#7c6fcd]">
                      <Clock size={11} />
                      Due in {d.daysLeft} day{d.daysLeft === 1 ? "" : "s"}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Courses Page ─────────────────────────────────────────────────────────────

function CoursesPage({ onUpload }: { onUpload: () => void }) {
  const courses = [
    { code: "CS 101",   name: "Intro to Computer Science", prof: "Dr. Sarah Chen",       analyzed: true,  color: "#5b4cf5" },
    { code: "MATH 201", name: "Calculus II",                prof: "Prof. James Rodriguez", analyzed: false, color: "#8b5cf6" },
    { code: "ENG 110",  name: "Academic Writing",           prof: "Dr. Priya Nair",        analyzed: false, color: "#0d9488" },
  ];
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1a1840]" style={serif}>My Courses</h2>
          <p className="text-[#7c6fcd] text-sm mt-0.5">Fall 2026 semester</p>
        </div>
        <button onClick={onUpload} className="inline-flex items-center gap-2 bg-[#5b4cf5] text-white text-sm px-4 py-2.5 rounded-xl hover:bg-[#4a3de0] transition-colors font-semibold shadow-sm shadow-indigo-200">
          <Plus size={14} /> Add Course
        </button>
      </div>

      <div className="space-y-3">
        {courses.map((course, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#ede9fe] p-5 flex items-center gap-4 hover:shadow-sm hover:shadow-indigo-100 transition-shadow">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xs shrink-0" style={{ background: course.color }}>
              {course.code.split(" ")[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-[#1a1840] truncate">{course.name}</p>
              <p className="text-sm text-[#7c6fcd]">{course.code} · {course.prof}</p>
            </div>
            {course.analyzed ? (
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full shrink-0">
                <Check size={10} /> Analyzed
              </span>
            ) : (
              <button onClick={onUpload} className="inline-flex items-center gap-1.5 text-sm text-[#5b4cf5] border border-[#ede9fe] px-3 py-1.5 rounded-lg hover:bg-[#f6f5fb] transition-colors font-semibold shrink-0">
                <Upload size={13} /> Upload
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Settings Page ────────────────────────────────────────────────────────────

function SettingsPage() {
  const sections = [
    { title: "Notification Preferences", desc: "Get reminders 24 hrs before deadlines", icon: <Bell size={16} className="text-[#5b4cf5]" /> },
    { title: "Calendar Integration",     desc: "Connect Google Calendar or Apple Calendar", icon: <Calendar size={16} className="text-[#5b4cf5]" /> },
    { title: "Export Settings",          desc: "Customize how summaries are downloaded", icon: <Download size={16} className="text-[#5b4cf5]" /> },
    { title: "Account",                  desc: "jordan.davis@university.edu", icon: <User size={16} className="text-[#5b4cf5]" /> },
  ];
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-[#1a1840] mb-6" style={serif}>Settings</h2>
      <div className="space-y-3">
        {sections.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[#ede9fe] p-5 flex items-center gap-4 hover:shadow-sm hover:shadow-indigo-100 transition-shadow cursor-pointer">
            <div className="w-9 h-9 rounded-xl bg-[#f0effe] flex items-center justify-center shrink-0">
              {s.icon}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[#1a1840]">{s.title}</p>
              <p className="text-sm text-[#7c6fcd]">{s.desc}</p>
            </div>
            <ChevronRight size={18} className="text-[#c4b5fd] shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Card wrapper ─────────────────────────────────────────────────────────────

function Card({
  icon, iconBg, title, children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#ede9fe] p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base" style={{ background: iconBg }}>
          {icon}
        </div>
        <h3 className="font-bold text-[#1a1840] text-lg" style={serif}>{title}</h3>
      </div>
      {children}
    </div>
  );
}
