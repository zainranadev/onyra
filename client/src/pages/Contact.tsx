import { Mail, Phone, MapPin, Send, CheckCircle2 } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Button } from "@/components/common/Button";

const contactSchema = Yup.object({
  name: Yup.string().trim().min(2, "Name must be at least 2 characters").required("Name is required"),
  email: Yup.string().trim().email("Enter a valid email address").required("Email is required"),
  subject: Yup.string().trim().min(3, "Subject is too short").required("Subject is required"),
  message: Yup.string()
    .trim()
    .min(10, "Message should be at least 10 characters")
    .max(2000, "Message is too long")
    .required("Message is required"),
});

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

export default function Contact() {
  const formik = useFormik({
    initialValues: { name: "", email: "", subject: "", message: "" },
    validationSchema: contactSchema,
    onSubmit: async (_values, { setSubmitting }) => {
      // Demo: no real API call — just show success state
      await new Promise((r) => setTimeout(r, 600));
      setSubmitting(false);
      formik.resetForm();
      formik.setStatus("submitted");
    },
  });

  const err = (name: keyof typeof formik.values) =>
    formik.touched[name] && formik.errors[name] ? formik.errors[name] : undefined;

  const inputCls = (name: keyof typeof formik.values) =>
    `input transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
      err(name) ? "border-red-400 focus:border-red-400" : "focus:border-violet-400"
    }`;

  return (
    <div className="container-page relative overflow-hidden py-14">
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute -top-20 left-1/2 -z-10 h-96 w-[36rem] -translate-x-1/2 rounded-full bg-violet-300/20 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mx-auto max-w-2xl text-center"
      >
        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600">
          <motion.span
            className="h-1.5 w-1.5 rounded-full bg-violet-500"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          We usually reply within a day
        </span>
        <h1 className="mt-4 font-display text-3xl text-ink sm:text-4xl">Get in touch</h1>
        <p className="mt-3 text-graphite">Questions about an order, a product, or a partnership — we read everything.</p>
      </motion.div>

      <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-10 md:grid-cols-[1fr_1.3fr]">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          <motion.div variants={fadeUp}>
            <ContactRow icon={<Mail size={16} />} label="Email" value="hello@onyra.co" />
          </motion.div>
          <motion.div variants={fadeUp}>
            <ContactRow icon={<Phone size={16} />} label="Phone" value="+1 (555) 018-2044" />
          </motion.div>
          <motion.div variants={fadeUp}>
            <ContactRow icon={<MapPin size={16} />} label="Studio" value="Lahore, Pakistan" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: "easeOut" }}
          className="relative overflow-hidden rounded-xl2 border border-violet-100 bg-white/80 p-6 shadow-[0_20px_50px_-20px_rgba(139,92,246,0.25)] backdrop-blur-sm"
        >
          <AnimatePresence mode="wait">
            {formik.status === "submitted" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="flex flex-col items-center py-10 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
                  className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30"
                >
                  <CheckCircle2 size={26} />
                </motion.div>
                <h2 className="font-display text-xl text-ink">Message sent</h2>
                <p className="mt-2 text-sm text-graphite">
                  Thanks for reaching out — we&apos;ll reply within one business day.
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                onSubmit={formik.handleSubmit}
                noValidate
                className="space-y-4"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-graphite">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      autoComplete="name"
                      {...formik.getFieldProps("name")}
                      className={inputCls("name")}
                    />
                    <AnimatePresence>
                      {err("name") && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1 text-xs text-red-500"
                        >
                          {err("name")}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-graphite">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      autoComplete="email"
                      {...formik.getFieldProps("email")}
                      className={inputCls("email")}
                    />
                    <AnimatePresence>
                      {err("email") && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-1 text-xs text-red-500"
                        >
                          {err("email")}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="mb-1.5 block text-xs font-medium text-graphite">
                    Subject
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    {...formik.getFieldProps("subject")}
                    className={inputCls("subject")}
                  />
                  <AnimatePresence>
                    {err("subject") && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-xs text-red-500"
                      >
                        {err("subject")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-graphite">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    {...formik.getFieldProps("message")}
                    className={`input resize-none transition-all duration-200 focus:ring-2 focus:ring-violet-500/20 ${
                      err("message") ? "border-red-400 focus:border-red-400" : "focus:border-violet-400"
                    }`}
                  />
                  <AnimatePresence>
                    {err("message") && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-1 text-xs text-red-500"
                      >
                        {err("message")}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gap-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40"
                    loading={formik.isSubmitting}
                  >
                    {!formik.isSubmitting && <Send size={16} />}
                    {formik.isSubmitting ? "Sending..." : "Send message"}
                  </Button>
                </motion.div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

function ContactRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <motion.div whileHover={{ x: 3 }} transition={{ type: "spring", stiffness: 400, damping: 25 }} className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-50 text-violet-600 transition-colors duration-300">
        {icon}
      </div>
      <div>
        <p className="text-xs text-graphite">{label}</p>
        <p className="text-sm font-medium text-ink">{value}</p>
      </div>
    </motion.div>
  );
}