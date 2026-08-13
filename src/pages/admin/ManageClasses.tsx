import React, { useState, useEffect } from "react";
import ReusableTable from "../../utility/ReusableTable";
import Modal from "../../components/modal/Modal";
import CreateClassForm from "../../components/forms/CreateClassForm";
import type { TableColumnProps } from "../../lib/interfaces";
import { FaPlus } from "react-icons/fa6";
import api from "../../helpers/api";
import { toast } from "sonner";
import { useUser } from "../../context/UserContext";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionCell from "../../utility/ActionCell";

const ManageClasses: React.FC = () => {
  const { token } = useUser();
  const [classes, setClasses] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"view" | "edit" | "delete" | null>(null);

  const itemsPerPage = 10;

  const fetchClasses = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/classes?page=${currentPage}`, {
        headers: { Authorization: `Bearer ${token}` },
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
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || classesData.length);
    } catch (err: any) {
      console.error("Error fetching classes:", err);
      setError("Failed to load classes.");
      toast.error("Failed to load classes.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!token) return;
    try {
      const response = await api.get("/api/courses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourses(response.data.courses || response.data.data || response.data || []);
    } catch (err) {
      console.warn("Unable to load courses", err);
    }
  };

  const fetchTutors = async () => {
    if (!token) return;
    try {
      const response = await api.get("/api/all_tutors", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTutors(response.data.tutors || response.data.data || response.data || []);
    } catch (err) {
      console.warn("Unable to load tutors", err);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchCourses();
    fetchTutors();
  }, [token, currentPage]);

  const handleCreate = async (data: any) => {
    setIsSubmitting(true);
    try {
      await api.post("/api/classes", data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Class created successfully!");
      setIsCreateModalOpen(false);
      fetchClasses();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      setClasses((prev) =>
        prev.map((c) => (c.id === selectedClass.id ? { ...c, ...data } : c))
      );
      toast.success("Class updated successfully!");
      setModalType(null);
      setSelectedClass(null);
    } catch (err) {
      toast.error("Failed to update class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (cls: any) => {
    setIsDeleting(true);
    try {
      await api.delete(`/api/classes/${cls.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Class deleted successfully.");
      setModalType(null);
      setSelectedClass(null);
      fetchClasses();
    } catch (err) {
      toast.error("Failed to delete class.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumnProps[] = [
    {
      title: "Class Name",
      key: "name",
    },
    {
      title: "Course",
      key: "course",
      render: (item) => item.course?.title || item.course_name || "—",
    },
    {
      title: "Description",
      key: "description",
      render: (item) => item.description || "—",
    },
    {
      title: "Created At",
      key: "created_at",
      render: (item) => item.created_at ? new Date(item.created_at).toLocaleDateString() : "—",
    },
    {
      title: "Action",
      key: "action",
      render: (item) => (
        <ActionCell
          rowId={item.id}
          onView={() => { setSelectedClass(item); setModalType("view"); }}
          onEdit={() => { setSelectedClass(item); setModalType("edit"); }}
          onDelete={() => { setSelectedClass(item); setModalType("delete"); }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Manage Classes</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 flex items-center gap-2 bg-purple text-white rounded-lg font-medium hover:bg-purple/90 transition-colors"
        >
          <FaPlus /> <span>Add Class</span>
        </button>
      </div>

      <ReusableTable
        columns={columns}
        data={classes}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        setCurrentPage={setCurrentPage}
      />

      {isCreateModalOpen && (
        <Modal onClose={() => setIsCreateModalOpen(false)}>
          <CreateClassForm
            courses={courses.map((c) => ({ id: c.id, title: c.title }))}
            tutors={tutors.map((t) => ({ id: t.id, fullname: t.fullname }))}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {modalType && selectedClass && modalType !== "delete" && (
        <Modal onClose={() => { setModalType(null); setSelectedClass(null); }}>
          <CreateClassForm
            initialData={selectedClass}
            courses={courses.map((c) => ({ id: c.id, title: c.title }))}
            tutors={tutors.map((t) => ({ id: t.id, fullname: t.fullname }))}
            onSubmit={handleUpdate}
            onCancel={() => { setModalType(null); setSelectedClass(null); }}
            readOnly={modalType === "view"}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={modalType === "delete" && selectedClass !== null}
        title="Delete Class"
        message={`Are you sure you want to delete "${selectedClass?.name}"?`}
        onConfirm={() => handleDelete(selectedClass)}
        onCancel={() => { setModalType(null); setSelectedClass(null); }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageClasses;