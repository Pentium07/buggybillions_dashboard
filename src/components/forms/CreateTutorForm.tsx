import React, { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../helpers/api";

interface CreateTutorFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  readOnly?: boolean;
  isLoading?: boolean;
}

const CreateTutorForm: React.FC<CreateTutorFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  readOnly = false,
  isLoading = false,
}) => {
  const isEdit = !!initialData;

  const [stacks, setStacks] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loadingStacks, setLoadingStacks] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    fetchStacks();
    fetchClasses();
  }, []);

  const fetchStacks = async () => {
    setLoadingStacks(true);
    try {
      const response = await api.get("/api/stacks");
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
      console.error("Error fetching stacks:", error);
    } finally {
      setLoadingStacks(false);
    }
  };

  const fetchClasses = async () => {
    setLoadingClasses(true);
    try {
      const response = await api.get("/api/classes");
      let classesData = [];
      if (response.data?.classes && Array.isArray(response.data.classes)) {
        classesData = response.data.classes;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        classesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        classesData = response.data;
      }
      setClasses(classesData);
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoadingClasses(false);
    }
  };

  const formik = useFormik({
    initialValues: {
      fullname: initialData?.fullname || "",
      username: initialData?.username || "",
      email: initialData?.email || "",
      mobile: initialData?.mobile || "",
      password: "",
      department: initialData?.department || "",
      stack: initialData?.stack || initialData?.stack_id || "",
      class: initialData?.class || initialData?.class_id || "",
    },
    validationSchema: Yup.object({
      fullname: Yup.string().required("Full Name is required"),
      username: Yup.string().required("Username is required"),
      email: Yup.string()
        .email("Invalid email address")
        .required("Email is required"),
      mobile: Yup.string()
        .required("Mobile number is required")
        .matches(/^\d{11}$/, "Mobile number must be exactly 11 digits"),
      password: isEdit
        ? Yup.string()
        : Yup.string().required("Password is required"),
      department: Yup.string().required("Department is required"),
      stack: Yup.string().required("Stack is required"),
      class: Yup.string(),
    }),
    onSubmit: (values) => {
      onSubmit({
        ...values,
        class: values.class || undefined,
        role: "tutor",
      });
    },
  });

  const handleMobileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11);
    formik.setFieldValue("mobile", value);
  };

  const getError = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field]
      ? String(formik.errors[field])
      : "";

  const inputClass =
    "h-11.25 indent-2 border border-black/15 rounded-lg outline-0 disabled:bg-gray-100 w-full";
  const errorClass = "text-xs text-red-500 mt-1";

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-4 text-tetiary">
          {readOnly
            ? "Tutor Details"
            : isEdit
            ? "Edit Tutor"
            : "Add New Tutor"}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formik.values.fullname}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
            placeholder="Enter Full Name"
          />
          {getError("fullname") && (
            <p className={errorClass}>{getError("fullname")}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
            placeholder="Enter Username"
          />
          {getError("username") && (
            <p className={errorClass}>{getError("username")}</p>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Mobile (11 digits)</label>
          <input
            type="tel"
            name="mobile"
            inputMode="numeric"
            maxLength={11}
            value={formik.values.mobile}
            onChange={handleMobileChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
            placeholder="Enter 11-digit mobile number"
          />
          {getError("mobile") && <p className={errorClass}>{getError("mobile")}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
            placeholder="Enter Email Address"
          />
          {getError("email") && <p className={errorClass}>{getError("email")}</p>}
        </div>

        {!readOnly && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={isLoading}
              required={!isEdit}
              className={inputClass}
              placeholder={isEdit ? "Leave blank to keep current" : "Enter Password"}
            />
            {getError("password") && (
              <p className={errorClass}>{getError("password")}</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Stack</label>
          <select
            name="stack"
            value={formik.values.stack}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading || loadingStacks}
            required
            className={inputClass}
          >
            <option value="">
              {loadingStacks ? "Loading stacks..." : "Select Stack"}
            </option>
            {stacks.map((stack) => (
              <option key={stack.id} value={stack.id}>
                {stack.title}
              </option>
            ))}
          </select>
          {getError("stack") && <p className={errorClass}>{getError("stack")}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Class</label>
          <select
            name="class"
            value={formik.values.class}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading || loadingClasses}
            className={inputClass}
          >
            <option value="">
              {loadingClasses ? "Loading classes..." : "Select Class (Optional)"}
            </option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name || cls.title || `Class ${cls.id}`}
              </option>
            ))}
          </select>
          {getError("class") && <p className={errorClass}>{getError("class")}</p>}
        </div>

        <div className="flex flex-col gap-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Department</label>
          <input
            type="text"
            name="department"
            value={formik.values.department}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={readOnly || isLoading}
            required
            className={inputClass}
            placeholder="Enter Department (e.g., Software, Design, etc.)"
          />
          {getError("department") && (
            <p className={errorClass}>{getError("department")}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
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
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isEdit ? "Updating..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Update"
            ) : (
              "Create"
            )}
          </button>
        )}
      </div>
    </form>
  );
};

export default CreateTutorForm;
