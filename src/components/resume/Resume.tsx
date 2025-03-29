import React, { useEffect } from "react";
import {
  FaLinkedin,
  FaGithub,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaDownload,
  FaAddressCard,
} from "react-icons/fa";
import { ResumeData } from "../../types/resume";
import Link from "next/link";
import { cleanUrl } from "../../utils/functions/format";

interface ResumeProps {
  data: ResumeData;
  onExportPDF: () => void;
  isGeneratingPDF?: boolean;
  hideContactInfo?: boolean;
}

const Resume: React.FC<ResumeProps> = ({
  data,
  onExportPDF,
  isGeneratingPDF = false,
  hideContactInfo = true,
}) => {
  useEffect(() => {
    const handleResize = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (window.innerWidth < 768) {
        // For mobile screens, set initial scale to zoom out a bit
        viewport?.setAttribute(
          "content",
          "width=device-width, initial-scale=0.85, maximum-scale=1.0, user-scalable=yes"
        );
      } else {
        // Reset for larger screens
        viewport?.setAttribute(
          "content",
          "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes"
        );
      }
    };
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full min-w-[320px] mx-auto pt-4 mt-12 md:mt-8 font-[helvetica]">
      {/* Export Buttons */}
      <div className="absolute top-[-0.5rem] right-4 sm:top-0 xl:right-52 print:hidden flex flex-row gap-2">
        <button
          onClick={onExportPDF}
          className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded shadow transition-colors flex items-center gap-2 text-sm"
          disabled={isGeneratingPDF}
        >
          <FaDownload /> Download PDF
        </button>
        <Link
          href="/#contact"
          className="bg-secondary-bg hover:bg-primary/80 hover:dark:bg-secondary-bg/80 border-neutral-800 text-foreground px-4 py-2 rounded shadow transition-colors flex items-center gap-2 text-sm"
        >
          <FaAddressCard /> Contact Me
        </Link>
      </div>
      {/* Resume Container */}
      <div
        id="resume-container"
        className="bg-white shadow-lg p-4 sm:p-8 max-w-4xl mx-auto rounded overflow-x-auto"
      >
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-2xl sm:text-3xl font-bold uppercase mb-2 text-gray-900">
            {data.full_name}
          </h1>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm mb-1">
            <span className="flex items-center gap-1 text-gray-900">
              <FaPhone className="text-gray-600" />
              <span
                className={`phone-display ${hideContactInfo ? "blur-sm" : ""}`}
              >
                {hideContactInfo ? "(555) 555-5555" : data.phone}
              </span>
            </span>
            <span className="flex items-center gap-1 text-gray-900">
              <FaEnvelope className="text-gray-600" />
              <span
                className={`email-display ${hideContactInfo ? "blur-sm" : ""}`}
              >
                {hideContactInfo ? "redacted@email.com" : data.email}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <a
              href={data.socials.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:underline"
            >
              <FaLinkedin /> {cleanUrl(data.socials.linkedin_url)}
            </a>
            <span className="text-gray-400 hidden sm:inline">◆</span>
            <a
              href={data.socials.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:underline"
            >
              <FaGithub /> {cleanUrl(data.socials.github_url)}
            </a>
            <span className="text-gray-400 hidden sm:inline">◆</span>
            <a
              href={data.socials.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:underline"
            >
              <FaGlobe /> {cleanUrl(data.socials.portfolio_url)}
            </a>
          </div>
        </header>

        {/* Summary Section */}
        <section className="mb-4 text-gray-900">
          <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-300">
            Summary
          </h2>
          <p className="mt-1 text-xs sm:text-sm">{data.summary}</p>{" "}
        </section>

        {/* Experience Section */}
        <section className="mb-4 text-gray-900">
          <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-300">
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-2">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                <h3 className="text-base sm:text-lg font-bold">
                  {exp.company}
                </h3>
                <span className="text-gray-600 italic text-xs sm:text-sm">
                  {exp.duration.startDate} - {exp.duration.endDate || "Present"}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <p className="italic text-sm">{exp.position}</p>
              </div>
              <ul className="list-disc ml-5 text-xs sm:text-sm">
                {exp.description.map((item, i) => (
                  <li key={i} className="">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Technical Strengths Section */}
        <section className="mb-4 text-gray-900">
          <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-300">
            Technical Strengths
          </h2>
          <table className="w-full">
            <tbody>
              {data.skills.map((skill, index) => (
                <tr key={index} className="mb-0.3 text-xs sm:text-sm">
                  <td className="font-bold pr-4 align-top w-1/3 sm:w-[35%]">
                    {skill.skill_title}
                  </td>
                  <td>{skill.skill_items}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Education Section */}
        <section className="mb-2 text-gray-900">
          <h2 className="font-bold uppercase mb-2 pb-1 border-b border-gray-300">
            Education
          </h2>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
            <h3 className="font-bold text-sm">
              {data.education.institution}, {data.education.location}
            </h3>
            <span className="text-gray-600 italic text-xs sm:text-sm">
              {data.education.duration.startDate} -{" "}
              {data.education.duration.endDate || "Present"}
            </span>
          </div>
          <p className="text-xs sm:text-sm">{data.education.degree}</p>
        </section>
      </div>
    </div>
  );
};

export default Resume;
