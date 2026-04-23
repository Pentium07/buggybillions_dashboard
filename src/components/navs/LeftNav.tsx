import React from "react";
import { NavLink } from "react-router-dom";
import { LuLayoutDashboard } from "react-icons/lu";
import { BsFileEarmarkMedicalFill } from "react-icons/bs";
import { RiUserAddFill } from "react-icons/ri";
import { MdAssignmentAdd, MdLibraryBooks, MdLayers, MdSentimentVerySatisfied, MdLogout, MdSchool } from "react-icons/md";
import { GiNotebook } from "react-icons/gi";
import { useUser } from "../../context/UserContext";
import { PiStudent, PiChalkboardTeacherFill } from "react-icons/pi";
import { FaRegUser } from "react-icons/fa";
import { motion } from "framer-motion";
import { assests } from "../../assets/assest";

interface LeftNavProps {
  setIsExpanded: (value: boolean) => void;
}

const LeftNav: React.FC<LeftNavProps> = ({ setIsExpanded }) => {
  const { user, logout } = useUser();

  const navLinks = [
    {
      name: "Dashboard",
      path: "/student/overview",
      icon: <LuLayoutDashboard />,
      role: "student",
    },
    {
      name: "Student Curriculum",
      path: "/student/studentcurriculum",
      icon: <BsFileEarmarkMedicalFill />,
      role: "student",
    },
    {
      name: "Assignments",
      path: "/student/studentassignments",
      icon: <MdSentimentVerySatisfied />,
      role: "student",
    },
    {
      name: "Profile",
      path: "/student/studentprofile",
      icon: <FaRegUser />,
      role: "student",
    },
    {
      name: "Dashboard",
      path: "/admin/overview",
      icon: <LuLayoutDashboard />,
      role: "admin",
    },
    {
      name: "Weekly Lessons",
      path: "/tutor/weekly-lessons",
      icon: <LuLayoutDashboard />,
      role: "tutor",
    },
    {
      name: "Create Assignment",
      path: "/tutor/assignment",
      icon: <BsFileEarmarkMedicalFill />,
      role: "tutor",
    },
    {
      name: "Mark Attendance",
      path: "/tutor/attendance",
      icon: <GiNotebook />,
      role: "tutor",
    },
    {
      name: "Grade Assignment",
      path: "/tutor/grade",
      icon: <RiUserAddFill />,
      role: "tutor",
    },
    {
      name: "Profile",
      path: "/tutor/profile",
      icon: <MdAssignmentAdd />,
      role: "tutor",
    },
    {
      name: "Students",
      path: "/admin/managestudents",
      icon: <PiStudent />,
      role: "admin",
    },
    {
      name: "Tutors",
      path: "/admin/managetutors",
      icon: <PiChalkboardTeacherFill />,
      role: "admin",
    },
    {
      name: "Courses",
      path: "/admin/managecourses",
      icon: <MdLibraryBooks />,
      role: "admin",
    },
    {
      name: "Stacks",
      path: "/admin/managestacks",
      icon: <MdLayers />,
      role: "admin",
    },
    {
      name: "Classes",
      path: "/admin/manageclasses",
      icon: <MdSchool />,
      role: "admin",
    },
  ];

  const filteredLinks = navLinks.filter((navlink) => navlink.role === user?.role);

  return (
    <div className="h-full flex flex-col bg-purple">
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img src={assests.smalllogo} alt="BuggyBillions" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-white font-bold text-lg">BuggyBillions</h1>
            <p className="text-white/60 text-xs capitalize">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-1">
        {filteredLinks.map((navlink, index) => (
          <motion.div
            key={navlink.path}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <NavLink
              to={navlink.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-white/80 transition-all duration-200 ${
                  isActive
                    ? "bg-white/20 text-white font-semibold"
                    : "hover:bg-white/10 hover:text-white"
                }
              `}
              onClick={() => setIsExpanded(false)}
            >
              <span className="text-xl">{navlink.icon}</span>
              <span className="text-base">{navlink.name}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          type="button"
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200"
        >
          <MdLogout className="text-xl" />
          <span className="text-base">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default LeftNav;