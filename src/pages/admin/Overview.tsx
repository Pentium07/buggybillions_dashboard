import React, { useEffect, useState } from "react";
import OverviewCards from "../../components/cards/OverviewCards";
import { HiOutlineUserGroup, HiOutlineAcademicCap } from "react-icons/hi";
import { FaTrophy, FaMedal } from "react-icons/fa";
import { formatterUtility } from "../../helpers/formatterUtility";
import api from "../../helpers/api";

interface LeaderboardUser {
  student_id: number;
  fullname: string | null;
  stack: string | null;
  average_assignment: number;
  attendance: number;
  overall_grade: number;
}

interface Stack {
  id: string;
  title: string;
}

const AdminOverview: React.FC = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTutors, setTotalTutors] = useState(0);
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [stacks, setStacks] = useState<Stack[]>([]);

  useEffect(() => {
    const fetchStacks = async () => {
      try {
        const res = await api.get("/api/stacks");
        setStacks(res.data?.data || res.data || []);
      } catch (e) {
        console.error("Failed to fetch stacks", e);
      }
    };
    fetchStacks();
  }, []);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsRes = await api.get("/api/all_students");
        const students = studentsRes.data.students || studentsRes.data || [];
        setTotalStudents(students.length);
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };

    const fetchTutors = async () => {
      try {
        const tutorsRes = await api.get("/api/all_tutors");
        const tutors = tutorsRes.data.tutors || tutorsRes.data || [];
        setTotalTutors(tutors.length);
      } catch (error) {
        console.error("Failed to fetch tutors", error);
      }
    };

    const fetchLeaderboard = async () => {
      try {
        const leaderboardRes = await api.get("/api/leaderboard");
        const leaderboard = leaderboardRes.data.leaderboard || [];
        const sorted = [...leaderboard].sort(
          (a: LeaderboardUser, b: LeaderboardUser) =>
            b.overall_grade - a.overall_grade
        );
        setLeaders(sorted);
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error("Failed to fetch leaderboard", error);
        }
        setLeaders([]);
      }
    };

    const fetchAll = async () => {
      await Promise.all([fetchStudents(), fetchTutors(), fetchLeaderboard()]);
      setLoading(false);
    };

    fetchAll();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <OverviewCards
          icon={<HiOutlineUserGroup className="text-2xl" />}
          label="Total Students"
          value={formatterUtility(loading ? 0 : totalStudents)}
          iconBg="bg-purple-100"
          iconColor="text-purple"
        />

        <OverviewCards
          icon={<HiOutlineAcademicCap className="text-2xl" />}
          label="Total Tutors"
          value={formatterUtility(loading ? 0 : totalTutors)}
          iconBg="bg-purple-100"
          iconColor="text-purple"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" />
            Students Leaderboard
          </h2>
          <span className="text-xs text-gray-500">Overall Performance</span>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
          {leaders.map((user, index) => {
            const displayName =
              user.fullname && user.fullname.trim() !== ""
                ? user.fullname
                : `Student ${user.student_id}`;
            const getStackName = (userStack: string | null) => {
    if (!userStack) return "—";
    const found = stacks.find(s => s.id === userStack || s.title === userStack);
    return found?.title || userStack;
  };

            return (
              <div
                key={user.student_id}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-purple-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-sm ${
                      index === 0
                        ? "bg-yellow-500"
                        : index === 1
                        ? "bg-gray-400"
                        : index === 2
                        ? "bg-orange-400"
                        : "bg-purple"
                    }`}
                  >
                    {index < 3 ? (
                      index === 0 ? (
                        <FaMedal className="text-white" />
                      ) : (
                        index + 1
                      )
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{displayName}</p>
                    <p className="text-xs text-purple font-medium capitalize">
                      {getStackName(user.stack)}
                    </p>
                  </div>
                </div>

                <div className="flex-1 max-w-[140px] ml-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Overall</span>
                    <span className="font-semibold text-gray-700">{user.overall_grade}%</span>
                  </div>

                  <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-purple h-2 rounded-full transition-all duration-500"
                      style={{ width: `${user.overall_grade}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] mt-1 text-gray-400">
                    <span>Assign: {user.average_assignment}%</span>
                    <span>Attend: {user.attendance}%</span>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <p className="text-center py-8 text-gray-400">Loading leaderboard...</p>
          )}

          {!leaders.length && !loading && (
            <p className="text-center py-8 text-gray-400">
              No leaderboard data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;