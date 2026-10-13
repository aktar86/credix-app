"use client";

import React, { useRef, useState } from "react";
import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";

/* ------------------------------------------------------------------ */
/* Constants & helpers                                                 */
/* ------------------------------------------------------------------ */

const gradeScale = [
  { label: "A+", point: "4.00" },
  { label: "A", point: "3.75" },
  { label: "A-", point: "3.50" },
  { label: "B+", point: "3.25" },
  { label: "B", point: "3.00" },
  { label: "B-", point: "2.75" },
  { label: "C+", point: "2.50" },
  { label: "C", point: "2.25" },
  { label: "D", point: "2.00" },
  { label: "F", point: "0.00" },
];

const gradeLabel = (point) =>
  gradeScale.find((g) => g.point === point)?.label ?? "—";

const newCourse = (credit = 3) => ({
  id: crypto.randomUUID(),
  courseName: "",
  credit,
  grade: "",
});

const calcStats = (courses) => {
  const graded = courses.filter((c) => c.grade !== "" && Number(c.credit) > 0);
  const credit = graded.reduce((sum, c) => sum + Number(c.credit), 0);
  const point = graded.reduce(
    (sum, c) => sum + Number(c.credit) * Number(c.grade),
    0,
  );
  return { gpa: credit > 0 ? point / credit : 0, credit };
};

const inputClass =
  "h-12 w-full min-w-0 rounded-[10px] border border-border bg-surface px-3 text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary-tint";

const rowGrid =
  "grid grid-cols-[1fr_72px_104px_44px] gap-3 sm:grid-cols-[1fr_110px_130px_44px]";

