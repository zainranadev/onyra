import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ShieldCheck, Truck, Zap } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { orderService } from "@/services/orderService";
import { Button } from "@/components/common/Button";
import { toApiError } from "@/services/api";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid phone number"),
  address: z.string().min(3, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State / province is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  deliveryMethod: z.enum(["standard", "express"]),
  couponCode: z.string().optional(),
});
type CheckoutForm = z.infer<typeof checkoutSchema>;

const STANDARD_SHIPPING = 6.99;
const EXPRESS_SHIPPING = 16.99;
const TAX_RATE = 0.07;
const FREE_SHIPPING_THRESHOLD = 100;

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      fullName: user?.name || "",
      email: user?.email || "",
      deliveryMethod: "standard",
      country: "United States",
    },
  });

  const deliveryMethod = watch("deliveryMethod");

  const shipping = useMemo(() => {
    if (deliveryMethod === "express") return EXPRESS_SHIPPING;
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
  }, [deliveryMethod, subtotal]);
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  const onSubmit = async (data: CheckoutForm) => {
    setSubmitError(null);
    try {
      const order = await orderService.create({
        customer: { fullName: data.fullName, email: data.email, phone: data.phone },
        shippingAddress: {
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
        deliveryMethod: data.deliveryMethod,
        items: items.map((i) => ({ productId: i.product._id, quantity: i.quantity })),
        couponCode: data.couponCode || undefined,
      });
      clearCart();
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      setSubmitError(toApiError(err).message);
    }
  };

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 font-display text-3xl text-ink">Checkout</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <section className="rounded-xl2 bg-white p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg text-ink">Customer information</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.fullName?.message}>
                <input {...register("fullName")} className="input" placeholder="Jordan Blake" />
              </Field>
              <Field label="Email" error={errors.email?.message}>
                <input {...register("email")} type="email" className="input" placeholder="jordan@email.com" />
              </Field>
              <Field label="Phone" error={errors.phone?.message}>
                <input {...register("phone")} className="input" placeholder="+1 555 010 2938" />
              </Field>
            </div>
          </section>

          <section className="rounded-xl2 bg-white p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg text-ink">Shipping address</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Address" full error={errors.address?.message}>
                <input {...register("address")} className="input" placeholder="221B Baker Street" />
              </Field>
              <Field label="City" error={errors.city?.message}>
                <input {...register("city")} className="input" />
              </Field>
              <Field label="State / Province" error={errors.state?.message}>
                <input {...register("state")} className="input" />
              </Field>
              <Field label="Postal code" error={errors.postalCode?.message}>
                <input {...register("postalCode")} className="input" />
              </Field>
              <Field label="Country" error={errors.country?.message}>
                <input {...register("country")} className="input" />
              </Field>
            </div>
          </section>

          <section className="rounded-xl2 bg-white p-6 shadow-card">
            <h2 className="mb-4 font-display text-lg text-ink">Delivery method</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${deliveryMethod === "standard" ? "border-orange bg-orange/5" : "border-black/10"}`}>
                <input type="radio" value="standard" {...register("deliveryMethod")} className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-medium text-ink"><Truck size={15} /> Standard</div>
                  <p className="text-xs text-graphite">4–6 business days · {subtotal >= FREE_SHIPPING_THRESHOLD ? "Free" : `$${STANDARD_SHIPPING.toFixed(2)}`}</p>
                </div>
              </label>
              <label className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 ${deliveryMethod === "express" ? "border-orange bg-orange/5" : "border-black/10"}`}>
                <input type="radio" value="express" {...register("deliveryMethod")} className="mt-1" />
                <div>
                  <div className="flex items-center gap-2 font-medium text-ink"><Zap size={15} /> Express</div>
                  <p className="text-xs text-graphite">1–2 business days · ${EXPRESS_SHIPPING.toFixed(2)}</p>
                </div>
              </label>
            </div>
          </section>

          <section className="rounded-xl2 bg-white p-6 shadow-card">
            <h2 className="mb-3 font-display text-lg text-ink">Payment</h2>
            <div className="flex items-center gap-2 rounded-lg bg-cream px-3.5 py-3 text-sm text-brown">
              <ShieldCheck size={16} />
              Demo checkout — no real payment will be processed.
            </div>
            <div className="mt-4">
              <Field label="Coupon code (optional)">
                <input {...register("couponCode")} className="input" placeholder="WELCOME10" />
              </Field>
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-xl2 bg-white p-6 shadow-card lg:sticky lg:top-24">
          <h2 className="font-display text-lg text-ink">Order summary</h2>
          <div className="max-h-64 space-y-3 overflow-y-auto">
            {items.map((i) => (
              <div key={i.product._id} className="flex items-center gap-3">
                <img src={i.product.image} alt={i.product.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="text-ink">{i.product.name}</p>
                  <p className="text-xs text-graphite">Qty {i.quantity}</p>
                </div>
                <span className="text-sm font-medium text-ink">${(i.product.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="space-y-2 border-t border-black/5 pt-4 text-sm text-graphite">
            <div className="flex justify-between"><span>Subtotal</span><span className="text-ink">${subtotal.toFixed(2)}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-ink">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span></div>
            <div className="flex justify-between"><span>Estimated tax</span><span className="text-ink">${tax.toFixed(2)}</span></div>
          </div>
          <div className="flex justify-between border-t border-black/5 pt-4 text-base font-semibold text-ink">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          {submitError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{submitError}</p>}
          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
            Place order
          </Button>
          <p className="text-center text-xs text-graphite">
            By placing your order you agree to our demo terms. <Link to="/" className="underline">Learn more</Link>
          </p>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${full ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-xs font-medium text-graphite">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-500">{error}</span>}
    </label>
  );
}
