import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

// Simple hook to detect if screen is mobile (< 768px)
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
}

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function BottomSheet({ isOpen, onClose, title, children }: BottomSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-50 cursor-pointer"
          />

          {/* Bottom Sheet Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120) {
                onClose();
              }
            }}
            className="fixed inset-x-0 bottom-0 z-50 bg-white border-t border-zinc-150 rounded-t-2xl shadow-2xl flex flex-col max-h-[85vh] select-none pb-safe touch-none"
          >
            {/* Drag Handle Area */}
            <div className="flex flex-col items-center py-3.5 shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-zinc-200 rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-zinc-100 flex items-center justify-between shrink-0">
              <span className="font-bold text-sm text-zinc-900">{title}</span>
              <button
                type="button"
                onClick={onClose}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {/* Scrollable Content (stops propagation of drag so user can scroll items inside) */}
            <div
              className="overflow-y-auto p-6 flex-1 min-h-0 pointer-events-auto touch-pan-y"
              onPointerDown={(e) => e.stopPropagation()}
            >
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
