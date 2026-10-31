export function friendlyError(error: unknown, fallback: string) {
  const message = error instanceof Error ? error.message : fallback;
  const lower = message.toLowerCase();

  if (lower.includes("auth_secret")) {
    return "Add AUTH_SECRET in Vercel environment variables. Use any random string at least 32 characters long.";
  }
  if (lower.includes("missing next_public_supabase_url") || lower.includes("missing supabase_service_role_key")) {
    return "Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel. Use the service_role key, not the anon key.";
  }
  if (lower.includes("row-level security") || lower.includes("rls")) {
    return "Supabase blocked the save. In Vercel, set SUPABASE_SERVICE_ROLE_KEY to the service_role key, not the anon/public key.";
  }
  if (lower.includes("could not find the table") || lower.includes("relation") || lower.includes("does not exist")) {
    return "The Supabase tables are missing. Run supabase/schema.sql in the Supabase SQL editor.";
  }
  if (lower.includes("invalid api key") || lower.includes("jwt")) {
    return "The Supabase key is invalid. Paste the service_role key from Project Settings → API.";
  }

  return message || fallback;
}
