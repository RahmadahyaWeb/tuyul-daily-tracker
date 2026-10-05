import { LogoIcon } from "@/components/brand/Logo";

export default function RootLoading() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#FAF8F5]">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-bounce">
          <LogoIcon className="w-8 h-8" />
        </div>
        <span className="text-xs text-[#8a7b68] font-bold font-pixel tracking-widest uppercase">
          LOADING DITUYULIN...
        </span>
      </div>
    </div>
  );
}
