"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Tag, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Modal from "@/components/ui/Modal";
import api from "@/services/api";
import type { Coupon } from "@/types";

const couponSchema = z.object({
  code: z.string().min(1, "Coupon code is required").max(20),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.string().min(1, "Discount value is required").refine(
    (val) => !isNaN(Number(val)) && Number(val) > 0,
    "Must be a positive number"
  ),
  minOrderAmount: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  usageLimit: z.string().optional(),
  maxDiscount: z.string().optional(),
}).refine(data => new Date(data.endDate) >= new Date(data.startDate), {
  message: "End date must be after start date",
  path: ["endDate"],
});

type CouponFormData = z.infer<typeof couponSchema>;

export default function PromotionsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const modalForm = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      maxDiscount: "",
    },
  });

  const inlineForm = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      code: "",
      discountType: "percentage",
      discountValue: "",
      minOrderAmount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      maxDiscount: "",
    },
  });

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get("/seller/coupons");
        if (res.data.success) {
          const data = res.data.data;
          setCoupons(Array.isArray(data) ? data : data?.coupons || []);
        }
      } catch {
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const buildPayload = (data: CouponFormData) => ({
    code: data.code,
    discountType: data.discountType === "flat" ? "fixed" as const : "percentage" as const,
    discountValue: parseFloat(data.discountValue),
    minOrderAmount: data.minOrderAmount ? parseFloat(data.minOrderAmount) : 0,
    maxDiscount: data.maxDiscount ? parseFloat(data.maxDiscount) : undefined,
    usageLimit: data.usageLimit ? parseInt(data.usageLimit) : 100,
    startDate: data.startDate,
    endDate: data.endDate,
  });

  const onModalSubmit = async (data: CouponFormData) => {
    const payload = buildPayload(data);
    if (editingCoupon) {
      try {
        const res = await api.put(`/seller/coupons/${editingCoupon.id}`, payload);
        if (res.data.success) {
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...res.data.data } : c))
          );
        } else {
          setCoupons((prev) =>
            prev.map((c) => (c.id === editingCoupon.id ? { ...c, ...payload } : c))
          );
        }
      } catch {
        setCoupons((prev) =>
          prev.map((c) =>
            c.id === editingCoupon.id
              ? { ...c, code: payload.code, discountType: payload.discountType, discountValue: payload.discountValue, minOrderAmount: payload.minOrderAmount, maxDiscount: payload.maxDiscount, usageLimit: payload.usageLimit, startDate: payload.startDate, endDate: payload.endDate }
              : c
          )
        );
      }
    } else {
      try {
        const res = await api.post("/seller/coupons", payload);
        if (res.data.success) {
          setCoupons((prev) => [...prev, res.data.data]);
        }
      } catch {
        // silently fail
      }
    }
    closeModal();
  };

  const onInlineSubmit = async (data: CouponFormData) => {
    const payload = buildPayload(data);
    try {
      const res = await api.post("/seller/coupons", payload);
      if (res.data.success) {
        setCoupons((prev) => [...prev, res.data.data]);
      }
    } catch {
      // silently fail
    }
    inlineForm.reset();
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    modalForm.reset({
      code: coupon.code,
      discountType: coupon.discountType === "fixed" ? "flat" : "percentage",
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxDiscount: coupon.maxDiscount ? String(coupon.maxDiscount) : "",
      usageLimit: String(coupon.usageLimit),
      startDate: coupon.startDate?.split("T")[0] || "",
      endDate: coupon.endDate?.split("T")[0] || "",
    });
    setShowCreate(true);
  };

  const deleteCoupon = async (couponId: string) => {
    try {
      await api.delete(`/seller/coupons/${couponId}`);
    } catch {
      // proceed with local removal even on API failure
    }
    setCoupons((prev) => prev.filter((c) => c.id !== couponId));
  };

  const closeModal = () => {
    setShowCreate(false);
    setEditingCoupon(null);
    modalForm.reset();
  };

  const openCreateModal = () => {
    setEditingCoupon(null);
    modalForm.reset();
    setShowCreate(true);
  };

  const inlineInputClass = (hasError: boolean) =>
    `w-full bg-transparent border-b ${hasError ? "border-red-500" : "border-zinc-800"} py-3 focus:border-[#e07b39] focus:ring-0 text-sm transition-colors outline-none text-white placeholder:text-zinc-600`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-[#9a4601]">Growth</span>
          <h1 className="text-5xl font-light tracking-tighter text-white mt-2">Promotions</h1>
        </div>
        <button
          onClick={openCreateModal}
          data-testid="create-coupon"
          className="px-6 py-2 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-[11px] font-medium uppercase tracking-[0.1rem] hover:opacity-90 transition-all rounded-sm flex items-center gap-2 shadow-lg shadow-[#9a4601]/10"
        >
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-12 gap-12">
        {/* Left: Active Campaigns */}
        <div className="col-span-12 lg:col-span-7 bg-zinc-900/30 p-8 border border-zinc-800/50 rounded-sm" data-testid="coupons-table">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-light tracking-tight text-white">Active Campaigns</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{coupons.length} Total</span>
          </div>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-zinc-800 skeleton rounded-sm" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon, i) => (
                <motion.div
                  key={coupon.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`bg-zinc-900 border-l-2 p-5 flex justify-between items-center rounded-sm ${
                    coupon.isActive ? "border-[#9a4601]" : "border-zinc-700 opacity-60"
                  }`}
                >
                  <div>
                    <p className={`text-sm font-mono tracking-wider ${
                      coupon.isActive ? "text-[#e07b39]" : "text-zinc-400 line-through"
                    }`}>
                      {coupon.code}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {coupon.discountType === "percentage" ? `${coupon.discountValue}% Off` : `$${coupon.discountValue} Off`}
                      {" "}&middot; Min ${coupon.minOrderAmount}
                      {" "}&middot; Ends {formatDate(coupon.endDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-zinc-100">{coupon.usedCount} uses</p>
                    {/* Progress bar */}
                    <div className="mt-2 h-1 w-20 rounded-sm bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-sm bg-[#2563EB]"
                        style={{ width: `${(coupon.usedCount / coupon.usageLimit) * 100}%` }}
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button onClick={() => handleEdit(coupon)} className="p-1 text-zinc-500 hover:text-[#e07b39] transition-colors cursor-pointer">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => deleteCoupon(coupon.id)} className="p-1 text-zinc-500 hover:text-red-500 transition-colors cursor-pointer">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Create Form & Tip */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
          <div className="p-8 border border-zinc-800 rounded-sm">
            <h3 className="text-sm font-medium uppercase tracking-[0.2em] mb-8 text-zinc-300">Create Coupon</h3>
            <form className="space-y-6" onSubmit={inlineForm.handleSubmit(onInlineSubmit)}>
              {inlineForm.formState.errors.root && (
                <p className="text-red-400 text-sm">{inlineForm.formState.errors.root.message}</p>
              )}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Campaign Name</label>
                <input
                  className="w-full bg-transparent border-b border-zinc-800 py-3 focus:border-[#e07b39] focus:ring-0 text-sm transition-colors outline-none text-white placeholder:text-zinc-600"
                  placeholder="e.g. Summer Solstice"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Code</label>
                  <input
                    {...inlineForm.register("code")}
                    className={`${inlineInputClass(!!inlineForm.formState.errors.code)} font-mono`}
                    placeholder="CODE20"
                    type="text"
                  />
                  {inlineForm.formState.errors.code && (
                    <p className="text-red-400 text-xs mt-1">{inlineForm.formState.errors.code.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Discount Value</label>
                  <input
                    {...inlineForm.register("discountValue")}
                    className={inlineInputClass(!!inlineForm.formState.errors.discountValue)}
                    placeholder="20"
                    type="text"
                  />
                  {inlineForm.formState.errors.discountValue && (
                    <p className="text-red-400 text-xs mt-1">{inlineForm.formState.errors.discountValue.message}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Discount Type</label>
                <div className="flex gap-4">
                  <label className="flex-1 cursor-pointer">
                    <input
                      {...inlineForm.register("discountType")}
                      value="percentage"
                      className="hidden peer"
                      type="radio"
                    />
                    <div data-testid="discount-type-percentage" className="text-center py-3 border border-zinc-800 peer-checked:border-[#e07b39] peer-checked:text-[#e07b39] transition-all text-[11px] uppercase tracking-widest rounded-sm text-zinc-400">
                      Percentage
                    </div>
                  </label>
                  <label className="flex-1 cursor-pointer">
                    <input
                      {...inlineForm.register("discountType")}
                      value="flat"
                      className="hidden peer"
                      type="radio"
                    />
                    <div data-testid="discount-type-flat" className="text-center py-3 border border-zinc-800 peer-checked:border-[#e07b39] peer-checked:text-[#e07b39] transition-all text-[11px] uppercase tracking-widest rounded-sm text-zinc-400">
                      Fixed Amount
                    </div>
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Start Date</label>
                  <input
                    {...inlineForm.register("startDate")}
                    className={inlineInputClass(!!inlineForm.formState.errors.startDate)}
                    type="date"
                  />
                  {inlineForm.formState.errors.startDate && (
                    <p className="text-red-400 text-xs mt-1">{inlineForm.formState.errors.startDate.message}</p>
                  )}
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-2">End Date</label>
                  <input
                    {...inlineForm.register("endDate")}
                    className={inlineInputClass(!!inlineForm.formState.errors.endDate)}
                    type="date"
                  />
                  {inlineForm.formState.errors.endDate && (
                    <p className="text-red-400 text-xs mt-1">{inlineForm.formState.errors.endDate.message}</p>
                  )}
                </div>
              </div>
              <button
                type="submit"
                disabled={inlineForm.formState.isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-[#9a4601] to-[#e07b39] text-white text-xs font-bold uppercase tracking-[0.2em] shadow-lg shadow-[#9a4601]/10 hover:shadow-[#9a4601]/20 transition-all active:scale-[0.98] rounded-sm disabled:opacity-60"
              >
                {inlineForm.formState.isSubmitting ? "Creating..." : "Generate Campaign"}
              </button>
            </form>
          </div>

          {/* Curator Tip */}
          <div className="p-8 bg-[#9a4601]/5 border border-[#9a4601]/20 rounded-sm">
            <div className="flex items-start gap-4">
              <Tag size={18} className="text-[#e07b39] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#e07b39] mb-2">Curator Tip</h4>
                <p className="text-xs text-zinc-400 leading-relaxed font-light">
                  Free shipping coupons increase conversion by 42% for orders over $150 in the current market climate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create / Edit Coupon Modal */}
      <Modal isOpen={showCreate} onClose={closeModal} title={editingCoupon ? "Edit Coupon" : "Create Coupon"}>
        <form onSubmit={modalForm.handleSubmit(onModalSubmit)} className="space-y-4">
          {modalForm.formState.errors.root && (
            <p className="text-red-400 text-sm">{modalForm.formState.errors.root.message}</p>
          )}
          <Input
            label="Coupon Code"
            id="modal-code"
            placeholder="e.g. SUMMER25"
            {...modalForm.register("code")}
            error={modalForm.formState.errors.code?.message}
          />
          <Select
            label="Discount Type"
            id="modal-type"
            {...modalForm.register("discountType")}
            options={[
              { label: "Percentage", value: "percentage" },
              { label: "Fixed Amount", value: "flat" },
            ]}
            error={modalForm.formState.errors.discountType?.message}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Discount Value"
              id="modal-value"
              type="number"
              placeholder="20"
              {...modalForm.register("discountValue")}
              error={modalForm.formState.errors.discountValue?.message}
            />
            <Input
              label="Min Order Amount ($)"
              id="modal-minOrder"
              type="number"
              placeholder="50"
              {...modalForm.register("minOrderAmount")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Max Discount ($)"
              id="modal-maxDiscount"
              type="number"
              placeholder="30"
              {...modalForm.register("maxDiscount")}
            />
            <Input
              label="Usage Limit"
              id="modal-limit"
              type="number"
              placeholder="100"
              {...modalForm.register("usageLimit")}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              id="modal-startDate"
              type="date"
              {...modalForm.register("startDate")}
              error={modalForm.formState.errors.startDate?.message}
            />
            <Input
              label="End Date"
              id="modal-endDate"
              type="date"
              {...modalForm.register("endDate")}
              error={modalForm.formState.errors.endDate?.message}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={modalForm.formState.isSubmitting}>
              {modalForm.formState.isSubmitting
                ? "Saving..."
                : editingCoupon
                  ? "Update Coupon"
                  : "Create Coupon"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
