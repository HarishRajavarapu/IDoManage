import React, { useState, useRef } from "react";
import { 
  Sparkles, 
  CheckCircle, 
  BookOpen, 
  Calendar, 
  HelpCircle, 
  ArrowRight, 
  Clock, 
  Award, 
  Upload, 
  Folder, 
  ExternalLink, 
  FileText, 
  Check, 
  Download, 
  ChevronRight,
  Database,
  Trash2
} from "lucide-react";
import { StudyPlan } from "../types";
import { motion, AnimatePresence } from "motion/react";
import ConfirmationDialog from "./ConfirmationDialog";

interface StudyPlannerProps {
  studyPlans: StudyPlan[];
  onCreateStudyPlan: (subject: string, syllabus: string, targetDate: string, weeklyHours: number) => Promise<void>;
  onUpdateStudyPlan: (id: string, updates: Partial<StudyPlan>) => void;
  onDeleteStudyPlan?: (id: string) => void;
}

// Pre-configured academic documents for the Google Drive simulation
const MOCK_DRIVE_FILES = [
  {
    id: "g1",
    name: "CS_425_Artificial_Intelligence_Syllabus.txt",
    subject: "Artificial Intelligence & Heuristics",
    size: "14.2 KB",
    date: "June 12, 2026",
    content: "Syllabus outline for CS 425:\nWeek 1: Foundations of state-space search, BFS, DFS, and A* heuristics.\nWeek 2: Adversarial games, Minimax algorithm, Alpha-Beta pruning, and chess evaluation systems.\nWeek 3: Knowledge representation, propositional and first-order logic, resolution mechanisms.\nWeek 4: Probabilistic reasoning, Bayesian networks, belief updating, and hidden Markov models.\nWeek 5: Reinforcement learning, Markov decision processes, Q-learning, and policy iteration.\nWeek 6: Neural networks, deep learning architectures, feedforward networks, and backpropagation optimization."
  },
  {
    id: "g2",
    name: "BIO_309_Human_Neuroanatomy_Course_Outline.txt",
    subject: "Human Neuroanatomy",
    size: "18.5 KB",
    date: "May 29, 2026",
    content: "Course curriculum for BIO 309:\nModule 1: Cellular structures of the central nervous system, neurons, glial cells, and myelin sheath propagation.\nModule 2: Cerebrum gross anatomy, anatomical planes, cortical lobes (frontal, parietal, occipital, temporal), and functional centers.\nModule 3: Subcortical structures, basal ganglia circuitry, thalamic relay nodes, and the limbic system (amygdala, hippocampus).\nModule 4: Brainstem, cranial nerves (I through XII), sensory and motor tract pathways.\nModule 5: Cerebellar systems, motor planning, vestibular reflexes, and feedback loops.\nModule 6: Meninges, cerebrospinal fluid circulation, ventricles, and clinical vascular blockages."
  },
  {
    id: "g3",
    name: "MATH_280_Linear_Algebra_Review.txt",
    subject: "Advanced Linear Algebra",
    size: "9.8 KB",
    date: "June 20, 2026",
    content: "Semester overview for MATH 280:\nTopic 1: Vector spaces, linear combinations, spanning sets, and linear independence principles.\nTopic 2: Linear transformations, matrix representations, kernel/nullspace, and image/range coordinates.\nTopic 3: Systems of linear equations, Gaussian elimination, row echelon forms, and matrix rank calculations.\nTopic 4: Determinants, Cramer's rule, area/volume scaling factors, and algebraic properties.\nTopic 5: Eigenvalues, eigenvectors, characteristic equations, and matrix diagonalization procedures.\nTopic 6: Inner product spaces, orthogonality, Gram-Schmidt process, and least-squares approximations."
  }
];

