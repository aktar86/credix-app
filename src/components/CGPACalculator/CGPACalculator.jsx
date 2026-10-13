"use client";
import React, { useState } from "react";
import ReportDownload from "./ReportDownload";

export const gradeScale = [
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

export const gradeLabel = (point) =>
  gradeScale.find((g) => g.point === point)?.label ?? "—";

export const calcState = (courses) => {
  const graded = courses.filter(
    (course) => course.grade !== "" && Number(course.credit) > 0,
  );

  const totalCredit = graded.reduce((sum, course) => {
    return sum + Number(course.credit);
  }, 0);

  const totalPoint = graded.reduce((acc, course) => {
    return acc + Number(course.credit) * Number(course.grade);
  }, 0);

  const cgpa = totalCredit > 0 ? totalPoint / totalCredit : 0;

  return {
    cgpa,
    credit: totalCredit,
  };
};

const newCourse = (credit = 4) => ({
  id: crypto.randomUUID(),
  courseName: "",
  credit,
  grade: "",
});

const CGPACalculator = () => {
  const [activeSemesterId, setActiveSemesterId] = useState(1);
  const [result, setResult] = useState(null);
  const [semesters, setSemesters] = useState([
    {
      id: 1,
      name: "Semester 1",
      courses: [newCourse(), newCourse(), newCourse()],
    },
  ]);

  console.log("semesters:", semesters);

  // add semesters
  const addSemester = () => {
    setSemesters((prev) => [
      ...prev,
      {
        id: prev.length + 1,
        name: `Semester ${prev.length + 1}`,
        courses: [newCourse(), newCourse(), newCourse()],
      },
    ]);
  };

  const removeSemester = (id) => {
    if (semesters.length <= 1) return;
    const remaining = semesters.filter((s) => s.id !== id);
    setSemesters(remaining);
    if (id === activeSemesterId) setActiveSemesterId(remaining[0].id);
    setResult(null);
  };

  //   active Semester
  const activeSemester = semesters.find(
    (semester) => semester.id === activeSemesterId,
  );
  console.log(activeSemester);

  const handleCourseChange = (courseId, field, value) => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === activeSemesterId
          ? {
              ...semester,
              courses: semester.courses.map((course) =>
                course.id === courseId ? { ...course, [field]: value } : course,
              ),
            }
          : semester,
      ),
    );
  };

  const addCourse = () => {
    setSemesters((prev) =>
      prev.map((semester) =>
        semester.id === activeSemesterId
          ? {
              ...semester,
              courses: [
                ...semester.courses,
                {
                  id: Date.now(),
                  courseName: "",
                  credit: 3,
                  grade: "",
                },
              ],
            }
          : semester,
      ),
    );
  };

  const removeCourse = (id) => {
    setSemesters((prev) =>
      prev.map((semester) => {
        if (semester.id !== activeSemesterId) {
          return semester;
        }

        if (semester.courses.length <= 3) {
          return semester;
        }

        return {
          ...semester,
          courses: semester.courses.filter((course) => course.id !== id),
        };
      }),
    );
  };

  const handleCalculate = () => {
    const semester = calcState(activeSemester?.courses ?? []);
    const overall = calcState(semesters.flatMap((s) => s.courses));

    return {
      semesterGpa: semester.cgpa,
      cgpa: overall.cgpa,
      credit: overall.credit,
    };
  };

  //   ========================

  return (
    <div className=" mt-8">
      <div className="flex  gap-5 justify-between">
        <div className="border border-black/10 rounded-2xl flex-4 p-5">
          {/* tab area */}
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              {semesters.map((semester) => (
                <div key={semester.id}>
                  <div className="flex items-center gap-1">
                    {/* semester tabs */}
                    <button
                      type="button"
                      onClick={() => setActiveSemesterId(semester.id)}
                      className={`h-10 rounded-full px-4 text-[15px] transition ${
                        activeSemesterId === semester.id
                          ? "bg-primary-tint text-primary-dark"
                          : "text-slate hover:bg-primary-tint hover:text-primary-dark"
                      }`}
                    >
                      {semester.name}
                    </button>

                    {/* delete button */}
                    <button
                      type="button"
                      onClick={() => removeSemester(semester.id)}
                      className="cursor-pointer text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <button
                onClick={addSemester}
                type="button"
                className="h-10 rounded-full px-4 text-[15px] text-slate transition hover:bg-primary-tint hover:text-primary-dark cursor-pointer"
              >
                + Add semester
              </button>
            </div>
          </div>

          {/* row and column area */}
          <div className="space-y-3 mt-5">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-3 font-semibold text-sm text-slate-600 ">
              <div className="col-span-5">Course Name</div>
              <div className="col-span-2">Credit</div>
              <div className="col-span-4">Grade</div>
            </div>

            {/* Course Rows */}
            {activeSemester?.courses.map((c, i) => (
              <div key={i} className="grid grid-cols-12 items-center gap-3">
                {/* Course Name */}
                <div className="col-span-5">
                  <input
                    type="text"
                    placeholder="Course name"
                    value={c.courseName}
                    onChange={(e) =>
                      handleCourseChange(c.id, "courseName", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Credit */}
                <div className="col-span-2">
                  <input
                    type="number"
                    placeholder="Credit"
                    min="0"
                    value={c.credit}
                    onChange={(e) =>
                      handleCourseChange(c.id, "credit", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Grade */}
                <div className="col-span-4">
                  <select
                    value={c.grade}
                    onChange={(e) =>
                      handleCourseChange(c.id, "grade", e.target.value)
                    }
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
                  >
                    <option value="">Select Grade</option>
                    <option value="4.00">A+ (4.00)</option>
                    <option value="3.75">A (3.75)</option>
                    <option value="3.50">A- (3.50)</option>
                    <option value="3.25">B+ (3.25)</option>
                    <option value="3.00">B (3.00)</option>
                    <option value="2.75">B- (2.75)</option>
                    <option value="2.50">C+ (2.50)</option>
                    <option value="2.25">C (2.25)</option>
                    <option value="2.00">D (2.00)</option>
                    <option value="0.00">F (0.00)</option>
                  </select>
                </div>

                <button
                  type="button"
                  aria-label="Remove course"
                  onClick={() => removeCourse(c.id)}
                  className=" col-span-1 flex h-11 w-11 cursor-pointer items-center justify-center rounded-[10px] text-muted transition hover:bg-primary-tint hover:text-primary-dark"
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
            <div className="flex justify-between mt-10">
              <button
                type="button"
                onClick={addCourse}
                className="h-11 rounded-[10px] border border-dashed border-outline bg-transparent px-[18px] text-[15px] font-medium text-ink transition hover:bg-primary-tint hover:border-primary cursor-pointer"
              >
                + Add course
              </button>
              <button
                type="button"
                onClick={() => setResult(handleCalculate())}
                className="h-12 cursor-pointer rounded-xl bg-primary px-7 font-medium text-white transition hover:bg-primary-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                Calculate
              </button>
            </div>
          </div>
        </div>

        {/* aside */}
        <div className="  flex-2 ">
          <div className="rounded-2xl bg-ink p-7 text-white">
            <h3 className="text-sm text-slate-300">Your CGPA</h3>

            <p className="my-2 text-6xl font-bold leading-tight tracking-tight">
              {(result?.cgpa ?? 0).toFixed(2)}
            </p>

            {/* Progress bar */}
            <div
              role="progressbar"
              aria-label="CGPA out of 4.00"
              aria-valuemin={0}
              aria-valuemax={4}
              aria-valuenow={result?.cgpa}
              className="h-2 rounded-full bg-slate-700"
            >
              <div
                className="h-2 rounded-full bg-primary-light transition-all"
                style={{
                  width: `${Math.min(((result?.cgpa ?? 0) / 4) * 100, 100)}%`,
                }}
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
      <div>
        {/* // return-er bhitore, shobar niche */}
        {result && (
          <ReportDownload
            semesters={semesters}
            activeSemester={activeSemester}
          />
        )}
      </div>
    </div>
  );
};

export default CGPACalculator;
