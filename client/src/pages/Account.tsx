import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Shield, Package, Lock, LogOut, ArrowRight, Phone, MapPin, Home } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/common/Button";

type TabType = "profile" | "security";

// ─── Yup schemas ────────────────────────────────────────────────────────────

const profileSchema = Yup.object({
  name: Yup.string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name is too long")
    .required("Full name is required"),
  email: Yup.string()
    .trim()
    .email("Enter a valid email address")
    .required("Email is required"),
  phone: Yup.string()
    .trim()
    .max(30, "Phone number too long")
    .matches(/^[+\d\s\-().]*$/, "Enter a valid phone number")
    .optional(),
  street: Yup.string().trim().max(200, "Street address too long").optional(),
  city: Yup.string().trim().max(100, "City name too long").optional(),
  district: Yup.string().trim().max(100, "District name too long").optional(),
  province: Yup.string().trim().max(100, "Province name too long").optional(),
});

const passwordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(6, "New password must be at least 6 characters")
    .matches(/[A-Za-z]/, "Password must contain at least one letter")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Please confirm your new password"),
});

// ─── Component ───────────────────────────────────────────────────────────────

export default function Account() {
  const { user, logout, updateProfile, updatePassword, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // ── Profile form ──────────────────────────────────────────────────────────
  const profileForm = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      street: user?.address?.street || "",
      city: user?.address?.city || "",
      district: user?.address?.district || "",
      province: user?.address?.province || "",
    },
    validationSchema: profileSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await updateProfile({
          name: values.name.trim(),
          email: values.email.trim().toLowerCase(),
          phone: values.phone.trim() || undefined,
          address: {
            street: values.street.trim() || undefined,
            city: values.city.trim() || undefined,
            district: values.district.trim() || undefined,
            province: values.province.trim() || undefined,
          },
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  // ── Password form ─────────────────────────────────────────────────────────
  const passwordForm = useFormik({
    initialValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
    validationSchema: passwordSchema,
    onSubmit: async (values, { setSubmitting, resetForm, setFieldError }) => {
      try {
        await updatePassword({ currentPassword: values.currentPassword, newPassword: values.newPassword });
        resetForm();
      } catch {
        setFieldError("currentPassword", "Current password is incorrect");
        setSubmitting(false);
      }
    },
  });

  // Helpers
  const pErr = (name: keyof typeof profileForm.values) =>
    profileForm.touched[name] && profileForm.errors[name] ? profileForm.errors[name] : undefined;

  const sErr = (name: keyof typeof passwordForm.values) =>
    passwordForm.touched[name] && passwordForm.errors[name] ? passwordForm.errors[name] : undefined;

  const inputCls = (hasError: boolean) =>
    `w-full rounded-xl border py-2.5 px-4 text-sm text-ink bg-mist outline-none transition-all focus:bg-white ${hasError ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-brown"
    }`;

  if (!user) return null;

  return (
    <div className="container-page py-10">
      {/* ── Header ── */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-semibold text-ink">My Account</h1>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${isAdmin ? "bg-purple/10 text-purple" : "bg-brown/10 text-brown"
                }`}
            >
              {user.role}
            </span>
          </div>
          <p className="mt-1 text-sm text-graphite">Manage your profile, password, and order history.</p>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link to="/admin">
              <Button variant="secondary" className="flex items-center gap-1.5 text-xs">
                <Shield size={14} /> Admin Dashboard
              </Button>
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-xl border border-black/10 px-4 py-2 text-xs font-medium text-graphite hover:bg-black/5 hover:text-ink transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {/* ── Sidebar Nav ── */}
        <div className="md:col-span-1 space-y-2">
          <div className="rounded-2xl border border-black/5 bg-white p-5 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cream text-brown font-display text-lg font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="font-medium text-sm text-ink truncate">{user.name}</p>
                <p className="text-xs text-graphite truncate">{user.email}</p>
              </div>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${activeTab === "profile" ? "bg-cream text-brown" : "text-graphite hover:text-ink hover:bg-mist"
                  }`}
              >
                <User size={16} /> Profile Details
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors ${activeTab === "security" ? "bg-cream text-brown" : "text-graphite hover:text-ink hover:bg-mist"
                  }`}
              >
                <Lock size={16} /> Security &amp; Password
              </button>
              <Link
                to="/account/orders"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-graphite hover:text-ink hover:bg-mist transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <Package size={16} /> My Orders
                </span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        {/* ── Content Area ── */}
        <div className="md:col-span-3">

          {/* ──────────── Profile Tab ──────────── */}
          {activeTab === "profile" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/5 bg-white p-6 shadow-card"
            >
              <h2 className="font-display text-xl font-semibold text-ink">Personal Information</h2>
              <p className="mt-1 text-xs text-graphite">Update your name, email, phone and delivery address.</p>

              <form onSubmit={profileForm.handleSubmit} noValidate className="mt-6 space-y-6 max-w-lg">

                {/* ── Basic info ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-graphite/60">
                    <User size={12} /> Basic Info
                  </div>

                  <div>
                    <label htmlFor="acc-name" className="mb-1.5 block text-xs font-medium text-ink">
                      Full Name
                    </label>
                    <input
                      id="acc-name"
                      type="text"
                      autoComplete="name"
                      {...profileForm.getFieldProps("name")}
                      className={inputCls(!!pErr("name"))}
                    />
                    {pErr("name") && <p className="mt-1 text-xs text-red-500">{pErr("name")}</p>}
                  </div>

                  <div>
                    <label htmlFor="acc-email" className="mb-1.5 block text-xs font-medium text-ink">
                      Email Address
                    </label>
                    <input
                      id="acc-email"
                      type="email"
                      autoComplete="email"
                      {...profileForm.getFieldProps("email")}
                      className={inputCls(!!pErr("email"))}
                    />
                    {pErr("email") && <p className="mt-1 text-xs text-red-500">{pErr("email")}</p>}
                  </div>
                </div>

                {/* ── Contact ── */}
                <div className="space-y-4 border-t border-black/5 pt-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-graphite/60">
                    <Phone size={12} /> Contact
                  </div>

                  <div>
                    <label htmlFor="acc-phone" className="mb-1.5 block text-xs font-medium text-ink">
                      Phone Number <span className="text-graphite/50 font-normal">(optional)</span>
                    </label>
                    <div className="relative flex items-center">
                      <Phone size={15} className="absolute left-3.5 text-graphite pointer-events-none" />
                      <input
                        id="acc-phone"
                        type="tel"
                        autoComplete="tel"
                        {...profileForm.getFieldProps("phone")}
                        placeholder="+1 555 000 0000"
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-ink bg-mist outline-none transition-all focus:bg-white ${pErr("phone") ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-brown"
                          }`}
                      />
                    </div>
                    {pErr("phone") && <p className="mt-1 text-xs text-red-500">{pErr("phone")}</p>}
                  </div>
                </div>

                {/* ── Address ── */}
                <div className="space-y-4 border-t border-black/5 pt-5">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-graphite/60">
                    <MapPin size={12} /> Delivery Address <span className="font-normal normal-case text-graphite/40">(optional)</span>
                  </div>

                  {/* Province + District */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="acc-province" className="mb-1.5 block text-xs font-medium text-ink">
                        Province
                      </label>
                      <input
                        id="acc-province"
                        type="text"
                        autoComplete="address-level1"
                        {...profileForm.getFieldProps("province")}
                        placeholder="e.g. Punjab"
                        className={inputCls(!!pErr("province"))}
                      />
                      {pErr("province") && <p className="mt-1 text-xs text-red-500">{pErr("province")}</p>}
                    </div>
                    <div>
                      <label htmlFor="acc-district" className="mb-1.5 block text-xs font-medium text-ink">
                        District
                      </label>
                      <input
                        id="acc-district"
                        type="text"
                        autoComplete="address-level2"
                        {...profileForm.getFieldProps("district")}
                        placeholder="e.g. Lahore"
                        className={inputCls(!!pErr("district"))}
                      />
                      {pErr("district") && <p className="mt-1 text-xs text-red-500">{pErr("district")}</p>}
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="acc-city" className="mb-1.5 block text-xs font-medium text-ink">
                      City / Town
                    </label>
                    <input
                      id="acc-city"
                      type="text"
                      autoComplete="address-level3"
                      {...profileForm.getFieldProps("city")}
                      placeholder="e.g. Lahore"
                      className={inputCls(!!pErr("city"))}
                    />
                    {pErr("city") && <p className="mt-1 text-xs text-red-500">{pErr("city")}</p>}
                  </div>

                  {/* Street */}
                  <div>
                    <label htmlFor="acc-street" className="mb-1.5 block text-xs font-medium text-ink">
                      Street Address
                    </label>
                    <div className="relative flex items-center">
                      <Home size={15} className="absolute left-3.5 text-graphite pointer-events-none" />
                      <input
                        id="acc-street"
                        type="text"
                        autoComplete="street-address"
                        {...profileForm.getFieldProps("street")}
                        placeholder="House #, Street name, Area"
                        className={`w-full rounded-xl border py-2.5 pl-10 pr-4 text-sm text-ink bg-mist outline-none transition-all focus:bg-white ${pErr("street") ? "border-red-400 focus:border-red-400" : "border-black/10 focus:border-brown"
                          }`}
                      />
                    </div>
                    {pErr("street") && <p className="mt-1 text-xs text-red-500">{pErr("street")}</p>}
                  </div>
                </div>

                {/* ── Submit ── */}
                <div className="pt-2">
                  <Button type="submit" disabled={profileForm.isSubmitting}>
                    {profileForm.isSubmitting ? "Saving changes..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}

          {/* ──────────── Security Tab ──────────── */}
          {activeTab === "security" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-black/5 bg-white p-6 shadow-card"
            >
              <h2 className="font-display text-xl font-semibold text-ink">Change Password</h2>
              <p className="mt-1 text-xs text-graphite">Keep your Onyra account protected with a strong password.</p>

              <form onSubmit={passwordForm.handleSubmit} noValidate className="mt-6 space-y-4 max-w-lg">
                <div>
                  <label htmlFor="acc-current-pw" className="mb-1.5 block text-xs font-medium text-ink">
                    Current Password
                  </label>
                  <input
                    id="acc-current-pw"
                    type="password"
                    autoComplete="current-password"
                    {...passwordForm.getFieldProps("currentPassword")}
                    placeholder="••••••••"
                    className={inputCls(!!sErr("currentPassword"))}
                  />
                  {sErr("currentPassword") && (
                    <p className="mt-1 text-xs text-red-500">{sErr("currentPassword")}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="acc-new-pw" className="mb-1.5 block text-xs font-medium text-ink">
                    New Password
                  </label>
                  <input
                    id="acc-new-pw"
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.getFieldProps("newPassword")}
                    placeholder="At least 6 characters"
                    className={inputCls(!!sErr("newPassword"))}
                  />
                  {sErr("newPassword") && (
                    <p className="mt-1 text-xs text-red-500">{sErr("newPassword")}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="acc-confirm-pw" className="mb-1.5 block text-xs font-medium text-ink">
                    Confirm New Password
                  </label>
                  <input
                    id="acc-confirm-pw"
                    type="password"
                    autoComplete="new-password"
                    {...passwordForm.getFieldProps("confirmPassword")}
                    placeholder="Re-enter new password"
                    className={inputCls(!!sErr("confirmPassword"))}
                  />
                  {sErr("confirmPassword") && (
                    <p className="mt-1 text-xs text-red-500">{sErr("confirmPassword")}</p>
                  )}
                </div>

                <div className="pt-2">
                  <Button type="submit" disabled={passwordForm.isSubmitting}>
                    {passwordForm.isSubmitting ? "Updating password..." : "Update Password"}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
