import React from "react";
import { FaBell } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { MdEditCalendar } from "react-icons/md";
import Duesoon from "./Components/Duesoon";
import Alltask from "./Components/Alltask";
import Submitted from "./Components/Submitted";
import Modal from "../../components/modal/Modal";
import StudentAssignmentForm from "../../components/forms/StudentAssignmentForm";
import Graded from "./Components/Graded";
import { FaStar } from "react-icons/fa";
import { GrFormCheckmark } from "react-icons/gr";
import { CgSandClock } from "react-icons/cg";
import { MdArrowRightAlt } from "react-icons/md";
import { toast } from "sonner";
import api from "../../helpers/api";
import { useUser } from "../../context/UserContext";

interface Assignment {
  id: string | number;
  assignment_name: string;
  assignment_description: string;
  status: string;
  created_at: string;
}

function StudentAssignments() {
  const [activeTab, setActiveTab] = React.useState("allTask");
  const [modal, setModal] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState(false);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [search, setSearch] = React.useState("");
  const { user } = useUser();

  const fetchAssignment = async () => {
    const token = localStorage.getItem("token");
    if (!token || !user?.id) {
      toast.error("Please log in to view assignments");
      return;
    }

    setLoading(true);

    try {
      const response = await api.get(`/api/users/${user.id}/assignments`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 200 || response.status === 201) {
        const data = response.data.assignments || [];
        console.log("Fetched assignments:", data);
        console.log(
          "Statuses found:",
          data.map((a: Assignment) => a.status?.toLowerCase())
        );
        setAssignments(data);
      }
    } catch (error: any) {
      const errMessage = error.response?.data?.message || error.message;
      toast.error(errMessage || "Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fetchAssignment();
    }
  }, [user?.id]);

  // ────────────────────────────────────────────────
  // Status normalization (case & space insensitive)
  // ────────────────────────────────────────────────
  const normalizeStatus = (status: string | undefined) =>
    status?.toLowerCase().trim() || "unknown";

  // Counts
  const pendingCount = assignments.filter(
    (a) => normalizeStatus(a.status) === "pending"
  ).length;

  const gradedCount = assignments.filter(
    (a) => normalizeStatus(a.status) === "graded"
  ).length;

  // Submitted card now shows the SAME number as graded
  const submittedCount = gradedCount;

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.assignment_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      assignment.assignment_description
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <CgSandClock className="text-yellow-600 text-xl" />
            </span>
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              Pending
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            {loading ? "..." : pendingCount}
          </h2>
          <p className="text-sm text-gray-500">Awaiting Grading</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
              <GrFormCheckmark className="text-purple text-xl" />
            </span>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
              Progress
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            {loading ? "..." : submittedCount}
          </h2>
          <p className="text-sm text-gray-500">Submitted</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <FaStar className="text-green-600 text-xl" />
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              Score
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mt-3">
            {loading ? "..." : `${gradedCount}%`}
          </h2>
          <p className="text-sm text-gray-500">Average Grade</p>
        </div>
      </div>

      {/* ────────────────────────────────────────────────
          The rest remains unchanged (header, tabs, content)
      ──────────────────────────────────────────────── */}

      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Assignments</h1>
          {/* <div className="flex flex-wrap gap-4 items-center mt-4">
            <p className="text-sm text-purple py-2 px-4 bg-white shadow rounded-2xl border">
              Semester 1
            </p>
            <div className="flex shadow-md rounded-2xl p-2 items-center gap-2 bg-white">
              <MdEditCalendar color="#E5AA2D" size={24} />
              <p className="text-sm font-medium">
                {loading ? "..." : `${pendingCount} Awaiting Grading`}
              </p>
            </div>
          </div> */}
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setModal(true)}
            className="bg-purple hover:bg-purple-700 text-white py-2.5 px-5 rounded-lg transition font-medium"
          >
            Submit Assignment
          </button>

          {modal && (
            <Modal onClose={() => setModal(false)}>
              <StudentAssignmentForm onClose={() => setModal(false)} onSuccess={fetchAssignment} />
            </Modal>
          )}

          <div className="relative flex items-center flex-1 md:flex-none">
            <IoIosSearch className="absolute left-3 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search assignments..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            />
          </div>

          {/* <button className="p-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 transition">
            <FaBell className="h-5 w-5 text-gray-700" />
          </button> */}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex gap-1.5 bg-white shadow rounded-full p-1.5 border">
          {["allTask", "graded", "submitted"].map((tab) => (
            <button
              key={tab}
              className={`px-5 py-2 rounded-full text-sm font-medium transition ${
                activeTab === tab
                  ? "bg-purple text-white shadow-sm"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === "allTask"
                ? "All"
                : tab === "submitted"
                ? "Under Review"          // ← changed label for clarity
                : "Graded"}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600 whitespace-nowrap">Sort by:</p>
          <select className="px-4 py-2 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple">
            <option>Submitted Date</option>
            <option>Graded</option>
            <option>Due Date (Soonest)</option>
          </select>
        </div>
      </div>

      {activeTab === "allTask" && (
        <Alltask assignments={assignments} loading={loading} />
      )}
      {activeTab === "submitted" && (
        <Graded
          assignments={assignments.filter(
            (a) => normalizeStatus(a.status) === "submitted"
          )}
          loading={loading}
        />
      )}
      {activeTab === "graded" && (
        <Graded
          assignments={assignments.filter(
            (a) => normalizeStatus(a.status) === "graded"
          )}
          loading={loading}
        />
      )}
    </div>
  );
}

export default StudentAssignments;