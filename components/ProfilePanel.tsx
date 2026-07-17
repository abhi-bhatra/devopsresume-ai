"use client";

import { ExtractedProfile } from "@/lib/azure-openai";

interface ProfilePanelProps {
  profile: ExtractedProfile;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      {value ? (
        <span className="text-sm text-slate-200 font-medium">{value}</span>
      ) : (
        <span className="text-sm text-red-400 flex items-center gap-1">
          <span>✗</span> Not found
        </span>
      )}
    </div>
  );
}

function atsScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function atsBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-yellow-500";
  if (score >= 40) return "bg-orange-500";
  return "bg-red-500";
}

function atsLabel(score: number): string {
  if (score >= 80) return "ATS Friendly";
  if (score >= 60) return "Mostly Parseable";
  if (score >= 40) return "Partially Parseable";
  return "Hard to Parse";
}

export default function ProfilePanel({ profile }: ProfilePanelProps) {
  return (
    <div className="space-y-5">
      {/* ATS Compatibility Score */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-sm font-semibold text-white">ATS Compatibility</h3>
            <p className="text-xs text-slate-500 mt-0.5">How easily a real ATS can parse your resume</p>
          </div>
          <div className="text-right">
            <span className={`text-2xl font-black ${atsScoreColor(profile.atsScore)}`}>
              {profile.atsScore}
            </span>
            <span className="text-slate-500 text-sm">/100</span>
            <p className={`text-xs font-medium mt-0.5 ${atsScoreColor(profile.atsScore)}`}>
              {atsLabel(profile.atsScore)}
            </p>
          </div>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
          <div
            className={`h-2 rounded-full transition-all duration-700 ${atsBarColor(profile.atsScore)}`}
            style={{ width: `${profile.atsScore}%` }}
          />
        </div>
        {profile.atsIssues.length > 0 && (
          <div className="space-y-1.5">
            {profile.atsIssues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-300">
                <span className="mt-0.5 shrink-0 text-red-400">!</span>
                <span>{issue}</span>
              </div>
            ))}
          </div>
        )}
        {profile.atsIssues.length === 0 && (
          <p className="text-xs text-emerald-400">No major ATS parsing issues detected.</p>
        )}
      </div>

      {/* Contact Info */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Contact Information
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name" value={profile.name} />
          <Field label="Email" value={profile.email} />
          <Field label="Phone" value={profile.phone} />
          <Field label="LinkedIn" value={profile.linkedin} />
        </div>
      </div>

      {/* Work Experience */}
      {profile.experience.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Work Experience
            </h3>
            {profile.totalYearsExperience !== null && (
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-1 rounded-full font-medium">
                ~{profile.totalYearsExperience} yrs total
              </span>
            )}
          </div>
          <div className="space-y-3">
            {profile.experience.map((job, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{job.title}</p>
                  <p className="text-xs text-slate-400">
                    {job.company}
                    {job.duration && <span className="text-slate-500"> · {job.duration}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Education
          </h3>
          <div className="space-y-3">
            {profile.education.map((edu, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">{edu.degree}</p>
                  <p className="text-xs text-slate-400">
                    {edu.institution}
                    {edu.year && <span className="text-slate-500"> · {edu.year}</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Detected Skills
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="px-2.5 py-1 bg-slate-700 text-slate-300 rounded-md text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {profile.certifications.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Certifications
          </h3>
          <div className="flex flex-wrap gap-2">
            {profile.certifications.map((cert) => (
              <span
                key={cert}
                className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-md text-xs font-medium"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
