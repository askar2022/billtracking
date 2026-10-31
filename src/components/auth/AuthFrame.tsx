import { LogoMark } from "@/components/icons";
import { COMPANY_NAME } from "@/lib/constants";

export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center gap-3">
          <LogoMark />
          <div>
            <p className="font-semibold">{COMPANY_NAME}</p>
            <p className="text-sm text-slate-500">Bookkeeping</p>
          </div>
        </div>
        <div className="card p-6">
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mb-5 mt-1 text-sm text-slate-500">{subtitle}</p>
          {children}
        </div>
      </div>
    </div>
  );
}
