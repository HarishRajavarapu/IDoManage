import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Sparkles, 
  AlertCircle, 
  Clock, 
  CheckCircle2, 
  PlusCircle, 
  User, 
  FileText, 
  ExternalLink, 
  Search, 
  ArrowRight,
  HelpCircle,
  MailQuestion,
  Send,
  X,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ExtractedTask {
  title: string;
  description: string;
  deadline: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  added?: boolean;
  sender?: string;
  attachments?: { name: string; url: string; type?: string }[];
}

interface GoogleGmailProps {
  googleAccessToken: string | null;
  onGoogleLogin: () => Promise<void>;
  onAddTask: (
    title: string, 
    priority: 'LOW' | 'MEDIUM' | 'HIGH', 
    milestoneId?: string,
    description?: string,
    deadline?: string,
    sender?: string,
    attachments?: { name: string; url: string; type?: string }[]
  ) => void;
}

export default function GoogleGmail({ 
  googleAccessToken, 
  onGoogleLogin, 
  onAddTask 
}: GoogleGmailProps) {
  const [isSyncingGmail, setIsSyncingGmail] = useState(false);
  const [syncStep, setSyncStep] = useState<string>("");
  const [gmailError, setGmailError] = useState<string | null>(null);
  const [extractedTasks, setExtractedTasks] = useState<ExtractedTask[]>([]);
  const [realEmails, setRealEmails] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sandboxMode, setSandboxMode] = useState(false);
  
  // New robust states for compose, search and pagination
  const [limitAmount, setLimitAmount] = useState(15);
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeBody, setComposeBody] = useState("");
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [sendSuccessMessage, setSendSuccessMessage] = useState<string | null>(null);
  const [sendErrorMessage, setSendErrorMessage] = useState<string | null>(null);

  // Fallback demo emails ONLY shown in explicit Sandbox Mode
  const demoEmails = [
    {
      id: "demo1",
      from: "Prof. Harish Rajavarapu <harish@university.edu>",
      subject: "Final Year AI Project Submission Syllabus & Draft",
      body: "Hello class, please make sure you upload your draft AI project materials and final syllabus review documents by Friday, July 10 at 5:00 PM. No late submittals.",
      snippet: "Please make sure you upload your draft AI project materials by Friday...",
      date: "2026-06-25",
      attachments: [
        { name: "AI_Submission_Guidelines.pdf", url: "https://docs.google.com/document/d/1mock-doc-id-1/edit", type: "application/pdf" }
      ]
    },
    {
      id: "demo2",
      from: "Co-Founder Sarah Jenkins <sarah@startupincubator.io>",
      subject: "Action Needed: Weekly Startup Goals and Database Schema",
      body: "Hi Team, please prepare the database schema revisions and complete the Express controller routes by next Tuesday so we can review during the Scrum.",
      snippet: "Please prepare the database schema revisions and complete the Express routes...",
      date: "2026-06-24",
      attachments: [
        { name: "Schema_Revisions.xlsx", url: "https://docs.google.com/spreadsheets/d/1mock-sheet-id-1/edit", type: "application/vnd.google-apps" }
      ]
    }
  ];

  // Auto-run if connected
  useEffect(() => {
    if (googleAccessToken) {
      handleFetchGmail();
    }
  }, [googleAccessToken]);

  const handleFetchGmail = async (customLimit = limitAmount, queryStr = searchQuery) => {
    setIsSyncingGmail(true);
    setGmailError(null);
    setSyncStep("Establishing secure connection...");
    setRealEmails([]);

    try {
      if (!googleAccessToken) {
        throw new Error("Google access token missing. Please sign in.");
      }

      setSyncStep("Pulling recent messages from Gmail...");
      const qParam = queryStr ? `&q=${encodeURIComponent(queryStr)}` : "";
      const listRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${customLimit}${qParam}`, {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });

      if (!listRes.ok) {
        throw new Error("Gmail API session expired or lacks permission. Please re-authenticate.");
      }

      const listData = await listRes.json();
      if (!listData.messages || listData.messages.length === 0) {
        setSyncStep("");
        setIsSyncingGmail(false);
        return;
      }

      setSyncStep(`Retrieved ${listData.messages.length} message headers. Fetching bodies...`);
      const fetched = [];

      for (const msg of listData.messages) {
        const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
          headers: { Authorization: `Bearer ${googleAccessToken}` }
        });

        if (msgRes.ok) {
          const msgData = await msgRes.json();
          const headers = msgData.payload.headers || [];
          const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "(No Subject)";
          const from = headers.find((h: any) => h.name.toLowerCase() === "from")?.value || "Unknown Sender";
          const date = headers.find((h: any) => h.name.toLowerCase() === "date")?.value || "";
          const snippet = msgData.snippet || "";

          // Simple body extraction
          let bodyText = snippet;
          const getBody = (payload: any): string => {
            if (!payload) return "";
            if (payload.body && payload.body.data) {
              try {
                const base64 = payload.body.data.replace(/-/g, '+').replace(/_/g, '/');
                return decodeURIComponent(escape(window.atob(base64)));
              } catch (e) {
                return "";
              }
            }
            if (payload.parts) {
              for (const part of payload.parts) {
                const pb = getBody(part);
                if (pb) return pb;
              }
            }
            return "";
          };
          const extractedBody = getBody(msgData.payload);
          if (extractedBody) bodyText = extractedBody;

          // Extract drive links as attachments
          const attachments: any[] = [];
          const linkRegex = /(https:\/\/(?:docs|drive)\.google\.com\/[^\s'">]+)/g;
          let match;
          const seen = new Set<string>();
          while ((match = linkRegex.exec(bodyText)) !== null) {
            const url = match[1];
            if (!seen.has(url)) {
              seen.add(url);
              let name = "Attached Workspace Document";
              if (url.includes("/document/")) name = "Google Doc Resource";
              else if (url.includes("/spreadsheets/")) name = "Google Sheet Plan";
              attachments.push({ name, url, type: "application/vnd.google-apps" });
            }
          }

          fetched.push({
            id: msg.id,
            from,
            subject,
            snippet,
            body: bodyText.substring(0, 1500),
            date,
            attachments
          });
        }
      }

      setRealEmails(fetched);

      if (fetched.length > 0) {
        setSyncStep("Processing emails with Chief of Staff AI...");
        const aiRes = await fetch("/api/gmail-tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emails: fetched })
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          if (aiData && aiData.tasks) {
            setExtractedTasks(aiData.tasks);
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      setGmailError(err.message || "Failed to scan Gmail inbox.");
    } finally {
      setIsSyncingGmail(false);
      setSyncStep("");
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composeTo || !composeSubject || !composeBody) {
      setSendErrorMessage("Please fill out all fields.");
      return;
    }

    setIsSendingEmail(true);
    setSendErrorMessage(null);
    setSendSuccessMessage(null);

    try {
      if (!googleAccessToken) {
        throw new Error("You must connect your Google account to send emails.");
      }

      // Helper to construct a basic MIME email message
      const makeEmail = (to: string, subject: string, message: string) => {
        const str = [
          `To: ${to}`,
          'Content-Type: text/html; charset=utf-8',
          'MIME-Version: 1.0',
          `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
          '',
          message
        ].join('\n');
        
        // Base64url encode
        return btoa(unescape(encodeURIComponent(str)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');
      };

      const raw = makeEmail(composeTo, composeSubject, composeBody);

      const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ raw })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error?.message || "Failed to send email. Check recipient address.");
      }

      setSendSuccessMessage("Your email has been sent successfully!");
      setComposeTo("");
      setComposeSubject("");
      setComposeBody("");
      
      // Auto-refresh Gmail list after sending
      setTimeout(() => {
        setIsComposing(false);
        setSendSuccessMessage(null);
        handleFetchGmail(limitAmount, searchQuery);
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setSendErrorMessage(err.message || "An unexpected error occurred while sending.");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleScanSandbox = async () => {
    setIsSyncingGmail(true);
    setGmailError(null);
    setSyncStep("Simulating secure sandbox parse...");
    
    try {
      setRealEmails(demoEmails);
      const aiRes = await fetch("/api/gmail-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails: demoEmails })
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        if (aiData && aiData.tasks) {
          setExtractedTasks(aiData.tasks);
        }
      }
    } catch (err: any) {
      setGmailError("Failed to parse simulated tasks.");
    } finally {
      setIsSyncingGmail(false);
      setSyncStep("");
    }
  };

  const handleAddExtractedTask = (idx: number) => {
    const task = extractedTasks[idx];
    onAddTask(
      task.title, 
      task.priority, 
      undefined, 
      task.description, 
      task.deadline, 
      task.sender, 
      task.attachments
    );
    
    const updated = [...extractedTasks];
    updated[idx] = { ...updated[idx], added: true };
    setExtractedTasks(updated);
  };

  // Filter tasks or emails based on search query
  const filteredTasks = extractedTasks.filter(t => 
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.sender && t.sender.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredEmails = realEmails.filter(e =>
    e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-black uppercase rounded-full border-2 border-red-500 shadow-[1px_1px_0px_0px_#1e293b] mb-2">
            Google Gmail Linker
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">AI Email Homework Scanner</h2>
          <p className="text-slate-500 text-xs mt-1.5 font-bold leading-relaxed">
            Reads your school, university, or workspace emails to find homework assignments, project drafts, and deadlines automatically.
          </p>
        </div>

        <div>
          {googleAccessToken ? (
            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-slate-800 px-3.5 py-1.5 rounded-2xl shadow-[1.5px_1.5px_0px_0px_#1e293b]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-800 animate-ping" />
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">Live Gmail Connected</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={onGoogleLogin}
                className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-2xl border-3 border-slate-800 shadow-[2.5px_2.5px_0px_0px_#1e293b] active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
              >
                Connect Real Gmail ✉️
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Onboarding block if not logged in */}
      {!googleAccessToken && !sandboxMode && (
        <div className="bg-amber-50 border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-200 border-2 border-slate-800 flex items-center justify-center font-bold text-lg">💡</div>
            <div>
              <h3 className="text-base font-black text-slate-800">For Parents, Kids & Beginners: How does this work?</h3>
              <p className="text-xs text-slate-500 font-bold">Follow these simple steps below to automatically pull your homework!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-red-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-red-600">1</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">Connect Gmail</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Click the red button above. This securely connects your Google account so the AI can read school emails.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-indigo-600">2</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">Scan Inbox</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                The smart AI "Chief of Staff" will read the emails to extract subject lines, due dates, and links.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-emerald-600">3</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">Map to board</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Click "Map" to add any discovered homework directly onto your calendar & Todo list with a single click!
              </p>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Don't have a Google account handy right now? Try Sandbox mode to see a demonstration of how it acts!</span>
            </div>
            <button
              onClick={() => {
                setSandboxMode(true);
                handleScanSandbox();
              }}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] cursor-pointer"
            >
              Start Sandbox Simulation 🚀
            </button>
          </div>
        </div>
      )}

      {/* Main Content Pane */}
      {(googleAccessToken || sandboxMode) && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Email Scan Control Center */}
          <div className="lg:col-span-12 space-y-4">
            
            {/* Search and Action Bar */}
            <div className="bg-white p-4 rounded-2xl border-3 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] flex flex-col xl:flex-row gap-4 items-center justify-between">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (sandboxMode) handleScanSandbox();
                  else handleFetchGmail(limitAmount, searchQuery);
                }}
                className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto flex-1"
              >
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                  <input
                    type="text"
                    placeholder={sandboxMode ? "Search demo emails..." : "Search entire mailbox (press Enter or click Search)..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border-2 border-slate-800 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] active:scale-95 transition-all shrink-0"
                >
                  Search Inbox 🔍
                </button>
              </form>

              <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center justify-end">
                {/* Limit Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 border-2 border-slate-800 px-2.5 py-1.5 rounded-xl text-[11px] font-bold">
                  <span className="text-slate-500 uppercase text-[9px] font-black">Fetch Amount:</span>
                  <select
                    value={limitAmount}
                    onChange={(e) => {
                      const limit = Number(e.target.value);
                      setLimitAmount(limit);
                      if (googleAccessToken) handleFetchGmail(limit, searchQuery);
                    }}
                    className="bg-transparent border-none focus:outline-none text-slate-800 font-extrabold cursor-pointer"
                  >
                    <option value={10}>10 Emails</option>
                    <option value={15}>15 Emails</option>
                    <option value={30}>30 Emails</option>
                    <option value={50}>50 Emails</option>
                    <option value={100}>100 Emails</option>
                  </select>
                </div>

                {/* Compose Button */}
                {googleAccessToken && (
                  <button
                    onClick={() => {
                      setSendSuccessMessage(null);
                      setSendErrorMessage(null);
                      setIsComposing(true);
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Compose Email ✉️
                  </button>
                )}

                {sandboxMode && (
                  <button
                    onClick={() => {
                      setSandboxMode(false);
                      setExtractedTasks([]);
                      setRealEmails([]);
                    }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black rounded-xl border-2 border-slate-800 shrink-0"
                  >
                    Exit Sandbox
                  </button>
                )}
                
                <button
                  onClick={() => sandboxMode ? handleScanSandbox() : handleFetchGmail(limitAmount, searchQuery)}
                  disabled={isSyncingGmail}
                  className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-black rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#000] flex items-center justify-center gap-2"
                >
                  {isSyncingGmail ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin" /> {syncStep || "Scanning..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Scan Gmail inbox
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Compose Email Modal */}
            <AnimatePresence>
              {isComposing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 15 }}
                    className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#1e293b] w-full max-w-lg space-y-4"
                  >
                    <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
                      <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                        <span>✉️ Compose New Email</span>
                      </h3>
                      <button
                        onClick={() => setIsComposing(false)}
                        className="p-1 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-300 transition-all cursor-pointer"
                      >
                        <X className="w-5 h-5 text-slate-500" />
                      </button>
                    </div>

                    <form onSubmit={handleSendEmail} className="space-y-4">
                      {sendErrorMessage && (
                        <div className="p-3 bg-red-50 border-2 border-red-300 text-red-800 rounded-xl flex items-center gap-2 font-bold text-xs">
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                          <span>{sendErrorMessage}</span>
                        </div>
                      )}

                      {sendSuccessMessage && (
                        <div className="p-3 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 font-bold text-xs">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{sendSuccessMessage}</span>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">To (Recipient Email)</label>
                        <input
                          type="email"
                          required
                          placeholder="professor@university.edu"
                          value={composeTo}
                          onChange={(e) => setComposeTo(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 border-2 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Subject</label>
                        <input
                          type="text"
                          required
                          placeholder="Re: AI Assignment Submission"
                          value={composeSubject}
                          onChange={(e) => setComposeSubject(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 border-2 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Email Body (HTML/Text)</label>
                        <textarea
                          required
                          rows={6}
                          placeholder="Dear Professor, Please find my final project drafts and syllabus outline attached in this drive..."
                          value={composeBody}
                          onChange={(e) => setComposeBody(e.target.value)}
                          className="w-full px-3.5 py-2 bg-slate-50 border-2 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                        />
                      </div>

                      <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                        <button
                          type="button"
                          onClick={() => setIsComposing(false)}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSendingEmail}
                          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl border-2 border-slate-800 shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                        >
                          {isSendingEmail ? (
                            <>
                              <Clock className="w-4 h-4 animate-spin" /> Sending...
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" /> Send Email 🚀
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {gmailError && (
              <div className="p-4 bg-red-50 border-3 border-slate-800 text-red-800 rounded-2xl flex items-center gap-3 font-bold text-xs">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span>{gmailError}</span>
              </div>
            )}
          </div>

          {/* Left Column: AI-Extracted Tasks (Kid Friendly) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1e293b]">
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase">
                  <span>📝 Extracted Action items</span>
                  {sandboxMode && <span className="text-[10px] text-amber-600 font-extrabold px-1.5 py-0.5 bg-amber-50 border border-amber-300 rounded-md">SIMULATION</span>}
                </h3>
                <span className="text-[10px] bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-black">
                  {filteredTasks.length} Identified
                </span>
              </div>

              {filteredTasks.length > 0 ? (
                <div className="space-y-4">
                  {filteredTasks.map((task, idx) => (
                    <div 
                      key={idx}
                      className="p-4 bg-slate-50 border-2 border-slate-800 rounded-2xl flex flex-col gap-3 relative hover:bg-white hover:border-indigo-500 transition-colors shadow-[2px_2px_0px_0px_#1e293b]"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className={`text-[8px] font-black px-1.5 py-0.5 border-2 rounded-md uppercase ${
                            task.priority === "HIGH" ? "bg-rose-50 text-rose-800 border-rose-300" :
                            task.priority === "MEDIUM" ? "bg-amber-50 text-amber-800 border-amber-300" :
                            "bg-sky-50 text-sky-800 border-sky-300"
                          }`}>
                            {task.priority} Priority
                          </span>
                          <h4 className="text-xs font-black text-slate-800 mt-1.5">{task.title}</h4>
                        </div>
                        <span className="text-[9px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 border border-slate-200 rounded-md">
                          Due: {task.deadline}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                        {task.description}
                      </p>

                      {task.sender && (
                        <div className="text-[9px] text-slate-400 font-extrabold flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>From: {task.sender}</span>
                        </div>
                      )}

                      <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                        <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                          {task.attachments && task.attachments.length > 0 ? (
                            <>
                              <FileText className="w-3 h-3 text-indigo-500" />
                              <span>{task.attachments.length} attachment linked</span>
                            </>
                          ) : (
                            "No attachments"
                          )}
                        </span>

                        <button
                          onClick={() => handleAddExtractedTask(idx)}
                          disabled={task.added}
                          className={`px-3 py-1.5 text-[10px] font-black border-2 border-slate-800 rounded-xl flex items-center gap-1 transition-all ${
                            task.added
                              ? "bg-emerald-50 text-emerald-700 border-emerald-300 cursor-not-allowed"
                              : "bg-white text-slate-800 hover:bg-[#FEF3C7] shadow-[1.5px_1.5px_0px_0px_#1e293b] active:translate-y-0.5"
                          }`}
                        >
                          {task.added ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mapped
                            </>
                          ) : (
                            <>
                              <PlusCircle className="w-3.5 h-3.5 text-indigo-600" /> Add to Todo list
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-semibold flex flex-col items-center justify-center gap-2">
                  <MailQuestion className="w-8 h-8 text-slate-300" />
                  <p>No task outlines extracted yet.</p>
                  <p className="text-[10px] text-slate-400 font-normal">Push "Scan Gmail inbox now" above to sync and run the AI parser!</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Scanned Emails Feed */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border-4 border-slate-800 rounded-3xl p-5 shadow-[4px_4px_0px_0px_#1e293b]">
              <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-4">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 uppercase">
                  <span>✉️ Inbox Stream</span>
                </h3>
                <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 px-2 py-0.5 rounded-full font-black">
                  {filteredEmails.length} Messages
                </span>
              </div>

              {filteredEmails.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredEmails.map((email) => (
                    <div 
                      key={email.id}
                      className="p-3 bg-slate-50 border-2 border-slate-800 rounded-xl space-y-1.5 shadow-[1.5px_1.5px_0px_0px_#1e293b]"
                    >
                      <div className="flex justify-between items-center gap-2">
                        <span className="text-[9px] text-indigo-600 font-black truncate max-w-[150px]">
                          {email.from.split("<")[0].trim()}
                        </span>
                        <span className="text-[9px] text-slate-400 font-bold shrink-0">
                          {new Date(email.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{email.subject}</h4>
                      <p className="text-[10px] text-slate-500 font-semibold line-clamp-2 leading-relaxed">{email.snippet}</p>

                      {email.attachments && email.attachments.length > 0 && (
                        <div className="pt-1.5 flex flex-wrap gap-1">
                          {email.attachments.map((att: any, aIdx: number) => (
                            <a
                              key={aIdx}
                              href={att.url}
                              target="_blank"
                              referrerPolicy="no-referrer"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-[9px] font-black text-indigo-700 rounded-md"
                            >
                              <FileText className="w-2.5 h-2.5" />
                              <span className="truncate max-w-[120px]">{att.name}</span>
                              <ExternalLink className="w-2 h-2 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 italic bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-semibold">
                  No scanned emails. Press Scan to stream.
                </div>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
