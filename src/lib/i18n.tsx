import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "en" | "hi" | "bn";

type Dict = Record<string, string>;

const en: Dict = {
  appName: "AROGYALINK",
  tagline: "Connecting Rural Communities to Better Healthcare",
  getStarted: "Get Started",
  emergencyHelp: "Emergency Help",
  home: "Home",
  dashboard: "Dashboard",
  triage: "Health Assessment",
  facilities: "Find Facility",
  telemedicine: "Telemedicine",
  referrals: "Referrals",
  records: "Health Records",
  register: "Register Patient",
  login: "Login",
  logout: "Logout",
  patient: "Patient",
  healthWorker: "ASHA Worker",
  doctor: "Doctor",
  admin: "Admin",
  symptoms: "Symptoms",
  severity: "Severity",
  duration: "Duration",
  submit: "Submit",
  riskLevel: "Risk Level",
  recommendedAction: "Recommended Action",
  online: "Online",
  offline: "Offline",
  voiceInput: "Voice Input",
  save: "Save",
  cancel: "Cancel",
  bookAppointment: "Book Appointment",
  disclaimer:
    "This assessment is preliminary decision support and is not a medical diagnosis. Always consult a qualified healthcare professional.",
};

const hi: Dict = {
  appName: "आरोग्यलिंक",
  tagline: "ग्रामीण समुदायों को बेहतर स्वास्थ्य सेवा से जोड़ना",
  getStarted: "शुरू करें",
  emergencyHelp: "आपातकालीन सहायता",
  home: "होम",
  dashboard: "डैशबोर्ड",
  triage: "स्वास्थ्य आकलन",
  facilities: "अस्पताल खोजें",
  telemedicine: "टेलीमेडिसिन",
  referrals: "रेफरल",
  records: "स्वास्थ्य रिकॉर्ड",
  register: "रोगी पंजीकरण",
  login: "लॉगिन",
  logout: "लॉगआउट",
  patient: "रोगी",
  healthWorker: "आशा कार्यकर्ता",
  doctor: "डॉक्टर",
  admin: "प्रशासक",
  symptoms: "लक्षण",
  severity: "गंभीरता",
  duration: "अवधि",
  submit: "जमा करें",
  riskLevel: "जोखिम स्तर",
  recommendedAction: "अनुशंसित कदम",
  online: "ऑनलाइन",
  offline: "ऑफलाइन",
  voiceInput: "आवाज़ से भरें",
  save: "सहेजें",
  cancel: "रद्द करें",
  bookAppointment: "अपॉइंटमेंट बुक करें",
  disclaimer:
    "यह आकलन केवल प्रारंभिक सहायता है, चिकित्सा निदान नहीं। कृपया योग्य चिकित्सक से सलाह लें।",
};

const bn: Dict = {
  appName: "আরোগ্যলিংক",
  tagline: "গ্রামীণ জনগোষ্ঠীকে উন্নত স্বাস্থ্যসেবার সঙ্গে যুক্ত করা",
  getStarted: "শুরু করুন",
  emergencyHelp: "জরুরি সহায়তা",
  home: "হোম",
  dashboard: "ড্যাশবোর্ড",
  triage: "স্বাস্থ্য মূল্যায়ন",
  facilities: "হাসপাতাল খুঁজুন",
  telemedicine: "টেলিমেডিসিন",
  referrals: "রেফারেল",
  records: "স্বাস্থ্য রেকর্ড",
  register: "রোগী নিবন্ধন",
  login: "লগইন",
  logout: "লগআউট",
  patient: "রোগী",
  healthWorker: "আশা কর্মী",
  doctor: "ডাক্তার",
  admin: "প্রশাসক",
  symptoms: "উপসর্গ",
  severity: "তীব্রতা",
  duration: "সময়কাল",
  submit: "জমা দিন",
  riskLevel: "ঝুঁকির মাত্রা",
  recommendedAction: "প্রস্তাবিত পদক্ষেপ",
  online: "অনলাইন",
  offline: "অফলাইন",
  voiceInput: "কণ্ঠস্বর ইনপুট",
  save: "সংরক্ষণ",
  cancel: "বাতিল",
  bookAppointment: "অ্যাপয়েন্টমেন্ট বুক করুন",
  disclaimer:
    "এই মূল্যায়ন প্রাথমিক সহায়তা মাত্র, কোনো চিকিৎসা নির্ণয় নয়। অনুগ্রহ করে যোগ্য চিকিৎসকের পরামর্শ নিন।",
};

const dicts: Record<Lang, Dict> = { en, hi, bn };

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "bn", label: "বাংলা" },
];

interface I18nValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof en | string) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("arogyalink.lang") as Lang | null;
    if (stored && dicts[stored]) setLang(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem("arogyalink.lang", lang);
  }, [lang]);

  const t = (key: string) => dicts[lang][key] ?? en[key] ?? key;

  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
