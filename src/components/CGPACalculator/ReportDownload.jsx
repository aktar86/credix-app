"use client";

import { useRef, useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import ReportCard from "./ReportCard";

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const inputClass =
  "h-12 w-full rounded-[10px] border border-border bg-surface px-3.5 text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-tint";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[13px] font-medium text-slate">
      {label}
    </span>
    {children}
  </label>
);

const SCALE = 0.55;

const ReportDownload = ({ semesters, activeSemester }) => {
  const reportRef = useRef(null);
  const [busy, setBusy] = useState(null);
  const [info, setInfo] = useState({
    name: "",
    studentId: "",
    university: "",
    department: "",
    advisor: "",
    photo: "",
    date: today(),
  });

  const set = (field) => (e) =>
    setInfo((prev) => ({ ...prev, [field]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Photo must be under 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () =>
      setInfo((prev) => ({ ...prev, photo: reader.result }));
    reader.readAsDataURL(file);
  };

  const ready =
    info.name.trim() && info.studentId.trim() && info.university.trim();

  const capture = (type) => {
    const opts = { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true };
    return type === "jpg"
      ? toJpeg(reportRef.current, { ...opts, quality: 0.95 })
      : toPng(reportRef.current, opts);
  };

  const saveFile = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
  };

  const handleDownload = async (format) => {
    if (!ready) return;
    setBusy(format);
    try {
      const fileName = `CGPA-Report-${info.name.trim().replace(/\s+/g, "-")}`;

      if (format === "pdf") {
        const img = await capture("png");
        const node = reportRef.current;
        const w = 210; // A4 width in mm
        const h = (node.offsetHeight / node.offsetWidth) * w;
        const pdf = new jsPDF({ unit: "mm", format: [w, h] });
        pdf.addImage(img, "PNG", 0, 0, w, h);
        pdf.save(`${fileName}.pdf`);
      } else {
        saveFile(await capture(format), `${fileName}.${format}`);
      }
    } catch (err) {
      console.error(err);
      alert("Download failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const downloadButtons = [
    { format: "pdf", label: "PDF" },
    { format: "png", label: "PNG" },
    { format: "jpg", label: "JPG" },
  ];

  return (
    <section className="mt-12 grid gap-8 lg:grid-cols-[420px_1fr]">
      {/* ---------- Form ---------- */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          Report card details
        </h2>
        <p className="mb-6 mt-1.5 text-slate">
          These details appear on your report card.
        </p>

        <div className="space-y-4">
          <Field label="Full name *">
            <input
              className={inputClass}
              value={info.name}
              onChange={set("name")}
            />
          </Field>
          <Field label="Student ID *">
            <input
              className={inputClass}
              value={info.studentId}
              onChange={set("studentId")}
            />
          </Field>
          <Field label="University / Institution *">
            <input
              className={inputClass}
              value={info.university}
              onChange={set("university")}
            />
          </Field>
          <Field label="Department / Program">
            <input
              className={inputClass}
              value={info.department}
              onChange={set("department")}
            />
          </Field>
          <Field label="Advisor name (optional)">
            <input
              className={inputClass}
              value={info.advisor}
              onChange={set("advisor")}
            />
          </Field>
          <Field label="Issue date">
            <input
              className={`${inputClass} bg-background`}
              value={info.date}
              readOnly
            />
          </Field>
          <Field label="Photo (optional)">
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhoto}
              className="block w-full cursor-pointer rounded-[10px] border border-dashed border-outline p-3 text-sm text-slate file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary-tint file:px-3 file:py-1.5 file:text-primary-dark"
            />
          </Field>
        </div>

        <p className="mb-2 mt-6 text-[13px] font-medium text-slate">
          Download as
        </p>
        <div className="grid grid-cols-3 gap-2">
          {downloadButtons.map(({ format, label }) => (
            <button
              key={format}
              type="button"
              disabled={!ready || busy !== null}
              onClick={() => handleDownload(format)}
              className="h-12 cursor-pointer rounded-xl bg-primary font-medium text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy === format ? "Saving…" : label}
            </button>
          ))}
        </div>
        {!ready && (
          <p className="mt-3 text-[13px] text-muted">
            Fill in name, student ID and university to enable download.
          </p>
        )}
      </div>

      {/* ---------- Live preview ---------- */}
      <div className="overflow-x-auto">
        <div
          className="overflow-hidden rounded-lg border border-border shadow-sm"
          style={{ width: 794 * SCALE }}
        >
          <div
            style={{
              transform: `scale(${SCALE})`,
              transformOrigin: "top left",
              width: 794,
            }}
          >
            <ReportCard
              ref={reportRef}
              info={info}
              semesters={semesters}
              activeSemester={activeSemester}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReportDownload;
