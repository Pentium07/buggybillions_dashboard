import React, { useRef, useState } from "react";
import LeftNav from "../components/navs/LeftNav";
import TopNav from "../components/navs/TopNav";
import { AnimatePresence, motion } from "framer-motion";
import { FaBars } from "react-icons/fa";

interface MainLayOutProps {
  child: React.ReactElement;
  heading: string;
  subText?: string;
}

const MainLayout: React.FC<MainLayOutProps> = ({ child, heading, subText }) => {
  const mainContentRef = useRef(null);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-screen h-screen overflow-hidden flex bg-gray-50">
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-64 h-full
          transform transition-transform duration-300 ease-out
          ${isExpanded ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        <div className="h-full">
          <LeftNav setIsExpanded={setIsExpanded} />
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full min-w-0">
        <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
          <button
            type="button"
            className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-gray-50 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <FaBars className="text-gray-600 text-lg" />
          </button>
          <div className="flex-1">
            <TopNav heading={heading} subText={subText || ""} />
          </div>
        </header>

        <main
          ref={mainContentRef}
          className="flex-1 overflow-y-auto no-scrollbar px-4 py-4 lg:px-6 lg:py-6"
          style={{
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
          }}
          tabIndex={-1}
        >
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {child}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;