export default function StudyPlanner({
  studyPlans,
  onCreateStudyPlan,
  onUpdateStudyPlan,
  onDeleteStudyPlan
}: StudyPlannerProps) {
  const [subject, setSubject] = useState("");
  const [syllabus, setSyllabus] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [weeklyHours, setWeeklyHours] = useState(10);

  // Deletion confirmation state
  const [planToDelete, setPlanToDelete] = useState<string | null>(null);

  // UI State Managers
  const [activeTab, setActiveTab] = useState<"paste" | "upload" | "gdrive">("paste");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Local File Upload states
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Drive simulation states
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [isDriveAuthorizing, setIsDriveAuthorizing] = useState(false);
  const [isDriveAuthorized, setIsDriveAuthorized] = useState(false);
  const [driveSyncingFileId, setDriveSyncingFileId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !syllabus.trim()) return;

    setIsLoading(true);
    setError(null);
    try {
      await onCreateStudyPlan(subject, syllabus, targetDate, weeklyHours);
      // Reset form on success
      setSubject("");
      setSyllabus("");
      setUploadedFileName(null);
    } catch (err: any) {
      setError(err.message || "Failed to create AI Study Plan. Make sure GEMINI_API_KEY is defined.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleDailyTask = (planId: string, idx: number) => {
    const plan = studyPlans.find((p) => p.id === planId);
    if (!plan) return;

    const updatedPlan = [...plan.dailyPlan];
    updatedPlan[idx] = { ...updatedPlan[idx], completed: !updatedPlan[idx].completed };

    // Recalculate exam readiness slightly on task completions
    const completedCount = updatedPlan.filter((t) => t.completed).length;
    const progressPercent = Math.round((completedCount / updatedPlan.length) * 15);
    const originalScore = plan.examReadinessScore || 20;
    const newScore = Math.min(100, originalScore + progressPercent);

    onUpdateStudyPlan(planId, {
      dailyPlan: updatedPlan,
      examReadinessScore: newScore
    });
  };

  // --- LOCAL DRAG AND DROP HANDLERS ---
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const parseFileContent = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        setSyllabus(text);
        
        // Auto-extract a clean Subject Name from file name
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "") // strip extension
          .replace(/[_-]/g, " ") // replace underscores/hyphens with spaces
          .replace(/\b\w/g, (char) => char.toUpperCase()); // title case
        setSubject(cleanName);
        setUploadedFileName(file.name);
        
        // Bounce tab back to "paste" so they can inspect/edit before submitting
        setActiveTab("paste");
      }
    };
    reader.onerror = () => {
      setError("Unable to read local file. Please try pasting instead.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseFileContent(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      parseFileContent(e.target.files[0]);
    }
  };

  // --- GOOGLE DRIVE SIMULATION HANDLERS ---
  const triggerGoogleDriveAuth = () => {
    setIsDriveAuthorizing(true);
    setTimeout(() => {
      setIsDriveAuthorizing(false);
      setIsDriveAuthorized(true);
    }, 1500); // realistic OIDC connection handshake delay
  };

  const handleSelectDriveFile = (file: typeof MOCK_DRIVE_FILES[0]) => {
    setDriveSyncingFileId(file.id);
    setTimeout(() => {
      // Simulate download & background text extraction
      setSubject(file.subject);
      setSyllabus(file.content);
      setUploadedFileName(`GoogleDrive:// ${file.name}`);
      setDriveSyncingFileId(null);
      setShowDriveModal(false);
      setActiveTab("paste"); // focus on paste to let them inspect
    }, 1200);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Top Creation Form Box with binder rings sketch */}
      <motion.div 
        variants={itemVariants}
        className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-black text-slate-800">Syllabus Compiler & Planner</h3>
          </div>
          
          {/* Custom Tabs selection (Doodle style) */}
          <div className="bg-slate-50 border-2 border-slate-800 p-1 rounded-2xl flex gap-1 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("paste")}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition-colors cursor-pointer ${
                activeTab === "paste" ? "bg-indigo-500 text-white border-2 border-slate-800" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ✍️ Custom Paste
            </button>
            <button
              onClick={() => setActiveTab("upload")}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition-colors cursor-pointer ${
                activeTab === "upload" ? "bg-indigo-500 text-white border-2 border-slate-800" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              📁 Drag File
            </button>
            <button
              onClick={() => {
                setActiveTab("gdrive");
                setShowDriveModal(true);
              }}
              className={`px-3 py-1.5 text-xs font-black rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
                activeTab === "gdrive" ? "bg-indigo-500 text-white border-2 border-slate-800" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              ▲ Drive Sync
            </button>
          </div>
        </div>

        <p className="text-slate-500 text-xs mb-5 max-w-2xl font-semibold leading-relaxed">
          Upload syllabi, text logs, or study checklists. The Chief of Staff AI analyzes the structural outlines to assemble target objectives, revision benchmarks, and daily deep work sessions.
        </p>

        {/* --- MAIN TABS SWITCHER --- */}
        {activeTab === "paste" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {uploadedFileName && (
              <div className="p-3 bg-indigo-50 border-2 border-indigo-300 rounded-2xl text-xs text-indigo-800 flex items-center justify-between font-bold">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-indigo-600" />
                  <span>Syllabus text loaded from <strong>{uploadedFileName}</strong></span>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setUploadedFileName(null);
                    setSubject("");
                    setSyllabus("");
                  }}
                  className="text-slate-500 hover:text-slate-800 cursor-pointer text-[10px] font-black underline"
                >
                  Clear File
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Subject / Goal Outline</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., 'Advanced Machine Learning'"
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none transition-colors"
                  required
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Exam / Target Date</label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none transition-colors"
                />
              </div>
              <div className="md:col-span-4">
                <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Weekly Time Budget (Hours)</label>
                <input
                  type="number"
                  value={weeklyHours}
                  onChange={(e) => setWeeklyHours(Number(e.target.value))}
                  min="1"
                  max="60"
                  className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">Paste Syllabus, Guidelines, or Course Slides Outline</label>
              <textarea
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                placeholder="Paste chapter requirements or lecture syllabi here..."
                rows={4}
                className="w-full bg-slate-50 border-2 border-slate-300 focus:border-slate-800 rounded-2xl px-4 py-2.5 text-xs text-slate-800 font-bold focus:outline-none transition-colors font-mono resize-none"
                required
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isLoading || !subject.trim() || !syllabus.trim()}
                className="px-6 py-2.5 bg-[#FEF3C7] hover:bg-[#FDE68A] text-slate-800 border-3 border-slate-800 font-black rounded-2xl text-xs transition-colors disabled:opacity-45 flex items-center justify-center gap-1.5 cursor-pointer shadow-[3px_3px_0px_0px_#1e293b]"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin text-indigo-600" />
                    Assembling...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                    Compile AI Study Plan
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* --- LOCAL FILE DRAG AND DROP ZONE --- */}
        {activeTab === "upload" && (
          <div 
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-4 border-dashed rounded-3xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
              dragActive 
                ? "border-indigo-500 bg-indigo-50 scale-[1.01]" 
                : "border-slate-300 bg-slate-50 hover:border-slate-800 hover:bg-slate-100"
            }`}
          >
            <input 
              ref={fileInputRef}
              type="file" 
              onChange={handleFileChange}
              accept=".txt,.md,.json,.csv,.docx,.pdf"
              className="hidden" 
            />
            <div className="p-3 bg-white border-2 border-slate-800 rounded-2xl text-indigo-600 shadow-[1.5px_1.5px_0px_0px_#1e293b]">
              <Upload className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <p className="text-slate-800 text-xs font-black">Drag and drop your syllabus file here</p>
              <p className="text-slate-400 text-[10px] mt-0.5 font-bold">Supports TXT, MD, DOCX, PDF, and CSV</p>
            </div>
            <div className="px-3 py-1.5 bg-white border-2 border-slate-800 text-[10px] font-black text-indigo-600 rounded-xl shadow-[1.5px_1.5px_0px_0px_#1e293b]">
              Browse Local Files
            </div>
          </div>
        )}

        {/* --- GOOGLE DRIVE BUTTON HOOK --- */}
        {activeTab === "gdrive" && (
          <div className="p-8 text-center bg-slate-50 border-4 border-slate-300 rounded-3xl flex flex-col items-center justify-center gap-3">
            <div className="p-3 bg-white border-2 border-slate-800 rounded-2xl text-emerald-600 shadow-[1.5px_1.5px_0px_0px_#1e293b]">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-slate-800 text-xs font-black">Sync Lecture Syllabi from Google Drive</p>
              <p className="text-slate-400 text-[10px] mt-0.5 font-bold">Directly scan academic files from your Google Drive account</p>
            </div>
            <button
              onClick={() => setShowDriveModal(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-black rounded-2xl text-xs border-3 border-slate-800 shadow-[2.5px_2.5px_0px_0px_#1e293b] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Folder className="w-3.5 h-3.5" />
              Open Drive Picker
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3.5 bg-rose-50 border-2 border-rose-400 text-rose-800 text-xs rounded-2xl flex items-center gap-2 font-bold">
            <HelpCircle className="w-4.5 h-4.5 text-rose-600" />
            <span>{error}</span>
          </div>
        )}
      </motion.div>

      {/* --- GOOGLE DRIVE SIMULATION MODAL PANEL --- */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200 p-4">
          <div className="bg-white border-4 border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-[5px_5px_0px_0px_#1e293b] flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-50 p-4 border-b-4 border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-emerald-100 rounded flex items-center justify-center border border-slate-300">
                  <Database className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Drive Account Access</h4>
                  <p className="text-[10px] text-slate-400 font-bold">Secure deconstruction file reader</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowDriveModal(false);
                  setActiveTab("paste");
                }}
                className="text-slate-400 hover:text-slate-800 text-xs font-black cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            {/* Modal Content */}
            {!isDriveAuthorized ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-4 py-12">
                <div className="relative">
                  <div className="p-4 bg-slate-50 border-2 border-slate-800 rounded-3xl text-emerald-600 shadow-[2px_2px_0px_0px_#1e293b]">
                    <Database className="w-8 h-8" />
                  </div>
                  {isDriveAuthorizing && (
                    <div className="absolute inset-0 border-4 border-t-emerald-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                  )}
                </div>
                
                <div className="space-y-1">
                  <h5 className="text-slate-800 font-black text-sm">OAuth Credentials Required</h5>
                  <p className="text-slate-500 text-xs max-w-sm mx-auto leading-relaxed font-semibold">
                    Authorize IDoManage to access and securely import selected syllabi from your Google Drive storage.
                  </p>
                </div>

                <button
                  onClick={triggerGoogleDriveAuth}
                  disabled={isDriveAuthorizing}
                  className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 border-3 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] text-white font-black text-xs rounded-2xl transition-colors disabled:opacity-50 cursor-pointer mt-2"
                >
                  {isDriveAuthorizing ? "Connecting OAuth Client..." : "Link Google Drive Account"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col flex-1 overflow-hidden">
                {/* Account details */}
                <div className="bg-slate-50 px-6 py-3 border-b-2 border-slate-800 flex items-center justify-between text-[10px] text-slate-500 font-bold">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-800 flex items-center justify-center text-white text-[9px] font-black">
                      ST
                    </div>
                    <span>Linked: <strong className="text-slate-800">student.account@university.edu</strong></span>
                  </div>
                  <span className="text-emerald-600 flex items-center gap-0.5 font-black">
                    <Check className="w-3.5 h-3.5" /> OIDC HANDSHAKE ACTIVE
                  </span>
                </div>

                {/* File list browser */}
                <div className="p-6 overflow-y-auto flex-1 space-y-3">
                  <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest">DRIVE COURSE OUTLINES & DOCUMENTS</h5>
                  
                  <div className="space-y-2">
                    {MOCK_DRIVE_FILES.map((file) => {
                      const isSyncing = driveSyncingFileId === file.id;
                      return (
                        <div 
                          key={file.id}
                          className="p-3 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-between hover:border-slate-800 hover:bg-slate-100 transition-all cursor-pointer"
                          onClick={() => !driveSyncingFileId && handleSelectDriveFile(file)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white border-2 border-slate-200 rounded-xl text-indigo-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-black text-slate-800 block truncate">{file.name}</span>
                              <span className="text-[10px] text-indigo-600 font-bold">{file.subject}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <button
                              disabled={!!driveSyncingFileId}
                              className={`px-3 py-1.5 rounded-xl text-[10px] border-2 border-slate-800 font-black transition-all flex items-center gap-1 cursor-pointer ${
                                isSyncing 
                                  ? "bg-emerald-50 text-emerald-700" 
                                  : "bg-white text-slate-800 hover:bg-indigo-50"
                              }`}
                            >
                              {isSyncing ? (
                                <>
                                  <Clock className="w-3 h-3 animate-spin text-indigo-600" />
                                  Syncing...
                                </>
                              ) : (
                                <>
                                  <Download className="w-3 h-3 text-indigo-600" />
                                  Import
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* List of study plans */}
      <div className="space-y-6">
        {studyPlans.length > 0 ? (
          studyPlans.map((plan) => (
            <div key={plan.id} className="bg-white border-4 border-slate-800 rounded-3xl p-6 space-y-6 shadow-[5px_5px_0px_0px_#1e293b]">
              
              {/* Plan Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-dashed border-slate-200 pb-4">
                <div>
                  <h4 className="text-xl font-black text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-5 h-5 text-indigo-600" /> {plan.subject}
                    {onDeleteStudyPlan && (
                      <button
                        onClick={() => setPlanToDelete(plan.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors cursor-pointer ml-1 animate-pulse"
                        title="Delete study plan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </h4>
                  <p className="text-slate-400 text-xs font-bold mt-0.5">
                    Exam Target: {plan.examDate || "Flexible schedule"} • Budget: {plan.weeklyTargetHours} hrs/week
                  </p>
                </div>

                {/* Exam Readiness Score Meter */}
                <div className="flex items-center gap-3 bg-slate-50 border-2 border-slate-800 px-4 py-2.5 rounded-2xl shrink-0 shadow-[1.5px_1.5px_0px_0px_#1e293b]">
                  <Award className="w-5 h-5 text-indigo-500" />
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black text-slate-400">
                      <span>READINESS SCORE</span>
                      <span className="text-slate-800 font-extrabold">{plan.examReadinessScore || 15}%</span>
                    </div>
                    <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden border border-slate-300">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${plan.examReadinessScore || 15}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Daily Study Routine Schedule */}
                <div className="lg:col-span-7 space-y-3">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" /> Topic Checklist
                  </h5>

                  <div className="space-y-2">
                    {plan.dailyPlan.map((d, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                          d.completed
                            ? "bg-slate-50 border-slate-300 opacity-60"
                            : "bg-white border-slate-800 hover:translate-x-[0.5px] hover:translate-y-[0.5px]"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleDailyTask(plan.id, idx)}
                            className={`w-4.5 h-4.5 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-colors shrink-0 ${
                              d.completed
                                ? "bg-indigo-500 border-slate-800 text-white"
                                : "border-slate-300 hover:border-indigo-500"
                            }`}
                          >
                            {d.completed && <span className="text-[10px] font-black">✓</span>}
                          </button>
                          <div>
                            <span className="text-xs font-black text-indigo-600 block uppercase tracking-wider">{d.day}</span>
                            <span className={`text-xs font-bold ${d.completed ? "line-through text-slate-400" : "text-slate-700"}`}>
                              {d.topic}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-black uppercase tracking-wider bg-slate-50 border-2 border-slate-100 px-2 py-0.5 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          {d.hours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Subject Breakdown & Weekly Targets */}
                <div className="lg:col-span-5 space-y-4">
                  {/* AI Breakdown text */}
                  <div className="bg-slate-50 p-4 border-2 border-slate-200 rounded-2xl">
                    <h5 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">AI SYLLABUS BREAKDOWN</h5>
                    <p className="text-xs text-slate-700 leading-relaxed font-semibold whitespace-pre-line">
                      {plan.subjectBreakdown}
                    </p>
                  </div>

                  {/* Weekly Targets */}
                  <div className="space-y-1.5">
                    <h5 className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">WEEKLY GOAL TARGETS</h5>
                    <ul className="space-y-1.5">
                      {plan.weeklyTargets.map((target, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-600 leading-relaxed">
                          <CheckCircle className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                          <span>{target}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Revision Schedule */}
                  {plan.revisionSchedule && (
                    <div className="space-y-1.5 border-t-2 border-dashed border-slate-100 pt-3">
                      <h5 className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">REVISION TIMESCALES</h5>
                      <ul className="space-y-1.5">
                        {plan.revisionSchedule.map((rev, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs font-bold text-slate-500 leading-relaxed">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5 border border-slate-800" />
                            <span>{rev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>

              </div>

            </div>
          ))
        ) : (
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-10 text-center text-xs text-slate-400 italic font-semibold shadow-[3px_3px_0px_0px_#1e293b]">
            No study plans created yet. Compile or load a syllabus text above to start!
          </div>
        )}
      </div>

      <ConfirmationDialog
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={() => {
          if (planToDelete && onDeleteStudyPlan) {
            onDeleteStudyPlan(planToDelete);
          }
        }}
        title="Delete Study Plan?"
        message="Are you sure you want to delete this AI Study Plan and all of its associated checklists and milestones? This action cannot be undone."
        confirmText="Delete Plan"
        cancelText="Cancel"
        type="danger"
      />

    </motion.div>
  );
}
