"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { ActionResponse, ProductFormData } from "@/app/(user)/add-product/page";

const ProductSchema = z.object({
  name: z.string().min(3, "Name is required"),
  price: z.coerce.number().nonnegative("Price must be non-negative"),
  quantity: z.coerce.number().int().min(0, "Quantity must be non-negative"),
  sku: z.string().optional(),
  lowStockAt: z.coerce.number().int().min(0).optional(),
});

export const deleteProduct = async (formData: FormData) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return JSON.parse(
      JSON.stringify({
        error: "UNAUTHORIZED",
        status: "ERROR",
      }),
    );
  }

  try {
    const productId = (formData.get("id") as string) || "";
    const deletedProduct = await prisma.product.delete({
      where: {
        id: productId,
        userId: session?.user.id,
      },
    });
    revalidatePath("/inventory");
    return JSON.parse(
      JSON.stringify({
        ...deletedProduct,
        error: "",
        status: "SUCCESS",
      }),
    );
  } catch (e: unknown) {
    return JSON.parse(
      JSON.stringify({
        error: "Failed to delete Startup",
        status: "ERROR",
      }),
    );
  } finally {
    revalidatePath("/inventory");
  }
};

export const createProduct = async (
  prevState: ActionResponse | null,
  formData: FormData,
): Promise<ActionResponse> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return JSON.parse(
      JSON.stringify({
        success: false,
        message: "UNAUTHORIZED",
      }),
    );
  }
  const rawData: ProductFormData = {
    name: formData.get("name") as string,
    price: formData.get("price") as string,
    quantity: formData.get("quantity") as string,
    SKU: (formData.get("sku") as string) || undefined,
    lowStockAt: (formData.get("lowStockAt") as string) || undefined,
  };
  const parsed = ProductSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      inputs: rawData,
      success: false,
      message: "Please fix the errors in the form",
      errors: parsed.error.flatten().fieldErrors,
    };
  }
  try {
    const newProduct = await prisma.product.create({
      data: { ...parsed.data, userId: session.user.id },
    });

    revalidatePath("/inventory");
    return JSON.parse(
      JSON.stringify({
        ...newProduct,
        success: true,
        message: "Product Created Successfully!",
      }),
    );
  } catch (e) {
    return JSON.parse(
      JSON.stringify({
        success: true,
        message: "An unexpected error occurred",
      }),
    );
  }
};
