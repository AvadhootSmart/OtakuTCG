import { Sparkles } from "lucide-react";

export const FeaturedBundle = () => {
  return (
    <div className="relative rounded-3xl overflow-hidden bg-foreground text-background mb-16 p-8 md:p-12">
      <div className="relative z-10 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-background/10 border border-background/20 text-[10px] font-black uppercase tracking-widest mb-6">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Special Event
        </div>
        <h2 className="text-4xl md:text-5xl font-black rock-salt leading-tight mb-4">
          Ancestral <span className="text-amber-400">Legends</span> Expansion
        </h2>
        <p className="text-lg opacity-80 mb-8 leading-relaxed">
          A limited-time release featuring the legendary warriors of the Silver
          Era. Get higher chances for Legendary drops this week only!
        </p>
        <button className="px-8 py-4 bg-background text-foreground font-black rounded-xl hover:opacity-90 transition-opacity uppercase tracking-tighter">
          View Bundle
        </button>
      </div>

      {/* Abstract background elements */}
      <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border-[50px] border-background rounded-full" />
        <div className="absolute top-1/4 right-1/4 w-[200px] h-[200px] border-[20px] border-background rounded-full" />
      </div>
    </div>
  );
};

