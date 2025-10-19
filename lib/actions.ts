"use server";

import { headers } from "next/headers";
import { auth } from "./auth";
import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

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
    await prisma.product.delete({
      where: {
        id: productId,
        userId: session?.user.id,
      },
    });
    revalidatePath("/inventory");
    return JSON.parse(
      JSON.stringify({
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
