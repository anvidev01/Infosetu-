/**
 * app/apply/[service]/page.tsx — Multi-step Application Form (4 steps)
 * GIGW 3.0 · WCAG 2.2 AA · DPDP Act 2023
 * Step 1: Personal Info → Step 2: Documents → Step 3: Review → Step 4: Submit
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Stepper from "@/components/form/Stepper";
import FormField from "@/components/form/FormField";
import AadhaarInput from "@/components/form/AadhaarInput";
import ReviewSummary from "@/components/form/ReviewSummary";
import Toast from "@/components/ui/Toast";

/* ── Types ─────────────────────────────────────────────────── */
interface FormData {
    /* Step 1 — Personal */
    fullName: string; dob: string; gender: string;
    mobile: string; email: string; aadhaar: string;
    /* Step 2 — Address */
    address: string; city: string; state: string; pincode: string;
    /* Step 3 — Document upload (filenames) */
    idProof: string; addressProof: string;
}

interface Errors { [key: string]: string }

const STEPS = [
    { label: "Personal Info", description: "Name, DOB, contact" },
    { label: "Address", description: "Residential address" },
    { label: "Documents", description: "Upload proofs" },
    { label: "Review & Submit", description: "Confirm & submit" },
];

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Delhi", "Jammu & Kashmir", "Ladakh",
];

const INITIAL: FormData = {
    fullName: "", dob: "", gender: "", mobile: "", email: "", aadhaar: "",
    address: "", city: "", state: "", pincode: "",
    idProof: "", addressProof: "",
};

function generateCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateARN(): string {
    return `ARN-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
}

export default function ApplyPage() {
    const params = useParams();
    const router = useRouter();
    const service = typeof params.service === "string" ? params.service : "";
    const serviceLabel = service.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const [step, setStep] = useState(1);
    const [data, setData] = useState<FormData>(INITIAL);
    const [errors, setErrors] = useState<Errors>({});
    const [toast, setToast] = useState<{ msg: string; type: "success" | "info" | "error" } | null>(null);
    const [resumeCode, setResumeCode] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [arn, setArn] = useState("");

    /* ── Auto-save every 60 seconds ─────────────────────────── */
    const autoSave = useCallback(() => {
        localStorage.setItem(`infosetu_draft_${service}`, JSON.stringify(data));
        setToast({ msg: "Progress saved ✓", type: "success" });
    }, [data, service]);

    useEffect(() => {
        const interval = setInterval(autoSave, 60_000);
        return () => clearInterval(interval);
    }, [autoSave]);

    /* ── Restore draft on mount ──────────────────────────────── */
    useEffect(() => {
        const draft = localStorage.getItem(`infosetu_draft_${service}`);
        if (draft) {
            try { setData(JSON.parse(draft)); } catch { }
        }
    }, [service]);

    /* ── Field update helper ─────────────────────────────────── */
    function update(field: keyof FormData, value: string) {
        setData((d) => ({ ...d, [field]: value }));
        setErrors((e) => { const next = { ...e }; delete next[field]; return next; });
    }

    /* ── Validation per step ─────────────────────────────────── */
    function validate(): boolean {
        const errs: Errors = {};
        if (step === 1) {
            if (!data.fullName.trim()) errs.fullName = "Full name is required";
            if (!data.dob) errs.dob = "Date of birth is required";
            if (!data.gender) errs.gender = "Please select gender";
            if (!/^\d{10}$/.test(data.mobile)) errs.mobile = "Enter a valid 10-digit mobile number";
            if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
                errs.email = "Enter a valid email address";
            if (data.aadhaar.length !== 12) errs.aadhaar = "Aadhaar must be 12 digits";
        }
        if (step === 2) {
            if (!data.address.trim()) errs.address = "Address is required";
            if (!data.city.trim()) errs.city = "City is required";
            if (!data.state) errs.state = "Please select a state";
            if (!/^\d{6}$/.test(data.pincode)) errs.pincode = "Enter a valid 6-digit PIN code";
        }
        if (step === 3) {
            if (!data.idProof.trim()) errs.idProof = "Please select ID proof type";
        }
        setErrors(errs);
        return Object.keys(errs).length === 0;
    }

    function handleNext() {
        if (validate()) setStep((s) => Math.min(s + 1, 4));
        else setToast({ msg: "Please fix the errors above", type: "error" });
    }

    function handleBack() { setStep((s) => Math.max(s - 1, 1)); }

    function handleSaveLater() {
        const code = generateCode();
        setResumeCode(code);
        autoSave();
        setToast({ msg: `Resume code: ${code} — saved!`, type: "info" });
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        /* Simulate API submission */
        await new Promise((r) => setTimeout(r, 1500));
        const newArn = generateARN();
        setArn(newArn);
        localStorage.removeItem(`infosetu_draft_${service}`);
        setSubmitted(true);
    }

    /* ── Review sections ─────────────────────────────────────── */
    const reviewSections = [
        {
            id: "personal", title: "Personal Information", stepIndex: 1,
            fields: [
                { label: "Full Name", value: data.fullName },
                { label: "Date of Birth", value: data.dob },
                { label: "Gender", value: data.gender },
                { label: "Mobile", value: data.mobile },
                { label: "Email", value: data.email },
                { label: "Aadhaar", value: data.aadhaar ? `XXXX-XXXX-${data.aadhaar.slice(-4)}` : "" },
            ],
        },
        {
            id: "address", title: "Address Details", stepIndex: 2,
            fields: [
                { label: "Address", value: data.address },
                { label: "City", value: data.city },
                { label: "State", value: data.state },
                { label: "PIN Code", value: data.pincode },
            ],
        },
        {
            id: "documents", title: "Documents", stepIndex: 3,
            fields: [
                { label: "ID Proof", value: data.idProof },
                { label: "Address Proof", value: data.addressProof },
            ],
        },
    ];

    /* ── Submitted confirmation screen ───────────────────────── */
    if (submitted) {
        return (
            <div className="max-w-lg mx-auto px-4 py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-[#E8F5E9] flex items-center justify-center text-4xl mx-auto mb-6" aria-hidden="true">
                    ✅
                </div>
                <h1 className="text-2xl font-black text-[#2E7D32] mb-2">Application Submitted!</h1>
                <p className="text-[#616161] mb-6">We&apos;ve received your application for <strong>{serviceLabel}</strong>.</p>

                <div className="bg-white rounded-2xl p-6 border border-[#2E7D32]/20 shadow-sm mb-6">
                    <p className="text-xs text-[#616161] mb-1">Application Reference Number (ARN)</p>
                    <p className="text-xl font-black text-[#1A237E] tracking-wide">{arn}</p>
                    <p className="text-xs text-[#616161] mt-2">Save this number to track your application status</p>
                </div>

                <div className="bg-[#E8EAF6] rounded-xl p-4 text-left mb-8">
                    <p className="text-sm font-bold text-[#1A237E] mb-2">What happens next?</p>
                    <ul className="space-y-1.5 text-xs text-[#1A237E]/80">
                        <li>✉️ Confirmation email sent to {data.email || "your registered email"}</li>
                        <li>📱 SMS sent to {data.mobile}</li>
                        <li>⏱ Expected processing time: 15–30 working days</li>
                        <li>🔍 Track status using your ARN at any time</li>
                    </ul>
                </div>

                <div className="flex gap-3 justify-center">
                    <button
                        onClick={() => router.push("/status?arn=" + arn)}
                        className="touch-target px-6 py-3 rounded-xl bg-[#1A237E] text-white font-bold text-sm hover:bg-[#283593] transition-colors"
                    >
                        Track Status
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="touch-target px-6 py-3 rounded-xl border-2 border-[#1A237E] text-[#1A237E] font-bold text-sm hover:bg-[#E8EAF6] transition-colors"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    /* ── Main form ───────────────────────────────────────────── */
    return (
        <div className="max-w-screen-md mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-[#616161]">
                    <li><a href="/" className="hover:text-[#1A237E] hover:underline">Home</a></li>
                    <li aria-hidden="true">›</li>
                    <li><a href={`/services/${service}`} className="hover:text-[#1A237E] hover:underline">{serviceLabel}</a></li>
                    <li aria-hidden="true">›</li>
                    <li className="text-[#1A237E] font-semibold" aria-current="page">Apply</li>
                </ol>
            </nav>

            {/* Page heading */}
            <h1 className="text-2xl font-black text-[#1A237E] mb-2">Apply for {serviceLabel}</h1>
            <p className="text-sm text-[#616161] mb-6">All fields marked <span aria-hidden="true" className="text-[#C62828]">*</span> <span className="sr-only">"required"</span> are mandatory.</p>

            {/* Stepper */}
            <Stepper steps={STEPS} currentStep={step} />

            {/* Resume code notice */}
            {resumeCode && (
                <div role="status" className="bg-[#E8EAF6] rounded-xl p-4 mb-6 text-sm">
                    <strong className="text-[#1A237E]">Resume code: </strong>
                    <code className="font-mono font-bold tracking-widest">{resumeCode}</code>
                    <p className="text-xs text-[#616161] mt-1">Use this code to resume your application later.</p>
                </div>
            )}

            {/* Form */}
            <form
                onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}
                noValidate
                aria-label={`${serviceLabel} application — Step ${step} of ${STEPS.length}: ${STEPS[step - 1].label}`}
            >
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">

                    {/* Step 1: Personal Information */}
                    {step === 1 && (
                        <fieldset>
                            <legend className="text-base font-bold text-[#1A237E] mb-4">Personal Information</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <FormField label="Full Name (as per Aadhaar)" name="fullName" value={data.fullName} onChange={(v) => update("fullName", v)}
                                        placeholder="e.g. Ramesh Kumar Sharma" required error={errors.fullName}
                                        tooltip="Enter your name exactly as it appears on your Aadhaar card" autoComplete="name" />
                                </div>
                                <FormField label="Date of Birth" name="dob" type="date" value={data.dob} onChange={(v) => update("dob", v)}
                                    required error={errors.dob} autoComplete="bday" />
                                <FormField label="Gender" name="gender" type="select" value={data.gender} onChange={(v) => update("gender", v)}
                                    required error={errors.gender}
                                    options={[{ value: "male", label: "Male" }, { value: "female", label: "Female" }, { value: "transgender", label: "Transgender" }, { value: "prefer-not", label: "Prefer not to say" }]} />
                                <FormField label="Mobile Number" name="mobile" type="tel" value={data.mobile} onChange={(v) => update("mobile", v)}
                                    placeholder="10-digit mobile" required error={errors.mobile}
                                    helpText="We will send OTP and status updates to this number" autoComplete="tel" maxLength={10} />
                                <FormField label="Email Address" name="email" type="email" value={data.email} onChange={(v) => update("email", v)}
                                    placeholder="Optional" error={errors.email} autoComplete="email" />
                                <div className="sm:col-span-2">
                                    <AadhaarInput value={data.aadhaar} onChange={(v) => update("aadhaar", v)} error={errors.aadhaar} required />
                                </div>
                            </div>
                        </fieldset>
                    )}

                    {/* Step 2: Address */}
                    {step === 2 && (
                        <fieldset>
                            <legend className="text-base font-bold text-[#1A237E] mb-4">Residential Address</legend>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="sm:col-span-2">
                                    <FormField label="Full Address" name="address" type="textarea" value={data.address} onChange={(v) => update("address", v)}
                                        placeholder="House/Flat No., Street, Locality" required error={errors.address}
                                        helpText="Include door number, street, and locality" autoComplete="street-address" maxLength={200} />
                                </div>
                                <FormField label="City / Town / Village" name="city" value={data.city} onChange={(v) => update("city", v)}
                                    required error={errors.city} autoComplete="address-level2" />
                                <FormField label="State / UT" name="state" type="select" value={data.state} onChange={(v) => update("state", v)}
                                    required error={errors.state} options={STATES.map((s) => ({ value: s, label: s }))} />
                                <FormField label="PIN Code" name="pincode" value={data.pincode} onChange={(v) => update("pincode", v)}
                                    placeholder="6-digit PIN" required error={errors.pincode}
                                    helpText="6-digit postal code" autoComplete="postal-code" maxLength={6} />
                            </div>
                        </fieldset>
                    )}

                    {/* Step 3: Documents */}
                    {step === 3 && (
                        <fieldset>
                            <legend className="text-base font-bold text-[#1A237E] mb-4">Document Information</legend>
                            <div className="space-y-5">
                                <FormField label="ID Proof Type" name="idProof" type="select" value={data.idProof} onChange={(v) => update("idProof", v)}
                                    required error={errors.idProof}
                                    helpText="Select the type of ID proof you will submit"
                                    options={[
                                        { value: "passport", label: "Passport" },
                                        { value: "voter-id", label: "Voter ID" },
                                        { value: "dl", label: "Driving Licence" },
                                        { value: "pan", label: "PAN Card" },
                                        { value: "govt-id", label: "Government Employee ID" },
                                    ]} />
                                <FormField label="Address Proof Type" name="addressProof" type="select" value={data.addressProof} onChange={(v) => update("addressProof", v)}
                                    helpText="Optional — if same as ID proof, leave blank"
                                    options={[
                                        { value: "utility", label: "Electricity / Water bill" },
                                        { value: "bank", label: "Bank Statement" },
                                        { value: "rent", label: "Rent Agreement" },
                                        { value: "passport", label: "Passport" },
                                    ]} />
                                {/* Upload notice */}
                                <div className="bg-[#FFF8E1] border border-[#E65100]/20 rounded-xl p-4 text-sm">
                                    <p className="font-bold text-[#E65100] mb-1">⚠️ Document upload</p>
                                    <p className="text-[#E65100]/80 text-xs">
                                        Bring original documents to the service centre for verification.
                                        Digital upload for select documents will be available after verification.
                                    </p>
                                </div>
                                {/* Declaration */}
                                <label className="flex items-start gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        required
                                        aria-required="true"
                                        className="mt-1 w-4 h-4 accent-[#1A237E] rounded"
                                    />
                                    <span className="text-xs text-[#616161] leading-relaxed">
                                        I declare that the information provided is true and correct to the best of my knowledge.
                                        I understand that providing false information is a punishable offence under Indian law.
                                    </span>
                                </label>
                            </div>
                        </fieldset>
                    )}

                    {/* Step 4: Review & Submit */}
                    {step === 4 && (
                        <div>
                            <ReviewSummary sections={reviewSections} onEdit={(stepIndex) => setStep(stepIndex)} />

                            {/* CAPTCHA placeholder — integrate actual CAPTCHA before production */}
                            <div className="mt-6 bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <p className="text-sm font-bold text-[#111111] mb-1">Security Check</p>
                                <p className="text-xs text-[#616161]">Complete CAPTCHA verification before submitting.</p>
                                <div className="mt-3 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-xs text-[#616161]">
                                    {/* Replace with reCAPTCHA / hCaptcha in production */}
                                    [ CAPTCHA widget — integrate reCAPTCHA / hCaptcha ]
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            className="touch-target flex-1 py-3 rounded-xl border-2 border-[#1A237E] text-[#1A237E] font-bold text-sm hover:bg-[#E8EAF6] transition-colors"
                        >
                            ← Back
                        </button>
                    )}

                    {step < 4 ? (
                        <button
                            type="submit"
                            className="touch-target flex-1 py-3 rounded-xl bg-[#1A237E] text-white font-bold text-sm hover:bg-[#283593] active:scale-95 transition-all"
                        >
                            Save &amp; Continue →
                        </button>
                    ) : (
                        <button
                            type="submit"
                            className="touch-target flex-1 py-3 rounded-xl bg-[#2E7D32] text-white font-bold text-sm hover:bg-green-700 active:scale-95 transition-all"
                        >
                            Submit Application ✓
                        </button>
                    )}
                </div>

                {/* Save & Continue Later */}
                <button
                    type="button"
                    onClick={handleSaveLater}
                    className="mt-4 w-full text-center text-sm text-[#616161] hover:text-[#1A237E] underline underline-offset-2 transition-colors"
                    aria-label="Save progress and continue application later — generates a resume code"
                >
                    Save &amp; Continue Later (get a resume code)
                </button>
            </form>

            {/* Toast notification */}
            {toast && (
                <Toast message={toast.msg} type={toast.type} onDismiss={() => setToast(null)} />
            )}
        </div>
    );
}
