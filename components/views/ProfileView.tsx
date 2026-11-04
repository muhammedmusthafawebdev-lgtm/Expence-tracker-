'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  User,
  GraduationCap,
  Mail,
  Building,
  Hash,
  Wallet,
  Edit2,
  X,
  Shield,
  ArrowRight,
} from 'lucide-react';
import { formatINR, rupeesToPaise, paiseToRupees } from '@/lib/calculations/financial';

export function ProfileView() {
  const { userProfile, updateProfile, setCurrentScreen } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userProfile.name);
  const [email, setEmail] = useState(userProfile.email);
  const [studentType, setStudentType] = useState(userProfile.studentType);
  const [institution, setInstitution] = useState(userProfile.institution);
  const [rollNumber, setRollNumber] = useState(userProfile.rollNumber);
  const [monthlyAllowanceStr, setMonthlyAllowanceStr] = useState(
    paiseToRupees(userProfile.monthlyAllowancePaise).toString()
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const allowanceRupees = parseFloat(monthlyAllowanceStr) || 0;
    await updateProfile({
      name: name.trim(),
      email: email.trim(),
      studentType,
      institution: institution.trim(),
      rollNumber: rollNumber.trim(),
      monthlyAllowancePaise: rupeesToPaise(allowanceRupees),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Student Profile
          </h2>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3] mt-0.5">
            Academic affiliation, monthly target allowance, and student details
          </p>
        </div>

        <button
          onClick={() => {
            setName(userProfile.name);
            setEmail(userProfile.email);
            setStudentType(userProfile.studentType);
            setInstitution(userProfile.institution);
            setRollNumber(userProfile.rollNumber);
            setMonthlyAllowanceStr(paiseToRupees(userProfile.monthlyAllowancePaise).toString());
            setIsEditing(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200 rounded-xl transition-colors duration-150 self-start sm:self-auto"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit Student Details
        </button>
      </div>

      {/* Main Profile Card */}
      <div className="p-6 md:p-8 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] space-y-8">
        {/* Profile Avatar & Header Block */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shrink-0">
            {userProfile.name ? userProfile.name.charAt(0).toUpperCase() : <User className="w-10 h-10 stroke-[1.5]" />}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {userProfile.name || 'Student Name (Not set)'}
            </h3>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 dark:text-[#A3A3A3]">
              <span>{userProfile.studentType}</span>
              <span>·</span>
              <span>{userProfile.institution || 'Institution Unspecified'}</span>
            </div>
            <div className="text-xs text-slate-400 dark:text-[#A3A3A3]">
              {userProfile.email || 'Email not linked'}
            </div>
          </div>
        </div>

        {/* Detailed Attribute Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-[#262626]">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#A3A3A3]">
              <GraduationCap className="w-4 h-4 text-blue-500" />
              <span>Student Persona</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {userProfile.studentType}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#A3A3A3]">
              <Building className="w-4 h-4 text-blue-500" />
              <span>College / Institute</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {userProfile.institution || '—'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#A3A3A3]">
              <Hash className="w-4 h-4 text-blue-500" />
              <span>Student / Roll ID</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              {userProfile.rollNumber || '—'}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#A3A3A3]">
              <Wallet className="w-4 h-4 text-emerald-500" />
              <span>Monthly Target Allowance</span>
            </div>
            <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
              {formatINR(userProfile.monthlyAllowancePaise)}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#A3A3A3]">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Account Mode</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Local Session (Frontend)
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-[#A3A3A3]">
              <Mail className="w-4 h-4 text-blue-500" />
              <span>Primary Email</span>
            </div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
              {userProfile.email || '—'}
            </div>
          </div>
        </div>
      </div>

      {/* Account & Backend Session Status */}
      <div className="p-6 bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200/80 dark:border-[#262626] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
              Session Status
            </h4>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-[#141414] text-slate-600 dark:text-[#A3A3A3] border border-slate-200/60 dark:border-[#262626]">
              Frontend-Only Preview
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-[#A3A3A3]">
            Operating in standalone frontend mode. Supabase authentication and cloud database persistence will be integrated by the backend engineer in the next phase.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentScreen('welcome')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-[#A3A3A3] bg-slate-100 dark:bg-[#141414] hover:bg-slate-200 dark:hover:bg-[#262626] rounded-xl transition-colors duration-150 border border-slate-200/60 dark:border-[#262626]"
          >
            <span>Exit to Welcome Page</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-md bg-white dark:bg-[#0A0A0A] rounded-2xl border border-slate-200 dark:border-[#262626] shadow-2xl p-5 sm:p-6 max-h-[88dvh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#262626] shrink-0">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Update Student Profile
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white min-w-[36px] min-h-[36px] flex items-center justify-center"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 mt-3 flex-1 overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Aarav Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Student Category Type
                </label>
                <select
                  value={studentType}
                  onChange={(e) => setStudentType(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[42px]"
                >
                  <option value="College Undergraduate">College Undergraduate</option>
                  <option value="Hostel / PG Resident">Hostel / PG Resident</option>
                  <option value="University Scholar / Postgrad">University Scholar / Postgrad</option>
                  <option value="Competitive Exam Aspirant">Competitive Exam Aspirant (JEE/NEET/UPSC)</option>
                  <option value="High School Student">High School Student</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  College / School Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., IIT Bombay / Delhi University"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Roll / Student ID Number
                </label>
                <input
                  type="text"
                  placeholder="e.g., 2026-CS-042"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[42px]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#A3A3A3] mb-1">
                  Expected Monthly Allowance (INR ₹)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 8000"
                  value={monthlyAllowanceStr}
                  onChange={(e) => setMonthlyAllowanceStr(e.target.value)}
                  className="w-full px-3 py-2 text-base sm:text-xs font-semibold tabular-nums bg-slate-50 dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#262626] rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 min-h-[42px]"
                />
              </div>

              <div className="pt-3 pb-1 flex items-center justify-end gap-2 border-t border-slate-100 dark:border-[#262626] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-[#A3A3A3] min-h-[40px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors min-h-[40px]"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