const today = () =>
  new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const CGPA = () => {
  const reportRef = useRef(null);

  const [activeSemesterId, setActiveSemesterId] = useState(1);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(null); // "pdf" | "png" | "jpg" | null
  const [semesters, setSemesters] = useState([
    {
      id: 1,
      name: "Semester 1",
      courses: [newCourse(), newCourse(), newCourse()],
    },
  ]);
  const [info, setInfo] = useState({
    name: "",
    studentId: "",
    university: "",
    department: "",
    advisor: "",
    photo: "",
  });

  /* ---------- derived values ---------- */

  const activeSemester = semesters.find((s) => s.id === activeSemesterId);
  const overall = calcStats(semesters.flatMap((s) => s.courses));
  const current = calcStats(activeSemester?.courses ?? []);

  const cgpaValue = result?.cgpa ?? 0;
  const progress = Math.min((cgpaValue / 4) * 100, 100);
  const canDownload =
    result &&
    info.name.trim() &&
    info.studentId.trim() &&
    info.university.trim();

  /* ---------- semester actions ---------- */

  // every data change clears the old result, so it never goes stale
  const updateSemesters = (updater) => {
    setSemesters(updater);
    setResult(null);
  };

  const selectSemester = (id) => {
    setActiveSemesterId(id);
    setResult(null);
  };

  const addSemester = () => {
    const id = crypto.randomUUID();
    updateSemesters((prev) => [
      ...prev,
      { id, name: `Semester ${prev.length + 1}`, courses: [newCourse()] },
    ]);
    setActiveSemesterId(id);
  };

  const removeSemester = (id) => {
    if (semesters.length <= 1) return;
    const remaining = semesters.filter((s) => s.id !== id);
    updateSemesters(remaining);
    if (id === activeSemesterId) setActiveSemesterId(remaining[0].id);
  };

  /* ---------- course actions ---------- */

  const updateActive = (fn) =>
    updateSemesters((prev) =>
      prev.map((s) => (s.id === activeSemesterId ? fn(s) : s)),
    );

  const handleCourseChange = (courseId, field, value) =>
    updateActive((s) => ({
      ...s,
      courses: s.courses.map((c) =>
        c.id === courseId ? { ...c, [field]: value } : c,
      ),
    }));

  const addCourse = () =>
    updateActive((s) => ({ ...s, courses: [...s.courses, newCourse()] }));

  const removeCourse = (id) =>
    updateActive((s) =>
      s.courses.length <= 1
        ? s
        : { ...s, courses: s.courses.filter((c) => c.id !== id) },
    );

  /* ---------- calculate ---------- */

  const handleCalculate = () =>
    setResult({
      semesterGpa: current.gpa,
      cgpa: overall.gpa,
      credit: overall.credit,
    });

  /* ---------- details form ---------- */

  const setField = (field) => (e) =>
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

  /* ---------- download ---------- */

  const capture = (type) => {
    const opts = { pixelRatio: 2, backgroundColor: "#ffffff", cacheBust: true };
    return type === "jpg"
      ? toJpeg(reportRef.current, { ...opts, quality: 0.95 })
      : toPng(reportRef.current, opts);
  };

  const handleDownload = async (format) => {
    if (!canDownload) return;
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
        const a = document.createElement("a");
        a.href = await capture(format);
        a.download = `${fileName}.${format}`;
        a.click();
      }
    } catch (err) {
      console.error(err);
      alert("Download failed. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /* Render                                                            */
  /* ---------------------------------------------------------------- */

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* ============ Calculator ============ */}
        <div className="flex-[2] rounded-2xl border border-border bg-surface p-5">
          {/* semester tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {semesters.map((semester) => (
                <div key={semester.id} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => selectSemester(semester.id)}
                    className={`h-10 cursor-pointer rounded-full px-4 text-[15px] transition ${
                      activeSemesterId === semester.id
                        ? "bg-primary-tint font-medium text-primary-dark"
                        : "text-slate hover:bg-primary-tint hover:text-primary-dark"
                    }`}
                  >
                    {semester.name}
                  </button>

                  {semesters.length > 1 && (
                    <button
                      type="button"
                      aria-label={`Remove ${semester.name}`}
                      onClick={() => removeSemester(semester.id)}
                      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted transition hover:bg-primary-tint hover:text-error"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addSemester}
              className="h-10 cursor-pointer rounded-full px-4 text-[15px] text-slate transition hover:bg-primary-tint hover:text-primary-dark"
            >
              + Add semester
            </button>
          </div>

          {/* course rows */}
          <div className="mt-5">
            <div
              className={`${rowGrid} mb-2 text-[13px] font-medium text-slate`}
            >
              <span>Course</span>
              <span>Credits</span>
              <span>Grade</span>
              <span className="sr-only">Remove</span>
            </div>

            <div className="space-y-3">
              {activeSemester?.courses.map((c) => (
                <div key={c.id} className={`${rowGrid} items-center`}>
                  <input
                    type="text"
                    aria-label="Course name"
                    placeholder="Course name"
                    value={c.courseName}
                    onChange={(e) =>
                      handleCourseChange(c.id, "courseName", e.target.value)
                    }
                    className={inputClass}
                  />
                  <input
                    type="number"
                    aria-label="Credits"
                    placeholder="0"
                    min="0"
                    value={c.credit}
                    onChange={(e) =>
                      handleCourseChange(c.id, "credit", e.target.value)
                    }
                    className={inputClass}
                  />
                  <select
                    aria-label="Grade"
                    value={c.grade}
                    onChange={(e) =>
                      handleCourseChange(c.id, "grade", e.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Grade</option>
                    {gradeScale.map(({ label, point }) => (
                      <option key={label} value={point}>
                        {label} ({point})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label="Remove course"
                    onClick={() => removeCourse(c.id)}
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] text-muted transition hover:bg-primary-tint hover:text-primary-dark"
                  >
                    <svg
                      aria-hidden="true"
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    >
                      <path d="M5 12h14" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex items-center justify-between">
              <button
                type="button"
                onClick={addCourse}
                className="h-11 cursor-pointer rounded-[10px] border border-dashed border-outline px-[18px] text-[15px] font-medium text-ink transition hover:border-primary hover:bg-primary-tint"
              >
                + Add course
              </button>
              <button
                type="button"
                onClick={handleCalculate}
                className="h-12 cursor-pointer rounded-xl bg-primary px-7 font-medium text-white transition hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>

        {/* ============ Aside ============ */}
        <div className="flex-1">
          <div className="rounded-2xl bg-slate-900 p-7 text-white">
            <h3 className="text-sm text-slate-300">Your CGPA</h3>
            <p className="my-2 text-6xl font-bold leading-tight tracking-tight">
              {cgpaValue.toFixed(2)}
            </p>

            <div
              role="progressbar"
              aria-label="CGPA out of 4.00"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={cgpaValue}
              className="h-2 rounded-full bg-slate-700"
            >
              <div
                className="h-2 rounded-full bg-primary-light transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-[13px] text-slate-300">
              <span>0.00</span>
              <span>out of 4.00</span>
            </div>

            <div className="mt-6 flex gap-6 text-sm">
              <div>
                <p className="text-slate-300">Semester GPA</p>
                <p className="text-2xl font-bold">
                  {(result?.semesterGpa ?? 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-slate-300">Total credits</p>
                <p className="text-2xl font-bold">{result?.credit ?? 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-surface p-6">
            <h3 className="mb-4 font-bold text-ink">Grade scale</h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm text-slate">
              {gradeScale.map(({ label, point }) => (
                <div key={label} className="flex justify-between">
                  <dt>{label}</dt>
                  <dd className="font-bold text-ink">{point}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* ============ Report card details + download ============ */}
      <section className="mt-5  rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="text-2xl font-bold tracking-tight text-ink">
          Download your report card
        </h2>
        <p className="mb-6 mt-1.5 text-slate">
          Fill in your details. They appear on the report card.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            ["Full name *", "name"],
            ["Student ID *", "studentId"],
            ["University / Institution *", "university"],
            ["Department / Program", "department"],
            ["Advisor name (optional)", "advisor"],
          ].map(([label, field]) => (
            <label key={field} className="block">
              <span className="mb-1.5 block text-[13px] font-medium text-slate">
                {label}
              </span>
              <input
                type="text"
                value={info[field]}
                onChange={setField(field)}
                className={inputClass}
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-1.5 block text-[13px] font-medium text-slate">
              Photo (optional)
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={handlePhoto}
              className="block w-full cursor-pointer rounded-[10px] border border-dashed border-outline p-2.5 text-sm text-slate file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary-tint file:px-3 file:py-1.5 file:text-primary-dark"
            />
          </label>
        </div>

        <p className="mb-2 mt-6 text-[13px] font-medium text-slate">
          Download as
        </p>
        <div className="grid  w-full grid-cols-3 gap-2">
          {["pdf", "png", "jpg"].map((format) => (
            <button
              key={format}
              type="button"
              disabled={!canDownload || busy !== null}
              onClick={() => handleDownload(format)}
              className="h-12  cursor-pointer rounded-xl bg-primary font-medium uppercase text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy === format ? "Saving…" : format}
            </button>
          ))}
        </div>
        {!canDownload && (
          <p className="mt-3 text-[13px] text-muted">
            Fill in name, student ID and university to enable download.
          </p>
        )}
      </section>

      {/* ============ Hidden marksheet (captured on download) ============ */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 -left-[10000px]"
      >
        <div
          ref={reportRef}
          style={{ width: 794, minHeight: 1123 }}
          className="flex flex-col bg-white px-16 py-14 font-sans text-slate-900"
        >
          {/* header */}
          <div className="flex items-start justify-between border-b-2 border-indigo-700 pb-6">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-indigo-700">
                <span className="flex h-[26px] w-[26px] items-center justify-center rounded-[7px] border-2 border-indigo-700 text-xs">
                  C
                </span>
                CredixApp
              </div>
              <h1 className="mt-4 text-[34px] font-bold tracking-tight">
                CGPA Report Card
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                {info.university || "—"}
              </p>
            </div>

            <div className="flex h-28 w-24 items-center justify-center overflow-hidden rounded-[10px] border border-slate-200 text-[11px] text-slate-400">
              {info.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={info.photo}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                "Photo"
              )}
            </div>
          </div>

          {/* student info */}
          <div className="grid grid-cols-3 gap-x-6 gap-y-5 border-b border-slate-200 py-6">
            {[
              ["Student name", info.name || "—"],
              ["Student ID", info.studentId || "—"],
              [
                "Issue date",
                <span key="d" suppressHydrationWarning>
                  {today()}
                </span>,
              ],
              ["Department", info.department || "—"],
              ["Advisor", info.advisor || "—"],
              [
                "Overall CGPA",
                <span key="c">
                  <b className="text-indigo-700">{overall.gpa.toFixed(2)}</b> /
                  4.00
                </span>,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-[11px] uppercase tracking-wider text-slate-500">
                  {label}
                </p>
                <p className="mt-1 text-[15px] font-medium">{value}</p>
              </div>
            ))}
          </div>

          {/* active semester courses */}
          <div className="mt-7">
            <div className="grid grid-cols-[1fr_80px_80px_80px] border-b-2 border-indigo-700 pb-2 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              <span>{activeSemester?.name} · Course</span>
              <span>Credit</span>
              <span>Grade</span>
              <span>Points</span>
            </div>

            {activeSemester?.courses.map((c) => (
              <div
                key={c.id}
                className="grid grid-cols-[1fr_80px_80px_80px] border-b border-slate-200 py-[11px] text-[13px] text-slate-600"
              >
                <span className="text-slate-900">{c.courseName || "—"}</span>
                <span>{c.credit}</span>
                <span>{gradeLabel(c.grade)}</span>
                <span>{c.grade || "—"}</span>
              </div>
            ))}

            <p className="pt-3 text-right text-[13px] text-slate-600">
              Semester GPA{" "}
              <b className="ml-1.5 text-[15px] text-slate-900">
                {current.gpa.toFixed(2)}
              </b>
            </p>
          </div>

          {/* all semesters */}
          <div className="mt-7">
            <div className="grid grid-cols-[1fr_100px_100px] border-b-2 border-indigo-700 pb-2 text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              <span>All semesters</span>
              <span>Credits</span>
              <span>GPA</span>
            </div>

            {semesters.map((s) => {
              const st = calcStats(s.courses);
              return (
                <div
                  key={s.id}
                  className="grid grid-cols-[1fr_100px_100px] border-b border-slate-200 py-[11px] text-[13px] text-slate-600"
                >
                  <span className="text-slate-900">{s.name}</span>
                  <span>{st.credit}</span>
                  <span>{st.gpa.toFixed(2)}</span>
                </div>
              );
            })}

            <div className="mt-4 flex items-center justify-between rounded-xl border-2 border-indigo-700 px-5 py-4">
              <span className="text-[15px] font-medium">
                Overall CGPA{" "}
                <span className="text-[13px] font-normal text-slate-500">
                  · {overall.credit} credits
                </span>
              </span>
              <span className="text-3xl font-bold text-indigo-700">
                {overall.gpa.toFixed(2)}
              </span>
            </div>
          </div>

          <p className="mt-5 text-[11px] leading-relaxed text-slate-500">
            Grade scale:{" "}
            {gradeScale.map((g) => `${g.label} ${g.point}`).join(" · ")}
          </p>

          {/* signatures */}
          <div className="mt-auto flex justify-between pt-16 text-xs text-slate-600">
            <div className="w-[200px] border-t border-slate-400 pt-1.5">
              Student signature
            </div>
            <div className="w-[200px] border-t border-slate-400 pt-1.5">
              Advisor signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CGPA;
