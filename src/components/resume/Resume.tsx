import React, { useEffect, useState } from "react";
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
import { Button, Announcement } from "../ui";
import { cleanUrl } from "../../utils/functions/format";
import { Nunito } from "next/font/google";

export const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-nunito",
});

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
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsLocalhost(window.location.href.includes("localhost"));

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
    <div
      className={`relative w-full min-w-[320px] mx-auto pt-4 mt-12 md:mt-16`}
    >
      <div className="w-full max-w-4xl mx-auto mb-4 flex flex-col md:flex-row justify-between gap-4 print:hidden">
        <div>
          <Announcement />
        </div>
        <div className="flex flex-row justify-end gap-2">
          <Button
            icon={<FaDownload />}
            label="Download PDF"
            onClick={onExportPDF}
            disabledReason="PDF download is locked"
            disabled={isGeneratingPDF || isLocalhost}
            variant="primary"
          />
          <Button
            icon={<FaAddressCard />}
            label="Contact Me"
            href="/#contact"
            variant="secondary"
          />
        </div>
      </div>

      {/* Resume Container */}
      <div
        id="resume-container"
        className={`${nunito.className} bg-white ${!isGeneratingPDF ? "shadow-lg" : "bg-white"} py-4 px-8 sm:py-8 sm:px-16 max-w-4xl mx-auto rounded overflow-x-auto`}
      >
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold uppercase mb-2 text-gray-900">
            {data.full_name}
          </h1>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 text-xs sm:text-sm mb-1">
            <span className="text-gray-900">
              <FaPhone className="text-gray-600 w-4 h-4 inline-block mr-1" />
              <span
                className={`phone-display ${hideContactInfo && !isGeneratingPDF ? "blur-sm" : ""}`}
              >
                {hideContactInfo && !isGeneratingPDF
                  ? "(555) 555-5555"
                  : data.phone}
              </span>
            </span>
            <span className="text-gray-900">
              <FaEnvelope className="text-gray-600 w-4 h-4 inline-block mr-1" />
              <span
                className={`email-display ${hideContactInfo && !isGeneratingPDF ? "blur-sm" : ""}`}
              >
                {hideContactInfo && !isGeneratingPDF
                  ? "redacted@email.com"
                  : data.email}
              </span>
            </span>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-4 text-xs sm:text-sm mt-2">
            <a
              href={data.socials.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline"
            >
              <FaLinkedin className="text-gray-600 w-4 h-4 inline-block mr-1" />
              {cleanUrl(data.socials.linkedin_url)}
            </a>
            <span className="text-gray-400 hidden sm:inline">◆</span>
            <a
              href={data.socials.github_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-700 hover:underline"
            >
              <FaGithub className="text-gray-600 w-4 h-4 inline-block mr-1" />
              {cleanUrl(data.socials.github_url)}
            </a>
            <span className="text-gray-400 hidden sm:inline">◆</span>
            <a
              href={data.socials.portfolio_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-700 hover:underline"
            >
              <FaGlobe className="text-gray-600 w-4 h-4 inline-block mr-1" />
              {cleanUrl(data.socials.portfolio_url)}
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
            <div
              id={index === 3 ? "page2el" : undefined}
              key={index}
              className="mb-2 last:mb-0"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline">
                <h3 className="text-base font-bold">{exp.company}</h3>
                <span className="text-gray-600 italic text-xs sm:text-sm">
                  {exp.duration.startDate} - {exp.duration.endDate || "Present"}
                </span>
              </div>
              <div className="flex justify-between items-baseline mb-1">
                <p className="italic text-sm">{exp.position}</p>
              </div>
              <ul className="resume-list text-xs sm:text-sm sm:leading-4">
                {exp.description.map((item, i) => (
                  <li key={i} className="list-none">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Technical Strengths Section */}
        <section
          className={`mb-4 text-gray-900 ${isGeneratingPDF ? "pt-16" : ""}`}
        >
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
