import { useState } from "react";
import { Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

const SAMPLES: Record<string, string[]> = {
  en: ["I have had fever and cough for three days", "My chest is paining since morning", "Feeling very weak and dizzy"],
  hi: ["मुझे तीन दिन से बुखार और खांसी है", "सुबह से सीने में दर्द है", "बहुत कमजोरी और चक्कर आ रहे हैं"],
  bn: ["তিন দিন ধরে জ্বর ও কাশি হচ্ছে", "সকাল থেকে বুকে ব্যথা", "খুব দুর্বল লাগছে ও মাথা ঘুরছে"],
};

export function VoiceInputButton({ onResult, label }: { onResult: (text: string) => void; label?: string }) {
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [text, setText] = useState("");

  const start = () => {
    setListening(true);
    setText("");
    const list = SAMPLES[lang] ?? SAMPLES["en"]!;
    const sample = list[Math.floor(Math.random() * list.length)] ?? "";
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setText(sample.slice(0, i));
      if (i >= sample.length) {
        clearInterval(timer);
        setListening(false);
      }
    }, 45);
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="lg"
        className="gap-2"
        onClick={() => {
          setOpen(true);
          setTimeout(start, 350);
        }}
      >
        <Mic className="size-5" />
        {label ?? t("voiceInput")}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("voiceInput")}</DialogTitle>
            <DialogDescription>Simulated speech-to-text for the prototype demo.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-5 py-4">
            <div
              className={`flex size-24 items-center justify-center rounded-full bg-primary/10 text-primary ${listening ? "animate-pulse" : ""}`}
            >
              <Mic className="size-10" />
            </div>
            <p className="min-h-14 rounded-lg bg-muted px-4 py-3 text-center text-lg">
              {text || (listening ? "Listening…" : "Tap speak to start")}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={start} disabled={listening}>
                Speak again
              </Button>
              <Button
                disabled={!text || listening}
                onClick={() => {
                  onResult(text);
                  setOpen(false);
                }}
              >
                Use this text
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
