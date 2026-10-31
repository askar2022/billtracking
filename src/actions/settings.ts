"use server";

import { revalidatePath } from "next/cache";
import {
  createSession,
  hashPassword,
  requireUser,
  verifyPassword,
} from "@/lib/auth";
import { findUserByEmail, findUserById, updateUser } from "@/lib/queries";
import { mapUser } from "@/lib/types";
import { fieldErrors, settingsSchema } from "@/lib/validations";

export type SettingsState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

export async function updateSettings(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const session = await requireUser();
  const parsed = settingsSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    currentPassword: formData.get("currentPassword") || undefined,
    newPassword: formData.get("newPassword") || undefined,
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const row = await findUserById(session.id);
  if (!row) {
    return { error: "Your account was not found." };
  }
  const user = mapUser(row);

  if (parsed.data.email !== user.email) {
    const taken = await findUserByEmail(parsed.data.email);
    if (taken) {
      return { fieldErrors: { email: "That email is already in use." } };
    }
  }

  let passwordHash = user.passwordHash;
  if (parsed.data.newPassword) {
    const matches = await verifyPassword(parsed.data.currentPassword ?? "", user.passwordHash);
    if (!matches) {
      return { fieldErrors: { currentPassword: "Current password is incorrect." } };
    }
    passwordHash = await hashPassword(parsed.data.newPassword);
  }

  const updatedRow = await updateUser(user.id, {
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
  });
  const updated = mapUser(updatedRow);

  await createSession({
    id: updated.id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Settings saved." };
}
