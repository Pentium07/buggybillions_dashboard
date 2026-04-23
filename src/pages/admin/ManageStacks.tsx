import React, { useState, useEffect } from "react";
import ReusableTable from "../../utility/ReusableTable";
import Modal from "../../components/modal/Modal";
import CreateStackForm from "../../components/forms/CreateStackForm";
import type { TableColumnProps } from "../../lib/interfaces";
import { FaPlus } from "react-icons/fa6";
import api from "../../helpers/api";
import { toast } from "sonner";
import { useUser } from "../../context/UserContext";
import ConfirmDialog from "../../components/modal/ConfirmDialog";
import ActionCell from "../../utility/ActionCell";

const ManageStacks: React.FC = () => {
  const { token } = useUser();
  const [stacks, setStacks] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStack, setSelectedStack] = useState<any | null>(null);
  const [modalType, setModalType] = useState<"view" | "edit" | "delete" | null>(null);

  const itemsPerPage = 10;

  const fetchStacks = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/stacks?page=${currentPage}`, {
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
      setTotalPages(response.data.last_page || 1);
      setTotalItems(response.data.total || stacksData.length);
    } catch (err: any) {
      console.error("Error fetching stacks:", err);
      setError("Failed to load stacks. Please try again.");
      toast.error("Failed to load stacks.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    if (!token) return;
    try {
      const response = await api.get("/api/courses", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      let coursesData = [];
      if (response.data?.courses && Array.isArray(response.data.courses)) {
        coursesData = response.data.courses;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        coursesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        coursesData = response.data;
      }

      setCourses(coursesData);
    } catch (err) {
      console.warn("Unable to load course options", err);
    }
  };

  useEffect(() => {
    fetchStacks();
    fetchCourses();
  }, [token, currentPage]);

  const handleCreate = async (data: any) => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("course_id", data.courseId);
      formData.append("description", data.description);
      if (data.image) {
        formData.append("image", data.image);
      }

      await api.post("/api/stacks", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Stack created successfully!");
      setIsCreateModalOpen(false);
      fetchStacks();
    } catch (err: any) {
      console.error("Error creating stack:", err);
      toast.error(err.response?.data?.message || "Failed to create stack.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: any) => {
    setIsSubmitting(true);
    try {
      setStacks((prev) =>
        prev.map((stack) =>
          stack.id === selectedStack.id ? { ...stack, ...data } : stack
        )
      );
      toast.success("Stack updated successfully!");
      setModalType(null);
      setSelectedStack(null);
    } catch (err: any) {
      console.error("Error updating stack:", err);
      toast.error("Failed to update stack.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (stack: any) => {
    if (!stack?.id) return;
    setIsDeleting(true);
    try {
      await api.delete(`/api/stacks/${stack.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Stack deleted successfully.");
      setModalType(null);
      setSelectedStack(null);
      fetchStacks();
    } catch (err: any) {
      console.error("Error deleting stack:", err);
      toast.error(err.response?.data?.message || "Failed to delete stack.");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: TableColumnProps[] = [
    {
      title: "Stack Title",
      key: "title",
    },
    {
      title: "Courses",
      key: "courses",
      render: (item) => {
        if (!item.courses || item.courses.length === 0) return "-";
        return (
          <div className="flex flex-wrap gap-1">
            {item.courses.map((course: any) => (
              <span key={course.id} className="text-sm">
                {course.title}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      title: "Description",
      key: "description",
      render: (item) => (
        <span className="max-w-xs block truncate">
          {item.description || "—"}
        </span>
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
            setSelectedStack(item);
            setModalType("view");
          }}
          onEdit={() => {
            setSelectedStack(item);
            setModalType("edit");
          }}
          onDelete={() => {
            setSelectedStack(item);
            setModalType("delete");
          }}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">
          Manage Stacks
        </h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2.5 flex items-center gap-2 bg-purple text-white rounded-lg font-medium hover:bg-purple/90 transition-colors"
        >
          <FaPlus /> <span>Add Stack</span>
        </button>
      </div>

      <ReusableTable
        columns={columns}
        data={stacks}
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
          <CreateStackForm
            courses={courses.map((course) => ({
              id: course.id,
              title: course.title,
            }))}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      {modalType && selectedStack && modalType !== "delete" && (
        <Modal
          onClose={() => {
            setModalType(null);
            setSelectedStack(null);
          }}
        >
          <CreateStackForm
            initialData={selectedStack}
            courses={courses.map((course) => ({
              id: course.id,
              title: course.title,
            }))}
            onSubmit={handleUpdate}
            onCancel={() => {
              setModalType(null);
              setSelectedStack(null);
            }}
            readOnly={modalType === "view"}
            isLoading={isSubmitting}
          />
        </Modal>
      )}

      <ConfirmDialog
        isOpen={modalType === "delete" && selectedStack !== null}
        title="Confirm Delete"
        message={`Are you sure you want to delete stack "${selectedStack?.title || selectedStack?.id}"? This action cannot be undone.`}
        onConfirm={() => handleDelete(selectedStack)}
        onCancel={() => {
          setModalType(null);
          setSelectedStack(null);
        }}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ManageStacks;