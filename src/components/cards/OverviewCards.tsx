import React from "react";
import { motion } from "framer-motion";

interface OverviewCardsProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  iconBg: string;
  iconColor: string;
}

const OverviewCards: React.FC<OverviewCardsProps> = ({
  icon,
  label,
  value,
  iconBg,
  iconColor,
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="flex items-center gap-4 rounded-xl bg-white p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg} ${iconColor} text-xl`}
      >
        {icon}
      </div>

      <div className="flex flex-col">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <h4 className="text-xl font-bold text-gray-900">{value}</h4>
      </div>
    </motion.div>
  );
};

export default OverviewCards;