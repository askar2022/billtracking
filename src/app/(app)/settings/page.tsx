import { SettingsForm } from "@/components/settings/SettingsForm";
import { requireUser } from "@/lib/auth";

export const metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const user = await requireUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update the owner account used to sign in to Automation LLC bookkeeping.
        </p>
      </div>
      <SettingsForm name={user.name} email={user.email} />
      <div className="max-w-xl text-sm text-slate-500">
        <p>
          This app is for recordkeeping. It does not decide whether a cost is deductible
          or how hardware should be depreciated.
        </p>
      </div>
    </div>
  );
}
