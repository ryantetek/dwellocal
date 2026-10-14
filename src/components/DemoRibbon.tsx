import { Link } from "react-router-dom";

export function DemoRibbon() {
  return (
    <div className="pointer-events-none fixed right-0 top-0 z-[60] h-40 w-40 overflow-hidden">
      <Link
        to="/demo"
        className="pointer-events-auto absolute -right-[4.25rem] top-7 w-56 rotate-45 bg-[#30483B] py-2 text-center text-white shadow-sm hover:bg-[#26382e]"
      >
        <span className="block text-[10px] font-semibold uppercase tracking-[0.16em]">Sample Page</span>
        <span className="mt-0.5 block text-[11px] font-medium tracking-wide underline underline-offset-2">
          Back to Demo
        </span>
      </Link>
    </div>
  );
}
