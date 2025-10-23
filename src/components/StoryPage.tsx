import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";

interface StoryPageProps {
  categoryName: string;
  fullStory: string;
  onBack: () => void;
  onBackToLanding: () => void;
}

export function StoryPage({ 
  categoryName, 
  fullStory, 
  onBack, 
  onBackToLanding 
}: StoryPageProps) {
  return (
    <div className="bg-[#fbf7e8] min-h-screen w-full">
      {/* Header */}
      <header className="bg-[#5c0108] h-[95px] flex items-center justify-center relative">
        <button
          onClick={onBackToLanding}
          className="absolute left-[16px] text-[#d4af37] hover:text-[#e8d4a2] transition-colors"
          aria-label="Menu"
        >
          <ArrowLeft className="w-[24px] h-[24px]" />
        </button>
        
        <p className="font-['Libre_Baskerville',_sans-serif] italic text-[#fbf7e8] text-[20px] tracking-[0.36px]">
          Menu Especial de Natal 2025
        </p>
      </header>

      {/* Content */}
      <main className="px-[16px] py-[24px] max-w-[440px] mx-auto">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-[8px] mb-[16px] text-[#5c0108] hover:text-[#7c1c3d] transition-colors"
        >
          <ArrowLeft className="w-[18px] h-[18px]" />
          <span className="font-['Libre_Baskerville',_sans-serif] text-[13px]">
            Voltar
          </span>
        </button>
        
        {/* Category Title */}
        <div className="mb-[24px]">
          <h1 className="font-['Libre_Baskerville',_sans-serif] text-[rgb(92,1,8)] text-[25px] leading-[30px] mb-[12px]">
            {categoryName}
          </h1>
          <div className="bg-[#d4af37] h-[2px] w-full" />
        </div>

        {/* Story Content Box */}
        <div className="border border-[#d4af37] rounded-[14px] overflow-hidden">
          <ScrollArea className="h-[calc(100vh-300px)] min-h-[400px]">
            <div className="p-[18px]">
              <div className="font-['Libre_Baskerville',_sans-serif] text-[#5c0108] text-[16.5px] leading-[30px] whitespace-pre-line">
                {fullStory}
              </div>
            </div>
          </ScrollArea>
        </div>
      </main>
    </div>
  );
}
