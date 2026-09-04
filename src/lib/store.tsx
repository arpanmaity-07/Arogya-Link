import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ASSESSMENTS,
  CONSULTATIONS,
  DOCTORS,
  FACILITIES,
  PATIENTS,
  RECORDS,
  REFERRALS,
} from "./mock-data";
import type {
  Assessment,
  Consultation,
  HealthRecord,
  Patient,
  Referral,
  ReferralStatus,
  Role,
} from "./types";

export interface SessionUser {
  role: Role;
  name: string;
  patientId?: string;
  facility?: string;
}

export const DEMO_ACCOUNTS: Record<Role, SessionUser & { hint: string; email: string; password: string }> = {
  patient: {
    role: "patient",
    name: "Rekha Mondal",
    patientId: "P1",
    email: "rekha@demo.in",
    password: "1234",
    hint: "rekha@demo.in / 1234",
  },
  asha: {
    role: "asha",
    name: "Sunita Bibi",
    facility: "Jangipur PHC",
    email: "sunita@demo.in",
    password: "1234",
    hint: "sunita@demo.in / 1234",
  },
  doctor: {
    role: "doctor",
    name: "Dr. Ananya Sharma",
    facility: "Murshidabad District Hospital",
    email: "ananya@demo.in",
    password: "1234",
    hint: "ananya@demo.in / 1234",
  },
  admin: {
    role: "admin",
    name: "District Health Officer",
    email: "admin@demo.in",
    password: "1234",
    hint: "admin@demo.in / 1234",
  },
};

export const ROLE_HOME: Record<Role, string> = {
  patient: "/dashboard",
  asha: "/asha",
  doctor: "/doctor",
  admin: "/admin",
};

interface StoreValue {
  user: SessionUser | null;
  login: (role: Role) => void;
  signIn: (email: string, password: string, role?: Role) => SessionUser | null;
  logout: () => void;
  patients: Patient[];
  doctors: typeof DOCTORS;
  facilities: typeof FACILITIES;
  referrals: Referral[];
  consultations: Consultation[];
  assessments: Assessment[];
  records: HealthRecord[];
  online: boolean;
  toggleOnline: () => void;
  syncing: boolean;
  pendingCount: number;
  syncNow: () => void;
  addPatient: (p: Omit<Patient, "id" | "healthId" | "createdAt" | "risk">) => Patient;
  addAssessment: (a: Omit<Assessment, "id" | "createdAt">) => Assessment;
  addReferral: (r: Omit<Referral, "id" | "createdAt" | "status">) => Referral;
  advanceReferral: (id: string) => void;
  addConsultation: (c: Omit<Consultation, "id" | "status">) => Consultation;
  completeConsultation: (id: string, notes: string, prescription: string, followUp: string) => void;
  addRecord: (r: Omit<HealthRecord, "id">) => void;
  patientById: (id: string) => Patient | undefined;
}

const StoreContext = createContext<StoreValue | null>(null);

const STORAGE_KEY = "arogyalink.state.v1";
const today = () => new Date().toISOString().slice(0, 10);
const rid = (p: string) => `${p}${Math.floor(100000 + Math.random() * 899999)}`;

