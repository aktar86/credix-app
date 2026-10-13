import CGPA from "@/components/CGPA/CGPA";

export const metadata = {
  title: "Free CGPA Calculator",
  description:
    "Calculate your semester GPA and overall CGPA for free with CredixApp. Enter course credits and grades, track academic results, and download your CGPA report card.",

  alternates: {
    canonical: "/cgpa",
  },

  openGraph: {
    title: "Free CGPA Calculator | CredixApp",
    description:
      "Calculate semester GPA and overall CGPA, then generate a downloadable academic report card with CredixApp.",
    url: "/cgpa",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Free CGPA Calculator | CredixApp",
    description: "Calculate your CGPA and semester GPA online with CredixApp.",
  },
};

export default function CgpaPage() {
  return (
    <section>
      <div className="mb-10 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          Calculate Your CGPA
        </h1>

        <p className="mt-2 text-base text-slate sm:text-lg">
          Add your courses, credits, and grades to calculate your semester GPA
          and overall CGPA.
        </p>
      </div>

      <CGPA />
    </section>
  );
}
