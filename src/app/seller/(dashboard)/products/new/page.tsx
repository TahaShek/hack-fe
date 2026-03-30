"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Upload, Plus, X, ImagePlus, CheckCircle } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import DynamicPricingSuggestion from "@/components/ai/DynamicPricingSuggestion";
import api from "@/services/api";

interface ProductForm {
  name: string;
  description: string;
  category: string;
  price: string;
  compareAtPrice: string;
  stock: string;
}

const categoryOptions = [
  { label: "Select Category", value: "" },
  { label: "Electronics", value: "electronics" },
  { label: "Fashion", value: "fashion" },
  { label: "Home & Garden", value: "home-garden" },
  { label: "Sports", value: "sports" },
  { label: "Books", value: "books" },
  { label: "Beauty", value: "beauty" },
];

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState([
    { name: "Size", options: ["S", "M", "L"] },
  ]);
  const imageFileRef = useRef<HTMLInputElement>(null);
  const bulkFileRef = useRef<HTMLInputElement>(null);
  const [bulkRows, setBulkRows] = useState<Record<string, string>[]>([]);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProductForm>();
  const watchPrice = Number(watch("price")) || 0;
  const watchCategory = watch("category") || "Electronics";
  const watchStock = Number(watch("stock")) || 0;

  const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) return;
      const headers = lines[0].split(",").map((h) => h.trim());
      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const row: Record<string, string> = {};
        headers.forEach((h, i) => {
          row[h] = values[i] || "";
        });
        return row;
      });
      setBulkRows(rows);
      setBulkSuccess("");
    };
    reader.readAsText(file);
    // reset so re-selecting same file works
    e.target.value = "";
  };

  const handleBulkUpload = async () => {
    if (bulkRows.length === 0) return;
    setBulkUploading(true);
    setError("");
    try {
      const res = await api.post("/seller/products/bulk-upload", { products: bulkRows });
      if (res.data.success) {
        setBulkSuccess(`Successfully uploaded ${bulkRows.length} products.`);
        setBulkRows([]);
      }
    } catch {
      setError("Bulk upload failed. Please check your file format and try again.");
    } finally {
      setBulkUploading(false);
    }
  };

  const onSubmit = async (data: ProductForm) => {
    setLoading(true);
    setError("");
    try {
      const payload = {
        name: data.name,
        description: data.description,
        category: data.category,
        price: parseFloat(data.price),
        compareAtPrice: data.compareAtPrice ? parseFloat(data.compareAtPrice) : undefined,
        stock: parseInt(data.stock, 10),
        images,
        variants: variants.map((v, i) => ({
          id: `var-new-${i}`,
          name: v.name,
          type: "custom",
          options: v.options.map((opt, oi) => ({
            id: `opt-new-${i}-${oi}`,
            value: opt,
            stock: parseInt(data.stock, 10),
          })),
        })),
      };
      const res = await api.post("/seller/products", payload);
      if (res.data.success) {
        router.push("/seller/products");
        return;
      }
    } catch {
      setError("Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
    // Fallback: navigate anyway for demo
    setTimeout(() => router.push("/seller/products"), 1500);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", options: [""] }]);
  };

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-500">Catalog</span>
        <h1 className="text-4xl font-light tracking-tighter text-white mt-2">Add Product</h1>
        <p className="text-xs text-zinc-500 mt-1">Create a new product listing</p>
      </div>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 text-red-400 text-sm rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" data-testid="product-form">
        {/* Basic Info */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-sm">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-400 block mb-6">General Information</span>
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.05rem]">Product Title</p>
              <input
                {...register("name", { required: "Required" })}
                className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-[#e07b39] focus:ring-0 text-sm text-white px-0 py-2 transition-colors outline-none placeholder:text-zinc-700"
                placeholder="e.g. Minimalist Oak Stool"
                type="text"
              />
              {errors.name && <p className="text-[10px] text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.05rem]">Description</p>
              <textarea
                {...register("description", { required: "Required" })}
                className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-[#e07b39] focus:ring-0 text-sm text-white px-0 py-2 transition-colors outline-none placeholder:text-zinc-700 resize-none"
                placeholder="Describe your product..."
                rows={4}
              />
              {errors.description && <p className="text-[10px] text-red-500">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.05rem]">Category</p>
                <select
                  {...register("category", { required: "Required" })}
                  className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-[#e07b39] focus:ring-0 text-sm text-white px-0 py-2 appearance-none outline-none"
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-[10px] text-red-500">{errors.category.message}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-sm">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-400 block mb-6">Product Imagery</span>
          <input
            ref={imageFileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (!files) return;
              Array.from(files).forEach((file) => {
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const dataUrl = ev.target?.result as string;
                  if (dataUrl) setImages((prev) => [...prev, dataUrl]);
                };
                reader.readAsDataURL(file);
              });
              e.target.value = "";
            }}
          />
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-sm border border-zinc-800 overflow-hidden">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 rounded-sm bg-black/60 text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => imageFileRef.current?.click()}
              className="aspect-square rounded-sm border-2 border-dashed border-zinc-800 flex flex-col items-center justify-center gap-2 text-zinc-600 hover:border-[#e07b39] hover:text-[#e07b39] transition-colors cursor-pointer"
            >
              <ImagePlus size={24} />
              <span className="text-[9px] uppercase tracking-widest">Upload Image</span>
            </button>
          </div>
          <p className="text-[9px] text-zinc-700 mt-3">Recommended: 2000 x 2000px, PNG or JPG. You can select multiple files.</p>
        </div>

        {/* Pricing */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-sm">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-400 block mb-6">Pricing & Inventory</span>
          <div className="grid sm:grid-cols-3 gap-6 mb-4">
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.05rem]">Retail Price (USD)</p>
              <div className="relative">
                <span className="absolute left-0 top-1/2 -translate-y-1/2 text-zinc-600 text-sm">$</span>
                <input
                  {...register("price", { required: "Required" })}
                  className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-[#e07b39] focus:ring-0 text-sm text-white pl-4 py-2 outline-none placeholder:text-zinc-700"
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                />
              </div>
              {errors.price && <p className="text-[10px] text-red-500">{errors.price.message}</p>}
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.05rem]">Compare at Price</p>
              <input
                {...register("compareAtPrice")}
                className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-[#e07b39] focus:ring-0 text-sm text-white px-0 py-2 outline-none placeholder:text-zinc-700"
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-[0.05rem]">Initial Stock</p>
              <input
                {...register("stock", { required: "Required" })}
                className="w-full bg-transparent border-0 border-b border-zinc-800 focus:border-[#e07b39] focus:ring-0 text-sm text-white px-0 py-2 outline-none placeholder:text-zinc-700"
                placeholder="0"
                type="number"
              />
              {errors.stock && <p className="text-[10px] text-red-500">{errors.stock.message}</p>}
            </div>
          </div>
          {watchPrice > 0 && (
            <DynamicPricingSuggestion currentPrice={watchPrice} category={watchCategory} stockQuantity={watchStock} />
          )}
        </div>

        {/* Variants */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-sm">
          <div className="flex items-center justify-between mb-6">
            <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-400">Variants</span>
            <button
              type="button"
              onClick={addVariant}
              className="text-[11px] font-medium uppercase tracking-[0.1rem] text-[#e07b39] hover:text-white transition-colors flex items-center gap-1"
            >
              <Plus size={14} /> Add Variant
            </button>
          </div>
          <div className="space-y-4">
            {variants.map((variant, vi) => (
              <div key={vi} className="p-4 border border-zinc-800 bg-zinc-900/30 space-y-3 rounded-sm">
                <div className="flex items-center gap-3">
                  <input
                    placeholder="Variant name (e.g. Size)"
                    value={variant.name}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[vi].name = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="flex-1 bg-transparent border-0 border-b border-zinc-800 focus:border-[#e07b39] focus:ring-0 text-sm text-white px-0 py-2 outline-none placeholder:text-zinc-700"
                  />
                  <button
                    type="button"
                    onClick={() => setVariants(variants.filter((_, i) => i !== vi))}
                    className="p-2 text-zinc-500 hover:text-red-400 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {variant.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-sm text-zinc-200 rounded-sm">
                      {opt}
                      <button
                        type="button"
                        onClick={() => {
                          const newVariants = [...variants];
                          newVariants[vi].options = variant.options.filter((_, i) => i !== oi);
                          setVariants(newVariants);
                        }}
                        className="text-zinc-400 hover:text-red-400 cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const value = prompt("Enter option value:");
                      if (value) {
                        const newVariants = [...variants];
                        newVariants[vi].options.push(value);
                        setVariants(newVariants);
                      }
                    }}
                    className="px-3 py-1.5 border border-dashed border-zinc-700 text-[10px] text-zinc-400 hover:text-[#e07b39] hover:border-[#e07b39] cursor-pointer uppercase tracking-widest rounded-sm"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bulk Upload */}
        <div className="bg-[#1A1A1A] border border-[#2A2A2A] p-8 rounded-sm">
          <span className="text-[11px] font-medium tracking-[0.1rem] uppercase text-zinc-400 block mb-6">Bulk Upload</span>
          <input
            ref={bulkFileRef}
            type="file"
            accept=".csv,.xlsx"
            className="hidden"
            onChange={handleBulkFile}
          />
          <div className="border-2 border-dashed border-zinc-800 p-8 text-center hover:border-[#e07b39] transition-colors rounded-sm">
            <Upload size={32} className="mx-auto text-zinc-600 mb-3" />
            <p className="text-xs text-zinc-400 mb-1">Upload CSV file to bulk import products</p>
            <p className="text-[9px] text-zinc-700 mb-3">Supports .csv format &mdash; first row must be column headers</p>
            <button
              type="button"
              onClick={() => bulkFileRef.current?.click()}
              className="px-6 py-2 border border-zinc-700 text-zinc-300 text-[11px] font-medium uppercase tracking-[0.1rem] hover:bg-zinc-900 transition-colors rounded-sm"
            >
              Choose File
            </button>
          </div>

          {bulkSuccess && (
            <div className="mt-4 flex items-center gap-2 text-emerald-400 text-xs">
              <CheckCircle size={14} />
              {bulkSuccess}
            </div>
          )}

          {bulkRows.length > 0 && (
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{bulkRows.length} row{bulkRows.length !== 1 ? "s" : ""} parsed</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setBulkRows([])}
                    className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.1rem] text-zinc-500 hover:text-white transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={handleBulkUpload}
                    disabled={bulkUploading}
                    className="px-6 py-2 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-[11px] font-medium uppercase tracking-[0.1rem] hover:opacity-90 transition-all rounded-sm disabled:opacity-60"
                  >
                    {bulkUploading ? "Uploading..." : "Upload All"}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto max-h-64 overflow-y-auto border border-zinc-800 rounded-sm">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50">
                      {Object.keys(bulkRows[0]).map((key) => (
                        <th key={key} className="px-3 py-2 text-[9px] font-medium uppercase tracking-[0.15rem] text-zinc-500 whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {bulkRows.slice(0, 50).map((row, i) => (
                      <tr key={i} className="hover:bg-zinc-900/30">
                        {Object.values(row).map((val, j) => (
                          <td key={j} className="px-3 py-2 text-xs text-zinc-300 whitespace-nowrap">
                            {val || <span className="text-zinc-700">--</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {bulkRows.length > 50 && (
                <p className="text-[10px] text-zinc-600">Showing first 50 of {bulkRows.length} rows</p>
              )}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            data-testid="save-product"
            className="px-8 py-3 bg-gradient-to-br from-[#9a4601] to-[#e07b39] text-white text-[11px] font-medium uppercase tracking-[0.1rem] shadow-xl shadow-[#9a4601]/10 hover:opacity-90 transition-all rounded-sm disabled:opacity-60"
          >
            {loading ? "Publishing..." : "Create Product"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-zinc-400 text-[11px] font-medium uppercase tracking-[0.1rem] hover:text-white transition-colors"
          >
            Discard
          </button>
        </div>
      </form>
    </div>
  );
}
