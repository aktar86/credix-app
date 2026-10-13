import Link from "next/link";

const features = [
  {
    title: "Add your courses",
    text: "Enter the course name, credits and grade for each subject.",
  },
  {
    title: "See your result instantly",
    text: "Your semester GPA and CGPA update as you type.",
  },
  {
    title: "Track every semester",
    text: "Add as many semesters as you need and see your overall progress.",
  },
];

const Home = () => {
  return (
    <section className="flex flex-col items-center text-center">
      <span className="rounded-full bg-primary-tint px-4 py-1.5 text-sm font-medium text-primary-dark">
        Free CGPA calculator
      </span>

      <h1 className="mt-6 max-w-2xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
        Calculate your CGPA in seconds
      </h1>

      <p className="mt-4 max-w-xl text-lg text-slate">
        Add your courses, credits and grades. CredixApp does the math and shows
        your result clearly.
      </p>

      <Link
        href="/cgpa"
        className="mt-8 inline-flex h-12 items-center rounded-xl bg-primary px-8 font-medium text-white transition hover:bg-primary-dark"
      >
        Start calculating
      </Link>

      <div className="mt-16 grid w-full gap-5 text-left sm:grid-cols-3">
        {features.map(({ title, text }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-surface p-6"
          >
            <h2 className="font-semibold text-ink">{title}</h2>
            <p className="mt-2 text-sm text-slate">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Home;
