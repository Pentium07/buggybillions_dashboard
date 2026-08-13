import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

interface CreateCourseFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

const LANGUAGES = ["English", "Spanish", "French", "German", "Portuguese", "Chinese"];

const CreateCourseForm: React.FC<CreateCourseFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false,
  isLoading = false,
}) => {
  const isEdit = !!initialData;
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (initialData?.image || initialData?.cover_image_url) {
      setPreview(initialData.cover_image_url || initialData.image);
    }
  }, [initialData]);

  const formik = useFormik({
    initialValues: {
      title: initialData?.title || "",
      price: initialData?.price?.toString() || "",
      language: initialData?.language || "",
      description:
        initialData?.long_description || initialData?.description || "",
      image: null as File | null,
    },
    validationSchema: Yup.object({
      title: Yup.string().required("Course title is required"),
      price: Yup.string()
        .required("Price is required")
        .test("non-negative", "Price must be 0 or more", (value) => {
          const num = Number(value);
          return !isNaN(num) && num >= 0;
        }),
      language: Yup.string().required("Language is required"),
      description: Yup.string().required("Description is required"),
    }),
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    formik.setFieldValue(name, value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    formik.setFieldValue("image", file);
    setPreview(URL.createObjectURL(file));
  };

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
            ? "Course Details"
            : isEdit
            ? "Edit Course"
            : "Add New Course"}
        </h2>
        <p className="text-sm text-gray-500">
          Provide the course information and upload a cover image.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Course Title</label>
          <input
            type="text"
            name="title"
            value={formik.values.title}
            onChange={handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
            placeholder="Enter course title"
          />
          {getError("title") && <p className={errorClass}>{getError("title")}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            name="price"
            value={formik.values.price}
            onChange={handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            min="0"
            step="0.01"
            className={inputClass}
            placeholder="Enter price"
          />
          {getError("price") && <p className={errorClass}>{getError("price")}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Language</label>
          <select
            name="language"
            value={formik.values.language}
            onChange={handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
          >
            <option value="">Select language</option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>
          {getError("language") && (
            <p className={errorClass}>{getError("language")}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Course Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={readOnly || isLoading}
            className="text-sm text-gray-600"
          />
          {preview && (
            <img
              src={preview}
              alt="Course preview"
              className="max-h-40 w-full object-cover rounded-lg border border-black/10"
            />
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formik.values.description}
          onChange={handleChange}
          onBlur={formik.handleBlur}
          disabled={readOnly || isLoading}
          required
          rows={5}
          className="indent-2 border border-black/15 rounded-lg outline-0 disabled:bg-gray-100 w-full"
          placeholder="Enter course description"
        />
        {getError("description") && (
          <p className={errorClass}>{getError("description")}</p>
        )}
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
            className="px-4 py-2 text-sm font-medium text-white bg-purple rounded-md disabled:opacity-70 flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update Course"
            ) : (
              "Create Course"
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateCourseForm;
