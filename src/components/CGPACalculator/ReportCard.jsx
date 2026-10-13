import { forwardRef } from "react";

import { calcState, gradeLabel } from "./CGPACalculator";

const Info = ({ label, children }) => (
  <div>
    <p className="text-[11px] uppercase tracking-wider text-slate-500">
      {label}
    </p>
    <p className="mt-1 text-[15px] font-medium text-slate-900">{children}</p>
  </div>
);

const TableHead = ({ cols, children }) => (
  <div
    className={`grid ${cols} border-b-2 border-indigo-700 pb-2 text-[11px] font-bold uppercase tracking-wider text-indigo-700`}
  >
    {children}
  </div>
);

const ReportCard = forwardRef(function ReportCard(
  { info, semesters, activeSemester },
  ref,
) {
  const overall = calcState(semesters.flatMap((s) => s.courses));
  const current = calcState(activeSemester.courses);

  return (
    <div
      ref={ref}
      style={{ width: 794, minHeight: 1123 }}
      className="flex flex-col bg-white px-16 py-14 font-sans text-slate-900"
    >
      {/* Header */}
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
          <p className="mt-1 text-sm text-slate-600">{info.university}</p>
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

      {/* Student info */}
      <div className="grid grid-cols-3 gap-x-6 gap-y-5 border-b border-slate-200 py-6">
        <Info label="Student name">{info.name}</Info>
        <Info label="Student ID">{info.studentId}</Info>
        <Info label="Issue date">{info.date}</Info>
        <Info label="Department">{info.department || "—"}</Info>
        <Info label="Advisor">{info.advisor || "—"}</Info>
        <Info label="Overall CGPA">
          <span className="font-bold text-indigo-700">
            {overall.cgpa.toFixed(2)}
          </span>{" "}
          / 4.00
        </Info>
      </div>

      {/* Course table */}
      <div className="mt-7">
        <TableHead cols="grid-cols-[1fr_80px_80px_80px]">
          <span>{activeSemester.name} · Course</span>
          <span>Credit</span>
          <span>Grade</span>
          <span>Points</span>
        </TableHead>

        {activeSemester.courses.map((c, i) => (
          <div
            key={i}
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
            {current.cgpa.toFixed(2)}
          </b>
        </p>
      </div>

      {/* All semesters */}
      <div className="mt-7">
        <TableHead cols="grid-cols-[1fr_100px_100px]">
          <span>All semesters</span>
          <span>Credits</span>
          <span>GPA</span>
        </TableHead>

        {semesters.map((s) => {
          const st = calcState(s.courses);
          return (
            <div
              key={s.id}
              className="grid grid-cols-[1fr_100px_100px] border-b border-slate-200 py-[11px] text-[13px] text-slate-600"
            >
              <span className="text-slate-900">{s.name}</span>
              <span>{st.credit}</span>
              <span>{st.cgpa.toFixed(2)}</span>
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
            {overall.cgpa.toFixed(2)}
          </span>
        </div>
      </div>

      <p className="mt-5 text-[11px] leading-relaxed text-slate-500">
        Grade scale: A+ 4.00 · A 3.75 · A- 3.50 · B+ 3.25 · B 3.00 · B- 2.75 ·
        C+ 2.50 · C 2.25 · D 2.00 · F 0.00
      </p>

      {/* Signatures */}
      <div className="mt-auto flex justify-between pt-16 text-xs text-slate-600">
        <div className="w-[200px] border-t border-slate-400 pt-1.5">
          Student signature
        </div>
        <div className="w-[200px] border-t border-slate-400 pt-1.5">
          Advisor signature
        </div>
      </div>
    </div>
  );
});

export default ReportCard;
