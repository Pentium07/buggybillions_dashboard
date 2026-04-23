import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "../../context/UserContext";
import { FaBell, FaSearch, FaUserCircle, FaCog, FaSignOutAlt, FaBars } from "react-icons/fa";

interface TopNavProps {
  heading: string;
  subText?: string;
}

const TopNav: React.FC<TopNavProps> = ({ heading, subText }) => {
  const { user, loading, logout } = useUser();
  const [showProfile, setShowProfile] = useState(false);

  if (loading) {
    return null;
  }

  const initials =
    user?.fullname
      ?.split(" ")
      .map((name) => name.charAt(0))
      .join("") || user?.username?.charAt(0).toUpperCase() || "U";

  return (
    <header className="flex items-center justify-between w-full">
      <div>
        <h4 className="text-lg font-bold text-gray-900">{heading}</h4>
        {subText && <p className="text-xs text-gray-500">{subText}</p>}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <FaBell className="text-gray-600 text-lg" />
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-9 h-9 rounded-lg bg-purple flex items-center justify-center">
              <span className="text-white text-sm font-semibold">{initials}</span>
            </div>
          </button>

          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.fullname || user?.username || "User"}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <div className="py-1">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                    <FaUserCircle className="text-gray-400" />
                    Profile
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
                    <FaCog className="text-gray-400" />
                    Settings
                  </button>
                </div>
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    <FaSignOutAlt />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default TopNav;