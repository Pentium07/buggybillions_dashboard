import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface CreateClassFormProps {
  initialData?: any;
  courses?: { id: string; title: string }[];
  tutors?: { id: string; fullname: string }[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

const CreateClassForm: React.FC<CreateClassFormProps> = ({
  initialData,
  courses = [],
  tutors = [],
  onSubmit,
  onCancel,
  readOnly = false,
  isLoading = false,
}) => {
  const isEdit = !!initialData;

  const formik = useFormik({
    initialValues: {
      name: initialData?.name || "",
      courseId: initialData?.course_id || initialData?.courseId || "",
      tutorId: initialData?.tutor_id || initialData?.tutorId || "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Class name is required"),
      courseId: Yup.string().required("Course is required"),
      tutorId: Yup.string().required("Tutor is required"),
    }),
    onSubmit: (values) => {
      onSubmit({
        name: values.name,
        course_id: values.courseId,
        tutor_id: values.tutorId,
      });
    },
  });

  const getError = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field]
      ? String(formik.errors[field])
      : "";

  const inputClass =
    "h-11.25 indent-2 border border-black/15 rounded-lg outline-0 disabled:bg-gray-100 w-full";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-tetiary">
          {readOnly
            ? "Class Details"
            : isEdit
            ? "Edit Class"
            : "Add New Class"}
        </h2>
        <p className="text-sm text-gray-500">
          Create a class with a name, course, and tutor assignment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Class Name</label>
          <input
            type="text"
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
            placeholder="Enter class name"
          />
          {getError("name") && <p className={errorClass}>{getError("name")}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Course</label>
          <select
            name="courseId"
            value={formik.values.courseId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
          >
            <option value="">Select a course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          {getError("courseId") && (
            <p className={errorClass}>{getError("courseId")}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Tutor</label>
          <select
            name="tutorId"
            value={formik.values.tutorId}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
          >
            <option value="">Select a tutor</option>
            {tutors.map((tutor) => (
              <option key={tutor.id} value={tutor.id}>
                {tutor.fullname}
              </option>
            ))}
          </select>
          {getError("tutorId") && (
            <p className={errorClass}>{getError("tutorId")}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
        >
          {readOnly ? "Close" : "Cancel"}
        </button>
        {!readOnly && (
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple rounded-md disabled:opacity-70"
          >
            {isLoading
              ? isEdit
                ? "Updating..."
                : "Creating..."
              : isEdit
              ? "Update Class"
              : "Create Class"}
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateClassForm;
