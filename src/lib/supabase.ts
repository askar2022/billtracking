import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const globalForSupabase = globalThis as unknown as {
  supabase?: SupabaseClient<Database>;
};

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}. Add your Supabase project values to .env.`);
  }
  return value;
}

export function getSupabase() {
  if (!globalForSupabase.supabase) {
    globalForSupabase.supabase = createClient<Database>(
      requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
      requiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    );
  }

  return globalForSupabase.supabase;
}

export function throwIfError<T>(
  error: { message: string } | null,
  data: T,
  fallback: string,
): NonNullable<T> {
  if (error) {
    throw new Error(error.message || fallback);
  }
  if (data == null) {
    throw new Error(fallback);
  }
  return data;
}
