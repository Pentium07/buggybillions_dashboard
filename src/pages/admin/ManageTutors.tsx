import React, { useState, useEffect } from "react";
import ReusableTable from "../../utility/ReusableTable";
import Modal from "../../components/modal/Modal";
import CreateTutorForm from "../../components/forms/CreateTutorForm";
import type { TableColumnProps } from "../../lib/interfaces";
import { FaPlus } from "react-icons/fa6";
import api from "../../helpers/api";
import { toast } from "sonner";
import { useUser } from "../../context/UserContext";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionCell from "../../utility/ActionCell";

const ManageTutors: React.FC = () => {
  const { token } = useUser();
  const [tutors, setTutors] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTutor, setSelectedTutor] = useState<any | null>(null);
  const [stacks, setStacks] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [modalType, setModalType] = useState<
    "view" | "edit" | "delete" | null
  >(null);

  const itemsPerPage = 10;

  const fetchTutors = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`api/all_tutors?page=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTutors(response.data.tutors || []);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || 0);
    } catch (err: any) {
      console.error("Error fetching tutors:", err);
      setError("Failed to load tutors. Please try again.");
      toast.error("Failed to load tutors.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStacks = async () => {
    if (!token) return;
    try {
      const response = await api.get("/api/stacks", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
    } catch (err: any) {
      console.warn("Unable to load stacks:", err);
    }
  };

  const fetchClasses = async () => {
    if (!token) return;
    try {
      const response = await api.get("/api/classes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let classesData = [];
      if (response.data?.classes && Array.isArray(response.data.classes)) {
        classesData = response.data.classes;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        classesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        classesData = response.data;
      }

      setClasses(classesData);
    } catch (err: any) {
      console.warn("Unable to load classes:", err);
    }
  };

  useEffect(() => {
    fetchTutors();
    fetchStacks();
    fetchClasses();
  }, [token, currentPage]);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post("/api/create_users", data, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      toast.success("Tutor created successfully!");
      setIsCreateModalOpen(false);
      fetchTutors();
    } catch (err: any) {
      console.error("Error creating tutor:", err);
      toast.error(err.response?.data?.message || "Failed to create tutor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Placeholder for Update API call
      console.log("Update Data:", data);
      setTutors((prev) =>
        prev.map((t) => (t.id === selectedTutor.id ? { ...t, ...data } : t)),
      );
      toast.success("Tutor updated successfully (Demo)");
      setModalType(null);
      setSelectedTutor(null);
    } catch (err: any) {
      console.error("Error updating tutor:", err);
      toast.error("Failed to update tutor.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (data: any) => {
    setIsDeleting(true);
    try {
      const response = await api.delete(`/api/users/${data.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        setTutors((prev) => prev.filter((t) => t.id !== data.id));

        toast.success("Tutor deleted successfully.");
        setModalType(null);
        setSelectedTutor(null);
      }
    } catch (err: any) {
      console.error("Error deleting tutor:", err);
      toast.error("Failed to delete tutor.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumnProps[] = [
    {
      title: "Full Name",
      key: "fullname",
      render: (item) => <span className="capitalize">{item.fullname}</span>,
    },
    {
      title: "Username",
      key: "username",
    },
    {
      title: "Bug ID",
      key: "bug_id",
      render: (item) => <span className="uppercase">{item.bug_id}</span>,
    },
    {
      title: "Class",
      key: "class",
      render: (item) => {
        const cls = classes.find((c) => c.id === item.class || c.id === item.class_id);
        return (
          <span className="capitalize">
            {cls?.name || cls?.title || item.tutor_class?.name || item.class?.name || item.tutor_class_name || item.class_name || "N/A"}
          </span>
        );
      },
    },
    {
      title: "Stack",
      key: "stack",
      render: (item) => {
        const stack = stacks.find((s) => s.id === item.stack || s.title === item.stack);
        return <span className="capitalize">{stack?.title || item.stack || "N/A"}</span>;
      },
    },
    {
      title: "Department",
      key: "department",
    },
    {
      title: "Created At",
      key: "created_at",
      render: (item) => {
        if (!item.created_at) return "-";
        return new Date(item.created_at).toLocaleDateString();
      },
    },
{
      title: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={() => {
            setSelectedTutor(item);
            setModalType("view");
          }}
          onEdit={() => {
            setSelectedTutor(item);
            setModalType("edit");
          }}
          onDelete={() => {
            setSelectedTutor(item);
            setModalType("delete");
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Manage Tutors</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 flex items-center gap-2 bg-purple text-white rounded-lg font-medium hover:bg-purple/90 transition-colors"
        >
          <FaPlus /> <span>Add Tutor</span>
        </button>
      </div>

      <ReusableTable
        columns={columns}
        data={tutors}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
      />

      {/* Create Modal */}
      {isCreateModalOpen && (
        <Modal onClose={() => setIsCreateModalOpen(false)}>
          <CreateTutorForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {/* View/Edit/Upgrade Modal */}
      {(modalType === "edit" || modalType === "view") && selectedTutor && (
        <Modal
          onClose={() => {
            setModalType(null);
            setSelectedTutor(null);
          }}
        >
          <CreateTutorForm
            initialData={selectedTutor}
            onSubmit={handleUpdate}
            onCancel={() => {
              setModalType(null);
              setSelectedTutor(null);
            }}
            readOnly={modalType === "view"}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={modalType === "delete" && selectedTutor !== null}
        title="Confirm Delete"
        message={`Are you sure you want to delete tutor "${selectedTutor?.fullname || selectedTutor?.bug_id}"? This action cannot be undone.`}
        onConfirm={() => handleDelete(selectedTutor)}
        onCancel={() => {
          setModalType(null);
          setSelectedTutor(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageTutors;
