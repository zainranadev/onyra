import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/common/Button";

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        const user = await login({ email: values.email.trim(), password: values.password });
        // Admins always land on the dashboard regardless of redirect param
        if (user.role === "admin") {
          navigate(redirect.startsWith("/admin") ? redirect : "/admin");
        } else {
          navigate(redirect);
        }
      } catch {
        // Toast handled by AuthContext; mark fields as errored
        setFieldError("password", "Invalid email or password");
        setSubmitting(false);
      }
    },
  });

  const handleQuickLogin = async (role: "admin" | "customer") => {
    const creds =
      role === "admin"
        ? { email: "admin@onyra.com", password: "admin123" }
        : { email: "customer@onyra.com", password: "customer123" };

    formik.setValues(creds);
    try {
      const user = await login(creds);
      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate(redirect);
      }
    } catch {
      // handled by AuthContext toast
    }
  };

  const field = (name: "email" | "password") =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

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
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
              {redirect === "/checkout" ? "Sign in to Checkout" : "Welcome back"}
            </h1>
            <p className="mt-2 text-sm text-graphite">
              {redirect === "/checkout"
                ? "Please sign in or create an account to proceed with your order."
                : "Sign in to manage orders, wishlists, and your account."}
            </p>
          </div>

          {redirect === "/checkout" && (
            <div className="mt-4 rounded-xl border border-brown/20 bg-cream/60 p-3 text-xs text-brown flex items-center gap-2">
              <Lock size={15} className="shrink-0" />
              <span>Checkout is reserved for registered customers to track delivery and warranties.</span>
            </div>
          )}

          <form onSubmit={formik.handleSubmit} className="mt-6 space-y-4" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="login-email" className="mb-1.5 block text-xs font-medium text-ink">
                Email Address
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3.5 text-graphite pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  {...formik.getFieldProps("email")}
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-ink bg-mist outline-none transition-all focus:bg-white ${
                    field("email") ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-brown"
                  }`}
                />
              </div>
              {field("email") && (
                <p className="mt-1 text-xs text-red-500">{field("email")}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="mb-1.5 block text-xs font-medium text-ink">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3.5 text-graphite pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  {...formik.getFieldProps("password")}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm text-ink bg-mist outline-none transition-all focus:bg-white ${
                    field("password") ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-brown"
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
              {field("password") && (
                <p className="mt-1 text-xs text-red-500">{field("password")}</p>
              )}
            </div>

            <Button type="submit" disabled={formik.isSubmitting} className="w-full mt-2">
              {formik.isSubmitting ? "Signing in..." : "Sign In"}
              {!formik.isSubmitting && <ArrowRight size={16} className="ml-1.5" />}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-graphite">
            Don&apos;t have an account?{" "}
            <Link
              to={`/register?redirect=${encodeURIComponent(redirect)}`}
              className="font-semibold text-brown hover:underline"
            >
              Create account
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