const REFERRAL_FLOW: ReferralStatus[] = [
  "Created",
  "Accepted",
  "Patient Traveling",
  "Arrived",
  "Treatment Started",
  "Completed",
];

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [patients, setPatients] = useState<Patient[]>(PATIENTS);
  const [referrals, setReferrals] = useState<Referral[]>(REFERRALS);
  const [consultations, setConsultations] = useState<Consultation[]>(CONSULTATIONS);
  const [assessments, setAssessments] = useState<Assessment[]>(ASSESSMENTS);
  const [records, setRecords] = useState<HealthRecord[]>(RECORDS);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.user) setUser(s.user);
        if (s.patients) setPatients(s.patients);
        if (s.referrals) setReferrals(s.referrals);
        if (s.consultations) setConsultations(s.consultations);
        if (s.assessments) setAssessments(s.assessments);
        if (s.records) setRecords(s.records);
      }
    } catch {
      /* ignore corrupt local cache */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ user, patients, referrals, consultations, assessments, records }),
    );
  }, [hydrated, user, patients, referrals, consultations, assessments, records]);

  const pendingCount = patients.filter((p) => p.pendingSync).length;

  const syncNow = useCallback(() => {
    setSyncing(true);
    setTimeout(() => {
      setPatients((prev) => prev.map((p) => ({ ...p, pendingSync: false })));
      setSyncing(false);
    }, 1600);
  }, []);

  const value: StoreValue = useMemo(
    () => ({
      user,
      login: (role) => {
        const { hint: _hint, email: _e, password: _p, ...u } = DEMO_ACCOUNTS[role];
        setUser(u);
      },
      signIn: (email, password, role) => {
        const match = (Object.values(DEMO_ACCOUNTS) as (SessionUser & {
          hint: string;
          email: string;
          password: string;
        })[]).find(
          (a) =>
            a.email.toLowerCase() === email.trim().toLowerCase() &&
            a.password === password.trim() &&
            (!role || a.role === role),
        );
        if (!match) return null;
        const { hint: _hint, email: _e, password: _p, ...u } = match;
        setUser(u);
        return u;
      },
      logout: () => setUser(null),
      patients,
      doctors: DOCTORS,
      facilities: FACILITIES,
      referrals,
      consultations,
      assessments,
      records,
      online,
      toggleOnline: () => setOnline((o) => !o),
      syncing,
      pendingCount,
      syncNow,
      patientById: (id) => patients.find((p) => p.id === id),
      addPatient: (p) => {
        const patient: Patient = {
          ...p,
          id: rid("P-"),
          healthId: `SW-2026-${Math.floor(100000 + Math.random() * 899999)}`,
          risk: "LOW",
          createdAt: today(),
          pendingSync: !online,
        };
        setPatients((prev) => [patient, ...prev]);
        return patient;
      },
      addAssessment: (a) => {
        const assessment: Assessment = { ...a, id: rid("A-"), createdAt: today() };
        setAssessments((prev) => [assessment, ...prev]);
        setPatients((prev) => prev.map((p) => (p.id === a.patientId ? { ...p, risk: a.risk } : p)));
        setRecords((prev) => [
          {
            id: rid("R-"),
            patientId: a.patientId,
            type: "Assessment",
            title: `AI triage — ${a.risk} risk`,
            detail: `${a.symptoms.join(", ")} · severity ${a.severity}/10 · ${a.action}`,
            date: today(),
          },
          ...prev,
        ]);
        return assessment;
      },
      addReferral: (r) => {
        const referral: Referral = {
          ...r,
          id: `REF-SW-2026-${Math.floor(10000 + Math.random() * 89999)}`,
          status: "Created",
          createdAt: today(),
        };
        setReferrals((prev) => [referral, ...prev]);
        setRecords((prev) => [
          {
            id: rid("R-"),
            patientId: r.patientId,
            type: "Referral",
            title: `${referral.id} created`,
            detail: `${r.fromFacility} → ${r.toFacility} · ${r.reason}`,
            date: today(),
          },
          ...prev,
        ]);
        return referral;
      },
      advanceReferral: (id) =>
        setReferrals((prev) =>
          prev.map((r) => {
            if (r.id !== id) return r;
            const next =
              REFERRAL_FLOW[Math.min(REFERRAL_FLOW.indexOf(r.status) + 1, REFERRAL_FLOW.length - 1)] ?? r.status;
            return { ...r, status: next };
          }),
        ),
      addConsultation: (c) => {
        const consult: Consultation = { ...c, id: rid("C-"), status: "Scheduled" };
        setConsultations((prev) => [consult, ...prev]);
        setRecords((prev) => [
          {
            id: rid("R-"),
            patientId: c.patientId,
            type: "Consultation",
            title: `Appointment booked with ${c.doctorName}`,
            detail: `${c.date} at ${c.slot} · ${c.mode}`,
            date: today(),
          },
          ...prev,
        ]);
        return consult;
      },
      completeConsultation: (id, notes, prescription, followUp) => {
        setConsultations((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: "Completed", notes, prescription, followUp } : c)),
        );
        const c = consultations.find((x) => x.id === id);
        if (c) {
          setRecords((prev) => [
            {
              id: rid("R-"),
              patientId: c.patientId,
              type: "Prescription",
              title: `Prescription by ${c.doctorName}`,
              detail: `${prescription} · Notes: ${notes} · Follow-up: ${followUp}`,
              date: today(),
            },
            ...prev,
          ]);
        }
      },
      addRecord: (r) => setRecords((prev) => [{ ...r, id: rid("R-") }, ...prev]),
    }),
    [user, patients, referrals, consultations, assessments, records, online, syncing, pendingCount, syncNow],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export { REFERRAL_FLOW };
