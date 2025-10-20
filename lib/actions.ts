"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { redirect } from "next/navigation";

const ProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
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
        ...deleteProduct,
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

export const createProduct = async (formData: FormData) => {
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

  const parsed = ProductSchema.safeParse({
    name: formData.get("name"),
    price: formData.get("price"),
    quantity: formData.get("quantity"),
    sku: formData.get("sku") || undefined,
    lowStockAt: formData.get("lowStockAt") || undefined,
  });

  if (!parsed.success) {
    throw new Error("Validation failed");
  }
  try {
    const newProduct = await prisma.product.create({
      data: { ...parsed.data, userId: session.user.id },
    });

    revalidatePath("/inventory");
    return JSON.parse(
      JSON.stringify({
        ...newProduct,
        error: "",
        status: "SUCCESS",
      }),
    );
  } catch (e) {
    return JSON.parse(
      JSON.stringify({
        error: "Failed to create product",
        status: "ERROR",
      }),
    );
  }
};
