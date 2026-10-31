"use server";

import { redirect } from "next/navigation";
import {
  clearSession,
  createSession,
  hashPassword,
  userCount,
  verifyPassword,
} from "@/lib/auth";
import { createUser, findUserByEmail } from "@/lib/queries";
import { mapUser } from "@/lib/types";
import { authSchema, fieldErrors, setupSchema } from "@/lib/validations";

export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function setupOwner(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if ((await userCount()) > 0) {
    return { error: "An owner account already exists. Sign in instead." };
  }

  const parsed = setupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const row = await createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
    role: "owner",
  });
  const user = mapUser(row);

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  redirect("/dashboard");
}

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrors(parsed.error) };
  }

  const row = await findUserByEmail(parsed.data.email);
  const user = row ? mapUser(row) : null;

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
  redirect("/dashboard");
}

export async function logout() {
  await clearSession();
  redirect("/login");
}
