import React from "react";
import { FaUser } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import { useFormik } from "formik";
import * as Yup from "yup";
import api from "../../helpers/api";
import { toast } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { assests } from "../../assets/assest";

/* =========================
   Types
========================= */
interface ProfileFormValues {
  bug_id: string;
  fullname: string;
  username: string;
  mobile: string;
  email: string;
}

/* =========================
   Component
========================= */
const ProfileSetUp: React.FC = () => {
  const navigate = useNavigate();

  const formik = useFormik<ProfileFormValues>({
    initialValues: {
      bug_id: "",
      fullname: "",
      username: "",
      mobile: "",
      email: "",
    },

    validationSchema: Yup.object({
      bug_id: Yup.string().required("Bug ID is required"),
      fullname: Yup.string().required("Full Name is required"),
      username: Yup.string().required("Username is required"),
      mobile: Yup.string()
        .required("Mobile is required")
        .matches(/^\d{11}$/, "Mobile number must be exactly 11 digits"),
      email: Yup.string().email("Invalid email").required("Email is required"),
    }),

    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await api.post("/api/complete-profile", values);

        if (response.status === 200) {
          toast.success("Profile setup completed!");
          navigate("/auth/login");
        }
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || error?.message || "Something went wrong"
        );
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="min-h-screen flex">
      {/* ================= FORM SECTION ================= */}
      <div className="w-1/2 flex flex-col justify-center items-center p-10 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-semibold text-black text-center mb-3">
            Complete Your Profile
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Fill in your details to continue
          </p>

          <form onSubmit={formik.handleSubmit} className="space-y-5">
            {/* Bug ID */}
            <div className="flex items-center gap-2 h-12.5 px-4 rounded-lg bg-gray-200">
              <FaUser />
              <input
                type="text"
                name="bug_id"
                placeholder="Bug ID"
                className="w-full h-full outline-0 border-0 bg-transparent"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.bug_id}
              />
            </div>

            {/* Full Name */}
            <div className="flex items-center gap-2 h-12.5 px-4 rounded-lg bg-gray-200">
              <FaUser />
              <input
                type="text"
                name="fullname"
                placeholder="Full Name"
                className="w-full h-full outline-0 border-0 bg-transparent"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.fullname}
              />
            </div>

            {/* Username */}
            <div className="flex items-center gap-2 h-12.5 px-4 rounded-lg bg-gray-200">
              <FaUser />
              <input
                type="text"
                name="username"
                placeholder="Username"
                className="w-full h-full outline-0 border-0 bg-transparent"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.username}
              />
            </div>

            {/* Mobile */}
            <div className="flex items-center gap-2 h-12.5 px-4 rounded-lg bg-gray-200">
              <FiPhone />
              <input
                type="tel"
                name="mobile"
                inputMode="numeric"
                maxLength={11}
                placeholder="Mobile"
                className="w-full h-full outline-0 border-0 bg-transparent"
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 11);
                  formik.setFieldValue("mobile", value);
                }}
                onBlur={formik.handleBlur}
                value={formik.values.mobile}
              />
            </div>
            {formik.touched.mobile && formik.errors.mobile && (
              <p className="text-xs text-red-500 -mt-3">{formik.errors.mobile}</p>
            )}

            {/* Email */}
            <div className="flex items-center gap-2 h-12.5 px-4 rounded-lg bg-gray-200">
              <MdEmail />
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full h-full outline-0 border-0 bg-transparent"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.email}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid}
              className="w-full bg-purple text-white h-11.25 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {formik.isSubmitting ? "Submitting..." : "Complete Profile"}
            </button>

            {/* Links */}
            <div className="text-sm text-center mt-4 text-gray-600 flex flex-col gap-2">
              <Link to="/" className="text-black">
                Login
              </Link>

              {/* <div className="flex justify-center gap-1">
                <p className="text-black">Already completed?</p>
                <Link to="/student/overview" className="text-red-500 font-semibold">
                  Go to Dashboard
                </Link>
              </div> */}
            </div>
          </form>
        </div>
      </div>

      {/* ================= IMAGE SECTION ================= */}
      <div
        className="w-1/2 hidden md:flex relative items-center justify-center"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(121, 111, 171, 0.9), rgba(121, 111, 171, 0.9)), url('./lap.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Text */}
        <div className="flex flex-col items-start">
          <h1 className="text-4xl font-bold text-white">Almost There!</h1>
          <h2 className="text-yellow-400 text-5xl font-bold">
            Set Up Your Profile
          </h2>
        </div>

        {/* Logo */}
        <img
          src={assests.logo}
          alt="Logo"
          className="w-40 absolute top-6 right-6"
        />
      </div>
    </div>
  );
};

export default ProfileSetUp;
