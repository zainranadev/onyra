import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { User as UserIcon, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";

const registerSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .required("Full name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .matches(/[A-Za-z]/, "Password must contain at least one letter")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { name: "", email: "", password: "", confirmPassword: "" },
    validationSchema: registerSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        await register({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
        });
        navigate(redirect);
      } catch {
        // Toast handled by AuthContext; highlight the email field on duplicate
        setFieldError("email", "An account with this email may already exist");
        setSubmitting(false);
      }
    },
  });

  const err = (name: keyof typeof formik.values) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

  const fieldCls = (name: keyof typeof formik.values) =>
    `w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-ink bg-mist outline-none transition-all focus:bg-white ${
      err(name) ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-brown"
    }`;

  return (
    <div className="container-page flex min-h-[calc(100vh-14rem)] items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="rounded-2xl border border-black/5 bg-white p-8 shadow-card">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">Create Account</h1>
            <p className="mt-2 text-sm text-graphite">
              Join Onyra to track orders, save wishlists, and enjoy seamless checkout.
            </p>
          </div>

          <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* Full Name */}
            <div>
              <label htmlFor="reg-name" className="mb-1.5 block text-xs font-medium text-ink">
                Full Name
              </label>
              <div className="relative flex items-center">
                <UserIcon size={16} className="absolute left-3.5 text-graphite pointer-events-none" />
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  {...formik.getFieldProps("name")}
                  placeholder="Sophia Bennett"
                  className={fieldCls("name")}
                />
              </div>
              {err("name") && <p className="mt-1 text-xs text-red-500">{err("name")}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-xs font-medium text-ink">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-graphite pointer-events-none" />
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  {...formik.getFieldProps("email")}
                  placeholder="you@example.com"
                  className={fieldCls("email")}
                />
              </div>
              {err("email") && <p className="mt-1 text-xs text-red-500">{err("email")}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-xs font-medium text-ink">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-graphite pointer-events-none" />
                <input
                  id="reg-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...formik.getFieldProps("password")}
                  placeholder="At least 6 characters"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-ink bg-mist outline-none transition-all focus:bg-white ${
                    err("password") ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-brown"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-graphite hover:text-ink"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {err("password") && <p className="mt-1 text-xs text-red-500">{err("password")}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg-confirm" className="mb-1.5 block text-xs font-medium text-ink">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-graphite pointer-events-none" />
                <input
                  id="reg-confirm"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  {...formik.getFieldProps("confirmPassword")}
                  placeholder="Re-enter password"
                  className={fieldCls("confirmPassword")}
                />
              </div>
              {err("confirmPassword") && (
                <p className="mt-1 text-xs text-red-500">{err("confirmPassword")}</p>
              )}
            </div>

            <Button type="submit" disabled={formik.isSubmitting} className="w-full mt-2">
              {formik.isSubmitting ? "Creating account..." : "Create Account"}
              {!formik.isSubmitting && <ArrowRight size={16} className="ml-1.5" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-graphite">
            Already have an account?{" "}
            <Link
              to={`/login?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-brown hover:underline"
            >
              Sign in instead
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
