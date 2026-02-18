"use client";

import { Alert } from "@/components/shared/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useCreateBrand, useUpdateBrand } from "@/hooks/use-brand";
import { useBrandSheet } from "@/hooks/use-brand-sheet";
import { resolveFormError } from "@/lib/api/form-error";
import { cn } from "@/lib/utils";
import {
  brandSchema,
  type BrandFormValues,
} from "@/lib/validations/brand-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangeEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

export function BrandSheet() {
  const { open, mode, defaultValues, editingId, close } = useBrandSheet();
  const isEditMode = mode === "edit";

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      imageUrl: "",
    },
  });

  const {
    formState: { errors },
    setError,
    reset,
  } = form;

  const createMutation = useCreateBrand();
  const updateMutation = useUpdateBrand();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (open) {
      setSubmitError(null);
      const initialName = defaultValues.name ?? "";
      const initialUrl = defaultValues.imageUrl ?? "";

      reset({
        name: initialName,
        imageUrl: initialUrl,
      });

      // Set preview ke image yang sudah ada dari database
      setImagePreview(initialUrl);
      setImageFile(null);
    }
  }, [open, defaultValues, reset]);

  useEffect(() => {
    if (!imageFile) return;
    const objectUrl = URL.createObjectURL(imageFile);
    setImagePreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

  const handleClose = () => {
    reset();
    setImageFile(null);
    setImagePreview("");
    setSubmitError(null);
    close();
  };

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setImageFile(null);
      setImagePreview(defaultValues.imageUrl ?? "");
      return;
    }
    setImageFile(file);
  };

  const onSubmit = async (values: BrandFormValues) => {
    setSubmitError(null);

    // Gabungkan nilai form dengan file (jika ada)
    const payload = {
      ...values,
      imageFile: imageFile, // Bisa bernilai File atau null
    };

    try {
      if (mode === "create") {
        await createMutation.mutateAsync(payload);
      } else if (mode === "edit" && editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: payload,
        });
      }
      handleClose();
    } catch (error) {
      const { message, fieldErrors } = resolveFormError(
        error,
        mode === "create" ? "Failed to create brand" : "Failed to update brand",
      );

      setSubmitError(message);

      if (fieldErrors) {
        Object.entries(fieldErrors).forEach(([field, value]) => {
          setError(field as keyof BrandFormValues, {
            type: "server",
            message: Array.isArray(value)
              ? value.join(", ")
              : (value as string),
          });
        });
      }
    }
  };

  return (
    <Sheet open={open} onOpenChange={(state) => !state && handleClose()}>
      <SheetContent className="w-full sm:max-w-md p-4">
        <SheetHeader>
          <SheetTitle>
            {mode === "create" ? "Add Brand" : "Edit Brand"}
          </SheetTitle>
        </SheetHeader>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            void form.handleSubmit(onSubmit)(e);
          }}
        >
          {submitError && <Alert variant="error">{submitError}</Alert>}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Brand name"
              {...form.register("name")}
              className={cn(errors.name && "border-red-600")}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Brand Image</Label>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded border border-dashed bg-muted/50">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-center text-xs text-muted-foreground">
                    No image
                  </span>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                />
                <p className="text-xs text-muted-foreground">
                  {isEditMode
                    ? "Upload new image to replace current one."
                    : "Upload brand logo/image."}
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting
                ? "Saving..."
                : isEditMode
                  ? "Update Brand"
                  : "Create Brand"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export default BrandSheet;
