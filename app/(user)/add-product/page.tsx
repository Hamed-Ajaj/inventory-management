"use client";

import { createProduct } from "@/lib/actions";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useActionState } from "react";
import { ProductSchema } from "@/app/schemas/product-schema";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ProductFormData {
  name: string;
  price: string;
  quantity: string;
  SKU?: string;
  lowStockAt?: string;
}
export interface ActionResponse {
  success: boolean;
  message: string;
  errors?: {
    [K in keyof ProductFormData]?: string[];
  };
  inputs?: ProductFormData;
}

export default function AddProductPage() {
  const initialState: ActionResponse = {
    success: false,
    message: "",
  };

  const { data, isPending: sessionPending } = useSession();
  if (!data?.session && !sessionPending) {
    redirect("/sign-in");
  }

  const [state, action, isPending] = useActionState(
    createProduct,
    initialState,
  );

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="page-title">Add Product</h1>
            <p className="page-description">
              Add new products to your inventory.
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-2xl ">
        <div className="bg-white rounded-lg border border-gray-200 p-6 ">
          <form className="space-y-6" action={action}>
            <div>
              <label
                htmlFor="name"
                className={cn(
                  "block text-sm font-medium text-gray-700 mb-2",
                  state.errors?.name && "text-red-500",
                )}
              >
                Product Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                defaultValue={state.inputs?.name}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                placeholder="Enter Product Name"
              />
              {state?.errors?.name && (
                <p id="streetAddress-error" className="text-sm text-red-500">
                  {state.errors.name[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="quantity"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Quantity *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="0"
                  required
                  defaultValue={state.inputs?.quantity}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                  placeholder="0"
                />

                {state?.errors?.quantity && (
                  <p id="streetAddress-error" className="text-sm text-red-500">
                    {state.errors.quantity[0]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={state.inputs?.price}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                  placeholder="0.0"
                />
                {state?.errors?.price && (
                  <p id="streetAddress-error" className="text-sm text-red-500">
                    {state.errors.price[0]}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                SKU (optional)
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                defaultValue={state.inputs?.SKU}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                placeholder="Enter SKU"
              />
              {state?.errors?.SKU && (
                <p id="streetAddress-error" className="text-sm text-red-500">
                  {state.errors.SKU[0]}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lowStockAt"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Low Stock At (optional)
              </label>
              <input
                type="number"
                id="lowStockAt"
                name="lowStockAt"
                min="0"
                defaultValue={state.inputs?.lowStockAt}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-transparent"
                placeholder="Enter low stock threshold"
              />

              {state?.errors?.lowStockAt && (
                <p id="streetAddress-error" className="text-sm text-red-500">
                  {state.errors.lowStockAt[0]}
                </p>
              )}
            </div>

            <div className="flex gap-5">
              <button
                type="submit"
                className={cn(
                  "px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700",
                  isPending && "bg-purple-400 cursor-not-allowed",
                )}
                disabled={isPending}
              >
                {isPending ? "adding..." : "Add Product"}
              </button>
              <Link
                href="/inventory"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
