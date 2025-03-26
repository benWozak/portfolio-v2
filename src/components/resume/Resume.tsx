import React from "react";
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
  return (
    <div className="relative max-w-4xl mx-auto pt-4 mt-8 font-[helvetica]">
      {/* Export Buttons */}
      <div className="absolute top-0 right-4 print:hidden flex gap-2">
        <button
          onClick={onExportPDF}
          className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded shadow transition-colors flex items-center gap-2"
          disabled={isGeneratingPDF}
        >
          <FaDownload /> Download PDF
        </button>
        <Link
          href="/#contact"
          className="bg-secondary-bg hover:bg-primary/80 hover:dark:bg-secondary-bg/80 border-neutral-800 text-foreground px-4 py-2 rounded shadow transition-colors flex items-center gap-2"
        >
          <FaAddressCard /> Contact Me
        </Link>
      </div>
      {/* Resume Container */}
      <div
        id="resume-container"
        className="bg-white shadow-lg p-8 max-w-4xl mx-auto rounded" /* Reduced padding from p-8 to p-6 */
      >
        {/* Header */}
        <header className="text-center mb-4">
          <h1 className="text-2xl font-bold uppercase mb-1 text-gray-900">
            {data.full_name}
          </h1>
          <div className="flex justify-center gap-4 text-sm mb-1">
            <span className="flex items-center gap-1 text-gray-900">
              <FaPhone className="text-gray-600" />
              <span className="phone-display">
                {hideContactInfo ? "(555) 555-5555" : data.phone}
              </span>
            </span>
            <span className="flex items-center gap-1 text-gray-900">
              <FaEnvelope className="text-gray-600" />
              <span className="email-display">
                {hideContactInfo ? "redacted@email.com" : data.email}
              </span>
            </span>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <a
              href={data.socials.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:underline"
            >
              <FaLinkedin /> {cleanUrl(data.socials.linkedin_url)}
            </a>
            <span className="text-gray-400">◆</span>
            <a
              href={data.socials.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-700 hover:underline"
            >
              <FaGithub /> {cleanUrl(data.socials.github_url)}
            </a>
            <span className="text-gray-400">◆</span>
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
          <h2 className="font-bold uppercase mb-1 pb-2 border-b border-gray-300">
            Summary
          </h2>
          <p className="mt-1 text-sm">{data.summary}</p>{" "}
        </section>

        {/* Experience Section */}
        <section className="mb-4 text-gray-900">
          <h2 className="font-bold uppercase mb-1 pb-2 border-b border-gray-300">
            Experience
          </h2>
          {data.experience.map((exp, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="text-lg font-bold">{exp.company}</h3>
                <span className="text-gray-600 italic">
                  {exp.duration.startDate} - {exp.duration.endDate || "Present"}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <p className="italic">{exp.position}</p>
              </div>
              <ul className="list-disc ml-5 text-sm">
                {exp.description.map((item, i) => (
                  <li key={i} className="mb-1">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Technical Strengths Section */}
        <section className="mb-4 text-gray-900">
          <h2 className="font-bold uppercase mb-1 pb-2 border-b border-gray-300">
            Technical Strengths
          </h2>
          <table className="w-full">
            <tbody>
              {data.skills.map((skill, index) => (
                <tr key={index} className="mb-0.3 text-sm">
                  <td className="font-bold pr-4 align-top w-[35%]">
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
          <h2 className="font-bold uppercase mb-1 pb-2 border-b border-gray-300">
            Education
          </h2>
          <div className="flex justify-between items-baseline">
            <h3 className="font-bold">
              {data.education.institution}, {data.education.location}
            </h3>
            <span className="text-gray-600 italic text-sm">
              {data.education.duration.startDate} -{" "}
              {data.education.duration.endDate || "Present"}
            </span>
          </div>
          <p className="text-sm">{data.education.degree}</p>
        </section>
      </div>
    </div>
  );
};

export default Resume;
