"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Upload, Plus, X, ImagePlus } from "lucide-react";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DynamicPricingSuggestion from "@/components/ai/DynamicPricingSuggestion";

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
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState([
    { name: "Size", options: ["S", "M", "L"] },
  ]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ProductForm>();
  const watchPrice = Number(watch("price")) || 0;
  const watchCategory = watch("category") || "Electronics";

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => router.push("/seller/products"), 1500);
  };

  const addVariant = () => {
    setVariants([...variants, { name: "", options: [""] }]);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Add Product</h1>
        <p className="text-sm text-zinc-500 mt-1">Create a new product listing</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input
              label="Product Name"
              id="name"
              {...register("name", { required: "Required" })}
              error={errors.name?.message}
              placeholder="Wireless Headphones Pro"
            />
            <Textarea
              label="Description"
              id="description"
              {...register("description", { required: "Required" })}
              error={errors.description?.message}
              placeholder="Describe your product..."
              rows={4}
            />
            <Select
              label="Category"
              id="category"
              options={categoryOptions}
              {...register("category", { required: "Required" })}
              error={errors.category?.message}
            />
          </div>
        </Card>

        {/* Images */}
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Product Images</h2>
          <div className="grid grid-cols-4 gap-3">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-lg border border-zinc-700 overflow-hidden">
                <img src={img} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setImages([...images, `https://picsum.photos/seed/${Date.now()}/300/300`])}
              className="aspect-square rounded-lg border-2 border-dashed border-zinc-700 flex flex-col items-center justify-center gap-2 text-zinc-500 hover:border-violet-500 hover:text-violet-400 transition-colors cursor-pointer"
            >
              <ImagePlus size={24} />
              <span className="text-xs">Add Image</span>
            </button>
          </div>
        </Card>

        {/* Pricing */}
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Pricing & Inventory</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Input
              label="Price ($)"
              id="price"
              type="number"
              step="0.01"
              {...register("price", { required: "Required" })}
              error={errors.price?.message}
              placeholder="0.00"
            />
            <Input
              label="Compare at Price ($)"
              id="compareAtPrice"
              type="number"
              step="0.01"
              {...register("compareAtPrice")}
              placeholder="0.00"
            />
            <Input
              label="Stock Quantity"
              id="stock"
              type="number"
              {...register("stock", { required: "Required" })}
              error={errors.stock?.message}
              placeholder="0"
            />
          </div>
          {watchPrice > 0 && (
            <DynamicPricingSuggestion currentPrice={watchPrice} category={watchCategory} />
          )}
        </Card>

        {/* Variants */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100">Variants</h2>
            <Button type="button" variant="ghost" size="sm" onClick={addVariant} className="gap-1">
              <Plus size={14} /> Add Variant
            </Button>
          </div>
          <div className="space-y-4">
            {variants.map((variant, vi) => (
              <div key={vi} className="p-4 rounded-lg border border-zinc-800 bg-zinc-800/30 space-y-3">
                <div className="flex items-center gap-3">
                  <Input
                    placeholder="Variant name (e.g. Size)"
                    value={variant.name}
                    onChange={(e) => {
                      const newVariants = [...variants];
                      newVariants[vi].name = e.target.value;
                      setVariants(newVariants);
                    }}
                    className="flex-1"
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
                    <div key={oi} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-700 text-sm text-zinc-200">
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
                    className="px-3 py-1.5 rounded-lg border border-dashed border-zinc-600 text-xs text-zinc-400 hover:text-violet-400 hover:border-violet-500 cursor-pointer"
                  >
                    + Add Option
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Bulk Upload */}
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Bulk Upload</h2>
          <div className="rounded-lg border-2 border-dashed border-zinc-700 p-8 text-center hover:border-violet-500/50 transition-colors">
            <Upload size={32} className="mx-auto text-zinc-500 mb-3" />
            <p className="text-sm text-zinc-400 mb-1">Upload Excel/CSV file to bulk import products</p>
            <p className="text-xs text-zinc-600 mb-3">Supports .xlsx, .csv formats</p>
            <Button type="button" variant="outline" size="sm">Choose File</Button>
          </div>
        </Card>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <Button type="submit" size="lg" isLoading={loading}>Publish Product</Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
