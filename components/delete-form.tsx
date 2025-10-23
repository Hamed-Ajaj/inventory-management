"use client";

import { ActionResponse } from "@/app/(user)/add-product/page";
import { deleteProduct } from "@/lib/actions";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

const initialState: ActionResponse = {
  success: false,
  message: "",
};

const DeleteForm = ({ productId }: { productId: string }) => {
  const [state, action, isPending] = useActionState(
    deleteProduct,
    initialState,
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
    } else if (state.message && !state.success) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={action}>
      <input type="hidden" name="id" value={productId} />
      <button
        className={` cursor-pointer ${isPending ? "text-red-300 cursor-not-allowed" : "text-red-600 hover:text-red-900"}`}
        disabled={isPending}
      >
        Delete
      </button>
    </form>
  );
};

export default DeleteForm;
