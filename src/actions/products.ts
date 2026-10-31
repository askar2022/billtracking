"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  findProductById,
  findProductByName,
  insertProduct,
  updateProductRecord,
} from "@/lib/queries";
import { fieldErrors, productSchema } from "@/lib/validations";

export type SimpleActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

export async function createProduct(
  _prev: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  await requireUser();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const duplicate = await findProductByName(parsed.data.name);
  if (duplicate) {
    return { fieldErrors: { name: "A product with this name already exists." } };
  }

  await insertProduct({
    name: parsed.data.name,
    description: parsed.data.description,
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  return { success: "Product added." };
}

export async function updateProduct(
  id: string,
  _prev: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  await requireUser();
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const product = await findProductById(id);
  if (!product) {
    return { error: "This product was not found." };
  }

  const duplicate = await findProductByName(parsed.data.name, id);
  if (duplicate) {
    return { fieldErrors: { name: "A product with this name already exists." } };
  }

  await updateProductRecord(id, {
    name: parsed.data.name,
    description: parsed.data.description,
  });

  revalidatePath("/products");
  revalidatePath("/dashboard");
  revalidatePath("/transactions");
  return { success: "Product updated." };
}

export async function archiveProduct(id: string) {
  await requireUser();
  const product = await findProductById(id);
  if (!product) {
    return { error: "This product was not found." };
  }
  if (product.isOverhead) {
    return { error: "Shared / LLC overhead stays available for shared costs." };
  }

  await updateProductRecord(id, { archived: true });

  revalidatePath("/products");
  revalidatePath("/transactions");
  return { success: "Product archived." };
}
