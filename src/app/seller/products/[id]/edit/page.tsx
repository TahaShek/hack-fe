"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { mockProducts } from "@/lib/mock-data";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import DynamicPricingSuggestion from "@/components/ai/DynamicPricingSuggestion";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const product = mockProducts.find((p) => p.id === id) || mockProducts[0];
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      name: product.name,
      description: product.description,
      category: product.category.toLowerCase().replace(/ & /g, "-"),
      price: String(product.price),
      compareAtPrice: String(product.compareAtPrice || ""),
      stock: String(product.stock),
    },
  });

  const watchPrice = Number(watch("price")) || 0;

  const onSubmit = () => {
    setLoading(true);
    setTimeout(() => router.push("/seller/products"), 1500);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-zinc-100">Edit Product</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <Input label="Product Name" id="name" {...register("name")} />
            <Textarea label="Description" id="description" {...register("description")} rows={4} />
            <Select
              label="Category"
              id="category"
              options={[
                { label: "Electronics", value: "electronics" },
                { label: "Fashion", value: "fashion" },
                { label: "Home & Garden", value: "home-garden" },
                { label: "Sports", value: "sports" },
              ]}
              {...register("category")}
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Pricing & Inventory</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <Input label="Price ($)" id="price" type="number" step="0.01" {...register("price")} />
            <Input label="Compare at Price ($)" id="compareAtPrice" type="number" step="0.01" {...register("compareAtPrice")} />
            <Input label="Stock" id="stock" type="number" {...register("stock")} />
          </div>
          {watchPrice > 0 && <DynamicPricingSuggestion currentPrice={watchPrice} category={product.category} />}
        </Card>

        <div className="flex gap-3">
          <Button type="submit" size="lg" isLoading={loading}>Update Product</Button>
          <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
        </div>
      </form>
    </div>
  );
}
