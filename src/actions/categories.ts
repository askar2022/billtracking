"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  findCategoryById,
  findCategoryByName,
  insertCategory,
  updateCategoryRecord,
} from "@/lib/queries";
import { categorySchema, fieldErrors } from "@/lib/validations";

export type SimpleActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

export async function createCategory(
  _prev: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  await requireUser();
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const duplicate = await findCategoryByName(parsed.data.name);
  if (duplicate) {
    return { fieldErrors: { name: "A category with this name already exists." } };
  }

  await insertCategory(parsed.data.name);
  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { success: "Category added." };
}

export async function renameCategory(
  id: string,
  _prev: SimpleActionState,
  formData: FormData,
): Promise<SimpleActionState> {
  await requireUser();
  const parsed = categorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const category = await findCategoryById(id);
  if (!category) {
    return { error: "This category was not found." };
  }

  const duplicate = await findCategoryByName(parsed.data.name, id);
  if (duplicate) {
    return { fieldErrors: { name: "A category with this name already exists." } };
  }

  await updateCategoryRecord(id, { name: parsed.data.name });

  revalidatePath("/categories");
  revalidatePath("/transactions");
  revalidatePath("/reports");
  return { success: "Category renamed." };
}

export async function archiveCategory(id: string) {
  await requireUser();
  const category = await findCategoryById(id);
  if (!category) {
    return { error: "This category was not found." };
  }

  await updateCategoryRecord(id, { archived: true });

  revalidatePath("/categories");
  revalidatePath("/transactions");
  return { success: "Category archived." };
}
