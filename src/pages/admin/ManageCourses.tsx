import React, { useState, useEffect } from "react";
import ReusableTable from "../../utility/ReusableTable";
import Modal from "../../components/modal/Modal";
import CreateCourseForm from "../../components/forms/CreateCourseForm";
import type { TableColumnProps } from "../../lib/interfaces";
import { FaPlus } from "react-icons/fa6";
import api from "../../helpers/api";
import { toast } from "sonner";
import { useUser } from "../../context/UserContext";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionCell from "../../utility/ActionCell";

const ManageCourses: React.FC = () => {
  const { token } = useUser();
  const [courses, setCourses] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"view" | "edit" | "delete" | null>(null);

  const itemsPerPage = 10;

  const fetchCourses = async () => {
    if (!token) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/courses?page=${currentPage}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Handle different API response structures
      let coursesData = [];
      
      if (response.data?.courses && Array.isArray(response.data.courses)) {
        coursesData = response.data.courses;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        coursesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        coursesData = response.data;
      }

      setCourses(coursesData);
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || coursesData.length);
    } catch (err: any) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again.");
      toast.error("Failed to load courses.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [token, currentPage]);

  const handleCreate = async (data: any) => {
    if (!token) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("price", data.price?.toString() || "");
      formData.append("language", data.language);
      formData.append("long_description", data.description);
      if (data.image) {
        formData.append("cover_image", data.image);
      }

      await api.post("/api/courses", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Course created successfully!");
      setIsCreateModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      console.error("Error creating course:", err);
      toast.error(err.response?.data?.message || "Failed to create course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    if (!token || !selectedCourse) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      formData.append("title", data.title);
      formData.append("price", data.price?.toString() || "");
      formData.append("language", data.language);
      formData.append("long_description", data.description);
      if (data.image) {
        formData.append("cover_image", data.image);
      }

      await api.post(`/api/courses/${selectedCourse.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Course updated successfully!");
      setModalType(null);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err: any) {
      console.error("Error updating course:", err);
      toast.error(err.response?.data?.message || "Failed to update course.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (course: any) => {
    if (!token || !course?.id) return;

    setIsDeleting(true);
    try {
      await api.delete(`/api/courses/${course.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Course deleted successfully.");
      setModalType(null);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err: any) {
      console.error("Error deleting course:", err);
      toast.error(err.response?.data?.message || "Failed to delete course.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumnProps[] = [
    {
      title: "Course Title",
      key: "title",
    },
    {
      title: "Price",
      key: "price",
      render: (item) => item.price ? `¥${item.price}` : "-",
    },
    {
      title: "Language",
      key: "language",
    },
    {
      title: "Description",
      key: "description",
      className: "p-3 text-sm text-black font-medium",
      render: (item) => (
        <span title={item.long_description || item.description} className="max-w-xs block truncate text-left">{item.long_description || item.description || "—"}</span>
      ),
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
            setSelectedCourse(item);
            setModalType("view");
          }}
          onEdit={() => {
            setSelectedCourse(item);
            setModalType("edit");
          }}
          onDelete={() => {
            setSelectedCourse(item);
            setModalType("delete");
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">Manage Courses</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 flex items-center gap-2 bg-purple text-white rounded-lg font-medium hover:bg-purple/90 transition-colors"
        >
          <FaPlus /> <span>Add Course</span>
        </button>
      </div>

      <ReusableTable
        columns={columns}
        data={courses}
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
          <CreateCourseForm
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {modalType && selectedCourse && modalType !== "delete" && (
        <Modal
          onClose={() => {
            setModalType(null);
            setSelectedCourse(null);
          }}
        >
          <CreateCourseForm
            initialData={selectedCourse}
            onSubmit={handleUpdate}
            onCancel={() => {
              setModalType(null);
              setSelectedCourse(null);
            }}
            readOnly={modalType === "view"}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={modalType === "delete" && selectedCourse !== null}
        title="Confirm Delete"
        message={`Are you sure you want to delete course "${selectedCourse?.title || selectedCourse?.id}"? This action cannot be undone.`}
        onConfirm={() => handleDelete(selectedCourse)}
        onCancel={() => {
          setModalType(null);
          setSelectedCourse(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageCourses;
