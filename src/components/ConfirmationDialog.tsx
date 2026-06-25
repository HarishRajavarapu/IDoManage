import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger"
}: ConfirmationDialogProps) {
  // Select color themes based on confirmation type
  const themeColors = {
    danger: {
      bg: "bg-rose-50",
      border: "border-rose-500",
      iconBg: "bg-rose-100",
      iconText: "text-rose-600",
      buttonBg: "bg-rose-500 hover:bg-rose-600 focus:ring-rose-500",
    },
    warning: {
      bg: "bg-amber-50",
      border: "border-amber-500",
      iconBg: "bg-amber-100",
      iconText: "text-amber-600",
      buttonBg: "bg-amber-500 hover:bg-amber-600 focus:ring-amber-500",
    },
    info: {
      bg: "bg-indigo-50",
      border: "border-indigo-500",
      iconBg: "bg-indigo-100",
      iconText: "text-indigo-600",
      buttonBg: "bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500",
    }
  };

  const colors = themeColors[type] || themeColors.danger;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900"
          />

          {/* Dialog Card */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: "spring", duration: 0.3 }}
            className="relative w-full max-w-md bg-white border-4 border-slate-800 rounded-3xl p-6 shadow-[6px_6px_0px_0px_#1e293b] overflow-hidden z-10"
          >
            {/* Top decorative color strip */}
            <div className={`absolute top-0 left-0 right-0 h-3 ${type === "danger" ? "bg-rose-500" : type === "warning" ? "bg-amber-500" : "bg-indigo-500"}`} />

            <div className="flex items-start gap-4 mt-2">
              <div className={`p-3 rounded-2xl border-2 border-slate-800 shadow-[2px_2px_0px_0px_#1e293b] ${colors.iconBg} ${colors.iconText} shrink-0`}>
                {type === "danger" ? <Trash2 className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
              </div>

              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-black text-slate-800 tracking-tight flex justify-between items-center">
                  {title}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed">
                  {message}
                </p>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-3 justify-end mt-6 pt-4 border-t-2 border-slate-100">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-800 text-xs font-bold rounded-xl shadow-[2px_2px_0px_0px_#1e293b] cursor-pointer transition-all"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`px-5 py-2 text-white border-2 border-slate-800 text-xs font-black rounded-xl shadow-[2px_2px_0px_0px_#1e293b] cursor-pointer transition-all ${colors.buttonBg}`}
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
