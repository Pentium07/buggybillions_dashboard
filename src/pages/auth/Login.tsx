import React, { useState } from "react";
import { FaUser, FaEye, FaEyeSlash } from "react-icons/fa";
import { MdLock } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { LoginValidationSchema } from "../../lib/validationschemas";
import api from "../../helpers/api";
import { useUser } from "../../context/UserContext";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { assests } from "../../assets/assest";

const Login: React.FC = () => {
  const { login } = useUser();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      bug_id: "",
      password: "",
    },
    validationSchema: LoginValidationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const response = await api.post("api/login", values);

        if (response.status === 200) {
          const { role, token } = response.data;
          login(token, role);
          navigate(
            role === "admin"
              ? "/admin/overview"
              : role === "tutor"
                ? "/tutor/weekly-lessons"
                : "/student/overview"
          );
        }
      } catch (error: any) {
        if (error.status === 400) {
          toast.error("Your account is not setup yet. Please complete your account setup.");
          navigate("/auth/profilesetup");
          return;
        }
        toast.error(error.data?.response?.message || error?.message);
      } finally {
        setLoading(false);
      }
    }
  });

  return (
    <div className="min-h-screen flex">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 bg-purple"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="relative z-10 text-center"
        >
          <img src={assests.logo} alt="BuggyBillions" className="h-32 mb-4" />
          <p className="text-white/80 text-xl max-w-md">
            Sign in to continue your learning journey
          </p>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-gray-50"
      >
        <div className="w-full max-w-md">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-500">Enter your credentials to access your account</p>
          </motion.div>

          <motion.form
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            onSubmit={formik.handleSubmit}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bug ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Enter your Bug ID"
                  name="bug_id"
                  id="bug_id"
                  value={formik.values.bug_id}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
              {formik.touched.bug_id && formik.errors.bug_id && (
                <p className="mt-2 text-sm text-red-500">{formik.errors.bug_id}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <MdLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-12 pr-12 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Enter your password"
                  name="password"
                  id="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <FaEye className="text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="mt-2 text-sm text-red-500">{formik.errors.password}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 mr-2 rounded border-gray-300 text-purple focus:ring-purple"
                />
                Remember me
              </label>
              <Link to="/" className="text-sm text-purple hover:text-purple/80 font-medium">
                Forgot Password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading || !formik.isValid}
              whileHover={{ scale: formik.isValid && !loading ? 1.02 : 1 }}
              whileTap={{ scale: formik.isValid && !loading ? 0.98 : 1 }}
              className="w-full py-4 bg-purple text-white font-semibold rounded-xl shadow-lg shadow-purple/25 hover:shadow-purple/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-sm text-gray-500">
              Need help? Contact{" "}
              <span className="text-purple font-medium">support@buggybillions.com</span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
