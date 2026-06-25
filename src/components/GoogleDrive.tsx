import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Search, 
  ExternalLink, 
  Clock, 
  FileSpreadsheet, 
  FileImage, 
  FileVideo, 
  Folder, 
  AlertCircle,
  HelpCircle,
  Info,
  Layers,
  ArrowRight,
  UploadCloud,
  FilePlus,
  X,
  Check,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink?: string;
  modifiedTime: string;
}

interface GoogleDriveProps {
  googleAccessToken: string | null;
  onGoogleLogin: () => Promise<void>;
}

export default function GoogleDrive({ 
  googleAccessToken, 
  onGoogleLogin 
}: GoogleDriveProps) {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sandboxMode, setSandboxMode] = useState(false);

  // New robust states for limits, creating documents, and uploading
  const [limitAmount, setLimitAmount] = useState(24);
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [newFileMimeType, setNewFileMimeType] = useState("application/vnd.google-apps.document");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [createSuccess, setCreateSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");

  // Fallback demo files shown only in explicit simulation mode
  const demoFiles: DriveFile[] = [
    {
      id: "df1",
      name: "Class Syllabus & Grading Rubric CS302.gdoc",
      mimeType: "application/vnd.google-apps.document",
      webViewLink: "https://docs.google.com/document/d/1mock-syllabus/edit",
      modifiedTime: "2026-06-25T14:30:00.000Z"
    },
    {
      id: "df2",
      name: "Machine Learning Final Project Guidelines.pdf",
      mimeType: "application/pdf",
      webViewLink: "https://docs.google.com/document/d/1mock-guidelines/edit",
      modifiedTime: "2026-06-24T10:15:00.000Z"
    },
    {
      id: "df3",
      name: "Group Alpha Pitch Deck v2.gslides",
      mimeType: "application/vnd.google-apps.presentation",
      webViewLink: "https://docs.google.com/presentation/d/1mock-deck/edit",
      modifiedTime: "2026-06-25T09:00:00.000Z"
    },
    {
      id: "df4",
      name: "Startup Finances & Budget Tracker.gsheet",
      mimeType: "application/vnd.google-apps.spreadsheet",
      webViewLink: "https://docs.google.com/spreadsheets/d/1mock-budget/edit",
      modifiedTime: "2026-06-23T16:45:00.000Z"
    }
  ];

  useEffect(() => {
    if (googleAccessToken) {
      handleFetchFiles();
    }
  }, [googleAccessToken]);

  const handleFetchFiles = async (customLimit = limitAmount, queryStr = searchQuery) => {
    setIsLoading(true);
    setDriveError(null);
    setFiles([]);

    try {
      if (!googleAccessToken) {
        throw new Error("Access token missing.");
      }

      // Fetch file list with v3 Google Drive API using name query if present
      let queryPart = "trashed = false";
      if (queryStr) {
        queryPart += ` and name contains '${queryStr.replace(/'/g, "\\'")}'`;
      }

      const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${customLimit}&q=${encodeURIComponent(queryPart)}&fields=files(id,name,mimeType,webViewLink,iconLink,modifiedTime)&orderBy=modifiedTime%20desc`, {
        headers: { Authorization: `Bearer ${googleAccessToken}` }
      });

      if (!res.ok) {
        throw new Error("Session expired or lacks permission. Reconnect Google Account.");
      }

      const data = await res.json();
      if (data.files) {
        setFiles(data.files);
      }
    } catch (err: any) {
      console.error(err);
      setDriveError(err.message || "Failed to load Google Drive files.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;

    setIsCreatingFile(true);
    setDriveError(null);
    setCreateSuccess("");

    try {
      if (!googleAccessToken) {
        throw new Error("Connect your Google account to create files.");
      }

      const res = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newFileName,
          mimeType: newFileMimeType
        })
      });

      if (!res.ok) {
        throw new Error("Failed to create file on Google Drive. Please verify credentials.");
      }

      const createdFile = await res.json();
      setCreateSuccess(`Successfully created "${newFileName}"!`);
      setNewFileName("");

      // Refresh file list
      handleFetchFiles(limitAmount, searchQuery);

      setTimeout(() => {
        setIsCreating(false);
        setCreateSuccess("");
      }, 2000);

    } catch (err: any) {
      setDriveError(err.message || "Failed to create document.");
    } finally {
      setIsCreatingFile(false);
    }
  };

  const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setDriveError(null);
    setUploadSuccess("");

    try {
      if (!googleAccessToken) {
        throw new Error("Connect your Google account to upload files.");
      }

      const metadata = {
        name: file.name,
        mimeType: file.type
      };

      const boundary = "foo_bar_boundary_taskboard";
      const delimiter = `\r\n--${boundary}\r\n`;
      const close_delim = `\r\n--${boundary}--`;

      const reader = new FileReader();
      
      const fileLoadedPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          try {
            const binary = new Uint8Array(reader.result as ArrayBuffer);
            let binaryStr = "";
            for (let i = 0; i < binary.length; i++) {
              binaryStr += String.fromCharCode(binary[i]);
            }
            const base64Data = btoa(binaryStr);
            resolve(base64Data);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read local file."));
      });

      reader.readAsArrayBuffer(file);
      const base64Data = await fileLoadedPromise;

      const contentType = file.type || 'application/octet-stream';
      const multipartRequestBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: ' + contentType + '\r\n' +
        'Content-Transfer-Encoding: base64\r\n\r\n' +
        base64Data +
        close_delim;

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            'Content-Type': `multipart/related; boundary=${boundary}`,
          },
          body: multipartRequestBody,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload to Google Drive. Keep sizes below 5MB.");
      }

      setUploadSuccess(`Uploaded "${file.name}" successfully!`);
      handleFetchFiles(limitAmount, searchQuery);

      setTimeout(() => {
        setUploadSuccess("");
      }, 3000);

    } catch (err: any) {
      setDriveError(err.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleTriggerSandbox = () => {
    setSandboxMode(true);
    setFiles(demoFiles);
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("document") || mimeType.includes("gdoc")) return <FileText className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes("spreadsheet") || mimeType.includes("gsheet") || mimeType.includes("excel")) return <FileSpreadsheet className="w-5 h-5 text-emerald-500" />;
    if (mimeType.includes("presentation") || mimeType.includes("gslides") || mimeType.includes("powerpoint")) return <Layers className="w-5 h-5 text-amber-500" />;
    if (mimeType.includes("image")) return <FileImage className="w-5 h-5 text-pink-500" />;
    if (mimeType.includes("video")) return <FileVideo className="w-5 h-5 text-red-500" />;
    if (mimeType.includes("folder")) return <Folder className="w-5 h-5 text-indigo-400" />;
    return <FileText className="w-5 h-5 text-slate-500" />;
  };

  const getFileBadgeColor = (mimeType: string) => {
    if (mimeType.includes("document")) return "bg-blue-50 text-blue-700 border-blue-200";
    if (mimeType.includes("spreadsheet")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (mimeType.includes("presentation")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (mimeType.includes("folder")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const getFileMimeLabel = (mimeType: string) => {
    if (mimeType.includes("document")) return "Google Doc";
    if (mimeType.includes("spreadsheet")) return "Google Sheet";
    if (mimeType.includes("presentation")) return "Google Slide";
    if (mimeType.includes("folder")) return "Folder";
    if (mimeType.includes("pdf")) return "PDF Document";
    return "Workspace File";
  };

  // Filter based on search query
  const filteredFiles = files.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    getFileMimeLabel(f.mimeType).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-3xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_#1e293b] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-black uppercase rounded-full border-2 border-blue-500 shadow-[1px_1px_0px_0px_#1e293b] mb-2">
            Google Drive browser
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">AI Workspace Document Explorer</h2>
          <p className="text-slate-500 text-xs mt-1.5 font-bold leading-relaxed">
            Directly browse, search, and open your Google Docs, Slides, and Worksheets directly inside your IDoManage learning companion.
          </p>
        </div>

        <div>
          {googleAccessToken ? (
            <div className="flex items-center gap-2 bg-emerald-50 border-2 border-slate-800 px-3.5 py-1.5 rounded-2xl shadow-[1.5px_1.5px_0px_0px_#1e293b]">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-800 animate-ping" />
              <span className="text-[10px] text-emerald-800 font-extrabold uppercase tracking-wider">Drive Synced</span>
            </div>
          ) : (
            <button
              onClick={onGoogleLogin}
              className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-black rounded-2xl border-3 border-slate-800 shadow-[2.5px_2.5px_0px_0px_#1e293b] active:scale-95 transition-all cursor-pointer uppercase tracking-wider"
            >
              Browse Google Drive 📂
            </button>
          )}
        </div>
      </div>

      {/* Onboarding block if not logged in */}
      {!googleAccessToken && !sandboxMode && (
        <div className="bg-slate-50 border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b] space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 border-2 border-slate-800 flex items-center justify-center font-bold text-lg">📁</div>
            <div>
              <h3 className="text-base font-black text-slate-800">Kid-Friendly Document Explorer</h3>
              <p className="text-xs text-slate-500 font-bold">Why link your Google Drive? Even children can find resources instantly!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-blue-600">1</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">Authorize Securely</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Connect your account so IDoManage can locate your school documents and syllabus files securely.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-indigo-600">2</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">Visual Bento Browser</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                View elegant, color-coded files for your documents, spreadsheets, and slides with instant search filtering.
              </p>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] space-y-2">
              <span className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-slate-800 flex items-center justify-center font-black text-sm text-emerald-600">3</span>
              <h4 className="text-xs font-black text-slate-800 uppercase">One-Click Open</h4>
              <p className="text-[11px] text-slate-500 font-bold leading-relaxed">
                Simply click the diagonal arrow icon to jump directly into your real homework or study materials instantly!
              </p>
            </div>
          </div>

          <div className="border-t-2 border-dashed border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-500 font-bold flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Want to see it in action first? Press the demo button to open simulated files!</span>
            </div>
            <button
              onClick={handleTriggerSandbox}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-black rounded-xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] cursor-pointer animate-pulse"
            >
              Run Demo Document Browser 📁
            </button>
          </div>
        </div>
      )}

      {/* Real / Sandbox File Browser Content */}
      {(googleAccessToken || sandboxMode) && (
        <div className="space-y-4">
          
          {/* Filtering control bar */}
          <div className="bg-white p-4 rounded-2xl border-3 border-slate-800 shadow-[3px_3px_0px_0px_#1e293b] flex flex-col xl:flex-row gap-4 items-center justify-between">
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (sandboxMode) handleTriggerSandbox();
                else handleFetchFiles(limitAmount, searchQuery);
              }}
              className="flex flex-col sm:flex-row gap-2 w-full xl:w-auto flex-1"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
                <input
                  type="text"
                  placeholder={sandboxMode ? "Search demo documents..." : "Search entire Google Drive (press Enter or click Search)..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border-2 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border-2 border-slate-800 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] active:scale-95 transition-all shrink-0"
              >
                Search Drive 🔍
              </button>
            </form>

            <div className="flex flex-wrap gap-2 w-full xl:w-auto items-center justify-end">
              {/* Limit Selector */}
              <div className="flex items-center gap-1.5 bg-slate-100 border-2 border-slate-800 px-2.5 py-1.5 rounded-xl text-[11px] font-bold">
                <span className="text-slate-500 uppercase text-[9px] font-black">Display:</span>
                <select
                  value={limitAmount}
                  onChange={(e) => {
                    const limit = Number(e.target.value);
                    setLimitAmount(limit);
                    if (googleAccessToken) handleFetchFiles(limit, searchQuery);
                  }}
                  className="bg-transparent border-none focus:outline-none text-slate-800 font-extrabold cursor-pointer"
                >
                  <option value={12}>12 files</option>
                  <option value={24}>24 files</option>
                  <option value={48}>48 files</option>
                  <option value={100}>100 files</option>
                </select>
              </div>

              {/* Upload File Input */}
              {googleAccessToken && (
                <label className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 border-2 border-dashed border-indigo-400 text-indigo-700 text-xs font-black rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors">
                  <UploadCloud className="w-4 h-4 shrink-0" />
                  <span>{isUploading ? "Uploading..." : "Upload File"}</span>
                  <input
                    type="file"
                    disabled={isUploading}
                    onChange={handleUploadFile}
                    className="hidden"
                  />
                </label>
              )}

              {/* Create Document Button */}
              {googleAccessToken && (
                <button
                  onClick={() => {
                    setCreateSuccess("");
                    setIsCreating(true);
                  }}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 border-2 border-slate-800 text-white text-xs font-black rounded-xl flex items-center gap-1.5 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] active:scale-95 transition-all"
                >
                  <FilePlus className="w-4 h-4 shrink-0" />
                  <span>New Doc ➕</span>
                </button>
              )}

              {sandboxMode && (
                <button
                  onClick={() => {
                    setSandboxMode(false);
                    setFiles([]);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 border-2 border-slate-800 text-rose-700 text-xs font-black rounded-xl cursor-pointer"
                >
                  Exit Demo
                </button>
              )}
              <button
                onClick={() => sandboxMode ? handleTriggerSandbox() : handleFetchFiles(limitAmount, searchQuery)}
                disabled={isLoading}
                className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border-2 border-slate-800 text-slate-800 text-xs font-black rounded-xl flex items-center gap-2 cursor-pointer shadow-[1.5px_1.5px_0px_0px_#000] active:scale-95"
              >
                {isLoading ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" /> Fetching...
                  </>
                ) : (
                  <>
                    Refresh
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Upload and Create Success Feedback Banners */}
          {uploadSuccess && (
            <div className="p-3 bg-emerald-50 border-2 border-emerald-400 text-emerald-800 rounded-2xl flex items-center gap-2.5 font-bold text-xs">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{uploadSuccess}</span>
            </div>
          )}

          {/* Create Document Modal Overlay */}
          <AnimatePresence>
            {isCreating && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 15 }}
                  className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#1e293b] w-full max-w-md space-y-4"
                >
                  <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3">
                    <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-2">
                      <FilePlus className="w-5 h-5 text-emerald-500" />
                      <span>Create New Google Workspace File</span>
                    </h3>
                    <button
                      onClick={() => setIsCreating(false)}
                      className="p-1 hover:bg-slate-100 rounded-xl border border-transparent hover:border-slate-300 transition-all cursor-pointer"
                    >
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>

                  <form onSubmit={handleCreateFile} className="space-y-4">
                    {createSuccess && (
                      <div className="p-3 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 font-bold text-xs">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{createSuccess}</span>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Document Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Science Project Syllabus Outline"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border-2 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">File Format</label>
                      <select
                        value={newFileMimeType}
                        onChange={(e) => setNewFileMimeType(e.target.value)}
                        className="w-full px-3.5 py-2 bg-slate-50 border-2 border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:bg-white cursor-pointer"
                      >
                        <option value="application/vnd.google-apps.document">Google Document (Doc)</option>
                        <option value="application/vnd.google-apps.spreadsheet">Google Spreadsheet (Sheet)</option>
                        <option value="application/vnd.google-apps.presentation">Google Presentation (Slide)</option>
                      </select>
                    </div>

                    <div className="flex gap-2 justify-end border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isCreatingFile}
                        className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 border-2 border-slate-800 text-white text-xs font-black rounded-xl shadow-[1.5px_1.5px_0px_0px_#000] flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                      >
                        {isCreatingFile ? (
                          <>
                            <Clock className="w-4 h-4 animate-spin" /> Creating...
                          </>
                        ) : (
                          <>
                            <span>Create File</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {driveError && (
            <div className="p-4 bg-red-50 border-3 border-slate-800 text-red-800 rounded-2xl flex items-center gap-3 font-bold text-xs">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{driveError}</span>
            </div>
          )}

          {/* Grid of Files */}
          <div className="bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[5px_5px_0px_0px_#1e293b]">
            <div className="flex justify-between items-center border-b-2 border-slate-100 pb-3 mb-5">
              <h3 className="text-sm font-black text-slate-800 uppercase flex items-center gap-1.5">
                <span>📂 Google Drive Workspace Files</span>
                {sandboxMode && <span className="text-[10px] text-amber-600 font-extrabold px-1.5 py-0.5 bg-amber-50 border border-amber-300 rounded-md">DEMO DATA</span>}
              </h3>
              <span className="text-xs text-slate-400 font-black">
                {filteredFiles.length} files located
              </span>
            </div>

            {filteredFiles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id}
                    className="p-4 bg-slate-50 border-2 border-slate-800 rounded-2xl flex flex-col justify-between gap-4 hover:border-blue-500 hover:bg-white transition-all shadow-[2px_2px_0px_0px_#1e293b]"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="p-2 bg-white rounded-xl border border-slate-300 shadow-inner">
                          {getFileIcon(file.mimeType)}
                        </div>
                        
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase border-2 ${getFileBadgeColor(file.mimeType)}`}>
                          {getFileMimeLabel(file.mimeType)}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-black text-slate-800 line-clamp-2 hover:text-indigo-600 transition-colors" title={file.name}>
                          {file.name}
                        </h4>
                        <p className="text-[9px] text-slate-400 font-bold mt-1">
                          Last edited: {new Date(file.modifiedTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-200/60 pt-3 flex items-center justify-end">
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        referrerPolicy="no-referrer"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-white hover:bg-indigo-50 border-2 border-slate-800 text-indigo-600 text-[10px] font-black rounded-xl flex items-center gap-1.5 shadow-[1.5px_1.5px_0px_0px_#1e293b] active:translate-y-[0.5px]"
                      >
                        <span>Open Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400 italic bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl font-semibold flex flex-col items-center justify-center gap-3">
                <Folder className="w-10 h-10 text-slate-300 shrink-0" />
                <div>
                  <p className="font-bold text-slate-500">No files located in your Google Drive.</p>
                  <p className="text-[10px] text-slate-400 font-normal mt-1">Upload a syllabus doc, sheet, or deck to Google Drive and press Refresh!</p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
