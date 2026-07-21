import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Input from "../Input";
import Textarea from "../Textarea";
import Select from "../Select";
import Button from "../Button";
import MultiImageUpload from "./MultiImageUpload";
import ProductStatusBadge from "./ProductStatusBadge";
import sellerService from "../../services/sellerService";
import uploadService from "../../services/uploadService";
import { CATEGORIES, GENDERS, SIZES, BRANDS, CONDITIONS, LOCATIONS } from "../../utils/constants";

const toOptions = (list) => list.map((v) => ({ value: v, label: v }));

// Turns an existing product's image URLs into MultiImageUpload items.
const toImageItems = (images = []) =>
  images.filter(Boolean).map((url, i) => ({
    id: `existing-${i}-${url}`,
    file: null,
    preview: null,
    remoteUrl: url,
    uploading: false,
    error: null,
  }));

export default function ProductForm({ mode, productId, initialValues }) {
  const isEdit = mode === "edit";
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState(() => toImageItems(initialValues?.images));
  const [imagesError, setImagesError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: initialValues?.name || initialValues?.title || "",
      description: initialValues?.description || "",
      category: initialValues?.category || "",
      gender: initialValues?.gender || "",
      size: initialValues?.size || "",
      brand: initialValues?.brand || "",
      color: initialValues?.color || "",
      condition: initialValues?.condition || "",
      price: initialValues?.price ?? "",
      originalPrice: initialValues?.originalPrice ?? "",
      location: initialValues?.location || "",
      stock: initialValues?.stock ?? initialValues?.quantity ?? 1,
    },
  });

  const price = watch("price");

  const uploadPendingImages = async () => {
    const results = [...images];
    for (let i = 0; i < results.length; i++) {
      const item = results[i];
      if (item.remoteUrl || !item.file) continue;

      results[i] = { ...item, uploading: true, error: null };
      setImages([...results]);

      try {
        const { data } = await uploadService.uploadProductImage(item.file);
        const url = data.url || data.imageUrl || data.data?.url || data.location;
        if (!url) throw new Error("No URL returned");
        results[i] = { ...results[i], uploading: false, remoteUrl: url };
      } catch {
        results[i] = { ...results[i], uploading: false, error: "Upload failed" };
        setImages([...results]);
        throw new Error(`Could not upload "${item.file.name}"`);
      }
      setImages([...results]);
    }
    return results;
  };

  const onSubmit = async (formValues) => {
    if (images.length === 0) {
      setImagesError("Add at least one product photo");
      return;
    }
    setImagesError("");

    setSubmitting(true);
    try {
      const uploaded = await uploadPendingImages();
      const imageUrls = uploaded.map((item) => item.remoteUrl).filter(Boolean);

      const payload = {
        ...formValues,
        price: Number(formValues.price),
        originalPrice: formValues.originalPrice ? Number(formValues.originalPrice) : undefined,
        stock: Number(formValues.stock),
        images: imageUrls,
      };

      if (isEdit) {
        await sellerService.updateProduct(productId, payload);
        toast.success("Product updated successfully");
      } else {
        await sellerService.createProduct(payload);
        toast.success("Product submitted for review");
      }
      navigate("/seller/products", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || "Could not save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">
            {isEdit ? "Edit product" : "Add new product"}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {isEdit
              ? "Changes are re-reviewed by an admin before they go live."
              : "New listings are reviewed by an admin before they appear in the shop."}
          </p>
        </div>
        {isEdit && initialValues?.status && <ProductStatusBadge status={initialValues.status} />}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-xl border border-ink-100 bg-white p-5" noValidate>
        <MultiImageUpload value={images} onChange={setImages} error={imagesError} />

        <Input
          label="Product name"
          placeholder="Vintage denim jacket"
          error={errors.name?.message}
          {...register("name", { required: "Product name is required" })}
        />

        <Textarea
          label="Description"
          placeholder="Describe the item's condition, fit, and any details buyers should know"
          error={errors.description?.message}
          {...register("description", {
            required: "Description is required",
            minLength: { value: 20, message: "Add at least 20 characters" },
          })}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Category"
            options={toOptions(CATEGORIES)}
            error={errors.category?.message}
            {...register("category", { required: "Select a category" })}
          />
          <Select
            label="Gender"
            options={GENDERS}
            error={errors.gender?.message}
            {...register("gender", { required: "Select a gender" })}
          />
          <Select
            label="Size"
            options={toOptions(SIZES)}
            error={errors.size?.message}
            {...register("size", { required: "Select a size" })}
          />
          <Select
            label="Brand"
            options={toOptions(BRANDS)}
            error={errors.brand?.message}
            {...register("brand", { required: "Select a brand" })}
          />
          <Input
            label="Color"
            placeholder="Indigo blue"
            error={errors.color?.message}
            {...register("color", { required: "Color is required" })}
          />
          <Select
            label="Condition"
            options={CONDITIONS}
            error={errors.condition?.message}
            {...register("condition", { required: "Select a condition" })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Price (NPR)"
            type="number"
            min="0"
            step="1"
            placeholder="1200"
            error={errors.price?.message}
            {...register("price", {
              required: "Price is required",
              min: { value: 0, message: "Price can't be negative" },
            })}
          />
          <Input
            label="Original price (NPR)"
            type="number"
            min="0"
            step="1"
            placeholder="Optional — shows a discount badge"
            error={errors.originalPrice?.message}
            {...register("originalPrice", {
              validate: (value) =>
                !value || Number(value) >= Number(price || 0) || "Should be at least the selling price",
            })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Location"
            options={toOptions(LOCATIONS)}
            error={errors.location?.message}
            {...register("location", { required: "Select a location" })}
          />
          <Input
            label="Stock quantity"
            type="number"
            min="0"
            step="1"
            placeholder="1"
            error={errors.stock?.message}
            {...register("stock", {
              required: "Stock quantity is required",
              min: { value: 0, message: "Stock can't be negative" },
            })}
          />
        </div>

        <div className="space-y-2 pt-2">
          <Button loading={submitting}>{isEdit ? "Save changes" : "Submit for review"}</Button>
          <button
            type="button"
            onClick={() => navigate("/seller/products")}
            className="w-full text-center text-sm font-medium text-ink-500 hover:text-ink-700"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
