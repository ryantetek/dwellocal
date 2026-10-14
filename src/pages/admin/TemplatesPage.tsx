import { toast } from "sonner";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useDemo } from "@/contexts/DemoContext";
import { useProperties } from "@/contexts/PropertyContext";
import { TEMPLATE_META, isProTemplate } from "@/lib/templates";
import { supabase } from "@/lib/supabase";

export function TemplatesPage() {
  const { current, refresh } = useProperties();
  const { plan } = useAuth();
  const { isDemo } = useDemo();
  const catalog = isDemo ? TEMPLATE_META.filter((tpl) => tpl.tier === "free") : TEMPLATE_META;

  async function select(id: string) {
    if (isDemo) return toast.message("Demo is read-only.");
    if (isProTemplate(id) && !plan.allTemplates) {
      toast.error("Upgrade to Pro to use this template.");
      return;
    }
    if (!supabase || !current) return;
    const { error } = await supabase.from("properties").update({ template: id }).eq("id", current.id);
    if (error) toast.error(error.message);
    else {
      toast.success("Template updated");
      await refresh();
    }
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold">Templates</h1>
      <p className="text-sm text-slate-500">Current: {current?.template}</p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {catalog.map((tpl) => {
          const locked = !isDemo && tpl.tier === "pro" && !plan.allTemplates;
          return (
            <div key={tpl.id} className="overflow-hidden rounded-[16px] border border-slate-200 bg-white">
              <img src={tpl.preview} alt="" className="h-36 w-full bg-slate-100 object-cover" />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-semibold">{tpl.name}</h3>
                  {tpl.tier === "free" ? <Badge className="bg-slate-100 text-slate-700">Included</Badge> : <Badge className="bg-slate-800 text-white">Pro</Badge>}
                </div>
                <p className="mt-2 text-sm text-slate-500">{tpl.description}</p>
                {locked ? (
                  <Button asChild size="sm" variant="slate" className="mt-3">
                    <Link to="/admin/upgrade">Upgrade</Link>
                  </Button>
                ) : (
                  <Button size="sm" variant="slate-outline" className="mt-3" onClick={() => void select(tpl.id)}>
                    Use {tpl.name}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
