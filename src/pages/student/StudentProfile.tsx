import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import api from "../../helpers/api";
import { FaUser, FaIdCard, FaEnvelope, FaPhone, FaUserTag, FaLayerGroup, FaSchool } from "react-icons/fa";

interface Stack {
  id: string;
  title: string;
}

interface ReadOnlyInputProps {
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
}

const ReadOnlyInput: React.FC<ReadOnlyInputProps> = ({ label, value, icon }) => (
  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
    <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
    <div className="flex items-center gap-3">
      {icon && <span className="text-purple">{icon}</span>}
      <span className="text-gray-900 font-medium">{value || "—"}</span>
    </div>
  </div>
);

const StudentProfile: React.FC = () => {
  const { user } = useUser();
  const [stacks, setStacks] = useState<Stack[]>([]);
  const [loading, setLoading] = useState(true);

  const splitedFirstName = user?.fullname?.split(" ")?.[0] || "";
  const splitedLastName = user?.fullname?.split(" ")?.[1] || "";
  const initials = `${splitedFirstName[0] || ""}${splitedLastName[0] || ""}`.toUpperCase();

const fetchStacks = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      let stacksData = [];
      
      // Try /api/stacks first
      try {
        const response = await api.get("/api/stacks", { headers });
        
        if (response.data?.stacks && Array.isArray(response.data.stacks)) {
          stacksData = response.data.stacks;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          stacksData = response.data.data;
        } else if (Array.isArray(response.data)) {
          stacksData = response.data;
        }
      } catch (e) {
        console.log("First stack fetch attempt failed");
      }
      
      // If user has a stack ID but not found in list, try fetching by ID
      if (user?.stack && !stacksData.find((s: any) => s.id === user.stack)) {
        try {
          const singleRes = await api.get(`/api/stacks/${user.stack}`, { headers });
          if (singleRes.data) {
            stacksData.push(singleRes.data);
          }
        } catch (e) {
          console.log("Could not fetch single stack by ID");
        }
      }
      
      setStacks(stacksData);
    } catch (error) {
      console.error("Failed to fetch stacks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStacks();
    }
  }, [user?.id]);

  const getStackName = () => {
    if (loading) return "Loading...";
    const userStack = user?.stack;
    if (!userStack) return "—";
    const found = stacks.find((s: any) => s.id === userStack || s.title === userStack);
    return found?.title || userStack;
  };
  
  const userStackName = getStackName();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-purple px-6 py-8 text-center">
          <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center">
            <span className="text-white text-3xl font-bold">{initials}</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-4">{user.fullname || "Student"}</h2>
          <p className="text-white/70 text-sm capitalize">{userStackName}</p>
        </div>

        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ReadOnlyInput label="Full Name" value={user.fullname} icon={<FaUser className="text-sm" />} />
            <ReadOnlyInput label="Bug ID" value={user.bug_id?.toString()} icon={<FaIdCard className="text-sm" />} />
            <ReadOnlyInput label="Email" value={user.email} icon={<FaEnvelope className="text-sm" />} />
            <ReadOnlyInput label="Phone Number" value={user.mobile} icon={<FaPhone className="text-sm" />} />
            <ReadOnlyInput label="Username" value={user.username} icon={<FaUserTag className="text-sm" />} />
            <ReadOnlyInput label="Stack" value={userStackName} icon={<FaLayerGroup className="text-sm" />} />
            <ReadOnlyInput label="Department" value={user?.department || user?.role} icon={<FaSchool className="text-sm" />} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;