import React, { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import OverviewCards from "../../components/cards/OverviewCards";
import { HiOutlineIdentification } from "react-icons/hi";
import { PiBookOpenUserFill, PiArrowFatLineUp, PiBellRinging } from "react-icons/pi";
import api from "../../helpers/api";

interface Activity {
  title: string;
  description: string;
  time: string;
}

interface Stack {
  id: string;
  title: string;
}

const StudentOverview: React.FC = () => {
  const { user, loading: userLoading } = useUser();
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [gradedCount, setGradedCount] = useState<number>(0);
  const [stacks, setStacks] = useState<Stack[]>([]);

  const fetchStacks = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await api.get("/api/stacks", {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      let stacksData = [];
      if (response.data?.stacks && Array.isArray(response.data.stacks)) {
        stacksData = response.data.stacks;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        stacksData = response.data.data;
      } else if (Array.isArray(response.data)) {
        stacksData = response.data;
      }

      setStacks(stacksData);
    } catch (error) {
      console.error("Failed to fetch stacks", error);
    }
  };

  useEffect(() => {
    fetchStacks();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    const fetchActivities = async () => {
      try {
        setActivitiesLoading(true);

        const resAssignments = await api.get(`/api/users/${user.id}/assignments`);
        const assignments = resAssignments.data.assignments || [];

        const graded = assignments.filter((a: any) => a.status === "graded");
        setGradedCount(graded.length);

        const formattedAssignments: Activity[] = assignments.map((item: any) => ({
          title: "Assignment Activity",
          description: item.assignment_name || item.title || "Assignment update",
          time: item.created_at
            ? new Date(item.created_at).toLocaleDateString()
            : "Just now",
        }));

        let formattedCurriculum: Activity[] = [];

        try {
          const resCurriculum = await api.get(`/api/users/${user.id}/curriculum`);
          const curriculum = resCurriculum.data.curriculum || [];

          formattedCurriculum = curriculum.map((item: any) => ({
            title: "Curriculum Update",
            description: item.topic || "New lesson added",
            time: item.created_at
              ? new Date(item.created_at).toLocaleDateString()
              : "Just now",
          }));
        } catch (err) {
          console.log("Curriculum not available");
        }

        const mergedActivities = [...formattedAssignments, ...formattedCurriculum].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        setRecentActivities(mergedActivities);
      } catch (error) {
        console.error("Failed to fetch activities", error);
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [user?.id]);

  if (userLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

  const getStackName = () => {
    const userStack = user?.stack;
    if (!userStack) return "—";
    const found = stacks.find((s: any) => s.id === userStack || s.title === userStack);
    return found?.title || userStack;
  };
  
  const userStackName = getStackName();

  const activitiesToRender =
    recentActivities.length > 0
      ? recentActivities
      : [
          {
            title: "No recent activity",
            description: "You have no assignments or curriculum updates yet",
            time: "",
          },
        ];

  const announcements = [
    {
      date: "Today",
      type: "Important",
      title: "Project Submission Reminder",
      description: "This is to remind you all to submit your project on or before 12am on Friday",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <OverviewCards
          icon={<HiOutlineIdentification className="text-2xl" />}
          label="Student ID"
          value={user?.bug_id?.toString() || "N/A"}
          iconBg="bg-purple-100"
          iconColor="text-purple"
        />
        <OverviewCards
          icon={<PiBookOpenUserFill className="text-2xl" />}
          label="Stack"
          value={userStackName}
          iconBg="bg-purple-100"
          iconColor="text-purple"
        />
        <OverviewCards
          icon={<PiArrowFatLineUp className="text-2xl" />}
          label="Graded Assignments"
          value={gradedCount.toString()}
          iconBg="bg-purple-100"
          iconColor="text-purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activities</h3>

          {activitiesLoading ? (
            <p className="text-gray-500">Loading activities...</p>
          ) : (
            <div className="space-y-3">
              {activitiesToRender.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-purple-50/50 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{activity.description}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <PiBellRinging className="text-purple text-xl" />
            <h3 className="text-lg font-bold text-gray-900">Announcements</h3>
          </div>
          <div className="space-y-3">
            {announcements.map((ann, index) => (
              <div
                key={index}
                className="p-4 rounded-xl border-l-4 border-purple bg-purple-50"
              >
                <p className="text-xs text-gray-500">
                  {ann.date} • {ann.type}
                </p>
                <h4 className="font-semibold text-gray-900 mt-1">{ann.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{ann.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentOverview;