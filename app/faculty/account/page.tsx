"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Landmark,
  Table,
  UserPen,
  Mail,
  Phone,
  Building2,
  IdCard,
} from "lucide-react";
import { useAuth } from "@/app/context/auth";
import { useTheme } from "@/app/context/theme";
import Footer from "@/app/components/footer/page";
import { useParams } from "next/navigation";

import { departmentMap } from "@/app/constants/branch";
import { Faculty } from "@/app/constants/interface";
interface Settings {
  appearance: {
    theme: string;
  };
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

export default function FacultyPage() {
  const params = useParams();
  const { facultyData, setFacultyData } = useAuth();
  const [isTimeTableOpen, setIsTimeTableOpen] = useState(false);
  const [timeTableLoading, setTimeTableLoading] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [subjectLoading, setSubjectLoading] = useState(false);

  const [subjects, setSubjects] = useState<
    Record<
      string,
      Array<{ subjectName: string; subjectCode: string; classId: string }>
    >
  >({});

  async function fetchSubjects() {
    try {
      setSubjectLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/faculty/subjects?facultyId=${facultyData?.facultyId}`
      );
      setSubjectLoading(false);
      setSubjects(res.data.subjectsBySemester);
    } catch (error) {
      console.error(error);
    }
  }

  const PERIODS = [
    { period: 1, time: "9:00-9:50" },
    { period: 2, time: "9:50-10:40" },
    { period: 3, time: "10:40-11:30" },
    { period: 4, time: "11:30-12:20" },
    { period: 5, time: "12:20-1:10" },
    { period: 6, time: "1:10-2:00" },
    { period: 7, time: "2:00-2:50" },
    { period: 8, time: "2:50-3:40" },
    { period: 9, time: "3:40-4:30" },
    { period: 10, time: "4:30-5:20" },
  ];

  const [timetable, setTimetable] = useState<
    Array<{
      day: string;
      period: number;
      subjectName: string;
      room: string;
      classId: string;
    }>
  >([]);

  async function fetchTimetable() {
    try {
      setTimeTableLoading(true);
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/api/faculty/schedule?facultyId=${facultyData?.facultyId}`
      );
      setTimeTableLoading(false);
      setTimetable(res.data.schedule);
    } catch (err) {
      console.error(err);
    }
  }

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  const timetableMap: Record<string, Record<string, any>> = {};
  days.forEach((d) => (timetableMap[d] = {}));

  timetable.forEach((item) => {
    timetableMap[item.day][item.period] = item;
  });

  const [settings, setSettings] = useState<Settings>({
    appearance: {
      theme: "light",
    },
    privacy: {
      showEmail: true,
      showPhone: false,
    },
  });

  const { theme } = useTheme();
  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
    }
  }, []);

  return (
    <div
      className={`min-h-screen p-2 md:p-8 transition-colors ${
        theme == "dark" ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold transition-colors ${
              theme == "dark" ? "text-white" : "text-gray-900"
            }`}
          >
            Account
          </h1>
          <p
            className={`mt-1 transition-colors ${
              theme == "dark" ? "text-gray-400" : "text-gray-600"
            }`}
          >
            View and manage your account information
          </p>
        </div>

        {facultyData ? (
          <>
            <div
              className={`rounded-3xl shadow-sm overflow-hidden mb-6 transition-colors ${
                theme == "dark"
                  ? "bg-gray-800 border-2 border-gray-700"
                  : "bg-white border-2 border-gray-200"
              }`}
            >
              <div
                className={`h-32 transition-colors ${
                  theme == "dark"
                    ? "bg-gradient-to-r from-red-800 to-red-800"
                    : "bg-gradient-to-r from-red-500 to-red-600"
                }`}
              ></div>

              <div className="px-8 pb-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 -mt-16 mb-8">
                  <div className="relative">
                    <div className="relative w-32 h-32">
                      {facultyData.profilePicture ? (
                        <Image
                          src={facultyData.profilePicture}
                          alt="Profile"
                          fill
                          className={`rounded-full object-cover shadow-lg transition-colors ${
                            theme == "dark"
                              ? "border-4 border-gray-800"
                              : "border-4 border-white"
                          }`}
                        />
                      ) : (
                        <div
                          className={`w-full h-full rounded-full flex items-center justify-center text-4xl font-bold shadow-lg transition-colors ${
                            theme == "dark"
                              ? "bg-red-600 text-white border-4 border-gray-800"
                              : "bg-red-500 text-white border-4 border-white"
                          }`}
                        >
                          {facultyData.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left mt-16 sm:mt-20">
                    <h2
                      className={`text-2xl font-bold transition-colors ${
                        theme == "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {facultyData.name}
                    </h2>
                    <p
                      className={`mt-1 transition-colors ${
                        theme == "dark" ? "text-gray-400" : "text-gray-600"
                      }`}
                    >
                      School of Engineering and Technology
                    </p>
                  </div>
                  <div
                    className={`inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-lg transition-colors ${
                      theme == "dark"
                        ? "bg-red border border-white"
                        : "bg-white border border-white"
                    }`}
                  >
                    <UserPen
                      className={`w-4 h-4 ${
                        theme == "dark" ? "text-white" : "text-red-600"
                      }`}
                    />
                    <span
                      className={`text-sm font-semibold ${
                        theme == "dark" ? "text-white" : "text-red-600"
                      }`}
                    >
                      {facultyData.type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-red-900/40" : "bg-red-100"
                        }`}
                      >
                        <IdCard
                          className={`w-5 h-5 ${
                            theme == "dark" ? "text-red-400" : "text-red-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Faculty ID
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {facultyData.facultyId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-blue-900/40" : "bg-blue-100"
                        }`}
                      >
                        <Building2
                          className={`w-5 h-5 ${
                            theme == "dark" ? "text-blue-400" : "text-blue-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          School ID
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {facultyData.schoolId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-green-900/40" : "bg-green-100"
                        }`}
                      >
                        <Mail
                          className={`w-5 h-5 ${
                            theme == "dark"
                              ? "text-green-400"
                              : "text-green-600"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Official Email
                        </p>
                        <p
                          className={`text-base font-semibold truncate transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {facultyData.officialEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                          theme == "dark" ? "bg-purple-900/40" : "bg-purple-100"
                        }`}
                      >
                        <Phone
                          className={`w-5 h-5 ${
                            theme == "dark"
                              ? "text-purple-400"
                              : "text-purple-600"
                          }`}
                        />
                      </div>
                      <div>
                        <p
                          className={`text-xs font-medium uppercase transition-colors ${
                            theme == "dark" ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          Phone Number
                        </p>
                        <p
                          className={`text-base font-semibold transition-colors ${
                            theme == "dark" ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {facultyData.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div
                  className={`rounded-xl p-5 transition-colors mt-6 ${
                    theme == "dark"
                      ? "bg-gray-900/50 border-2 border-gray-700"
                      : "bg-gray-50 border-2 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${
                        theme == "dark" ? "bg-orange-900/40" : "bg-orange-100"
                      }`}
                    >
                      <Landmark
                        className={`w-5 h-5 ${
                          theme == "dark"
                            ? "text-orange-400"
                            : "text-orange-600"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`text-xs font-medium uppercase transition-colors ${
                          theme == "dark" ? "text-gray-500" : "text-gray-500"
                        }`}
                      >
                        Department
                      </p>
                      <p
                        className={`text-base font-semibold transition-colors ${
                          theme == "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {departmentMap[facultyData.departmentId] ||
                          facultyData.departmentId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className={`rounded-3xl p-6 transition-colors ${
                  theme == "dark"
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3
                  className={`text-xl font-bold mb-4 transition-colors ${
                    theme == "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  School Information
                </h3>
                <div
                  className={`rounded-xl p-6 transition-colors ${
                    theme == "dark"
                      ? "bg-gradient-to-br from-red-900/30 to-orange-900/30 border-2 border-red-800"
                      : "bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        theme == "dark" ? "bg-red-600" : "bg-red-500"
                      }`}
                    >
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p
                        className={`text-sm mb-1 transition-colors ${
                          theme == "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Affiliated School
                      </p>
                      <p
                        className={`text-lg font-bold transition-colors ${
                          theme == "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        School of Engineering and Technology
                      </p>
                      <p
                        className={`text-sm transition-colors ${
                          theme == "dark" ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        ID: {facultyData.schoolId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className={`rounded-3xl p-6 transition-colors flex-1 space-y-4 ${
                theme == "dark"
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <h3
                className={`text-xl font-bold mb-4 transition-colors ${
                  theme == "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Additional Information
              </h3>
              <div
                onClick={() => {
                  const willOpen = !isTimeTableOpen;
                  setIsTimeTableOpen(willOpen);

                  if (willOpen) fetchTimetable();
                }}
                className={`rounded-xl p-6 transition-colors space-y-4 flex flex-col cursor-pointer ${
                  theme == "dark"
                    ? "bg-gradient-to-br from-gray-900/30 to-orange-900/30 border-2 border-gray-800"
                    : "bg-gradient-to-br from-gray-50 to-orange-50 border-2 border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        theme == "dark" ? "bg-gray-600" : "bg-gray-500"
                      }`}
                    >
                      <Table className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xl">Time Table</h2>
                    </div>
                  </div>
                  <div>
                    {isTimeTableOpen ? (
                      <ChevronUp size={30}></ChevronUp>
                    ) : (
                      <ChevronDown size={30}></ChevronDown>
                    )}
                  </div>
                </div>

                {isTimeTableOpen && !timeTableLoading && (
                  <div
                    className={`mt-4 rounded-xl overflow-x-auto ${
                      theme === "dark" ? "bg-gray-900/40" : "bg-white"
                    }`}
                  >
                    <table
                      className={`w-full border-collapse ${
                        theme === "dark" ? "border-gray-700" : "border-gray-300"
                      }`}
                    >
                      <thead>
                        <tr>
                          <th
                            className={`p-3 text-left border ${
                              theme === "dark"
                                ? "border-gray-700 bg-gray-900/60 text-gray-300"
                                : "border-gray-300 text-gray-700 bg-gray-50"
                            }`}
                          ></th>

                          {PERIODS.map((slot) => (
                            <th
                              key={slot.period}
                              className={`p-3 text-sm font-semibold border w-32 text-center ${
                                theme === "dark"
                                  ? "border-gray-700 text-gray-300 bg-gray-900/60"
                                  : "border-gray-300 text-gray-700 bg-gray-50"
                              }`}
                            >
                              {slot.time}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {days.map((day) => (
                          <tr key={day}>
                            <td
                              className={`p-3 font-semibold capitalize border w-28 text-center ${
                                theme === "dark"
                                  ? "border-gray-700 text-gray-200 bg-gray-900/60"
                                  : "border-gray-300 text-gray-700 bg-gray-50"
                              }`}
                            >
                              {day}
                            </td>

                            {PERIODS.map((slot) => {
                              const cell = timetableMap[day][slot.period];

                              return (
                                <td
                                  key={slot.period}
                                  className={`border h-24 w-32 p-2 align-middle text-xs text-center ${
                                    theme === "dark"
                                      ? "border-gray-700 text-gray-300 bg-gray-800/40"
                                      : "border-gray-300 text-gray-800"
                                  }`}
                                >
                                  {cell ? (
                                    <div className="space-y-1 flex flex-col justify-center h-full">
                                      <p className="font-bold">
                                        {cell.subjectName}
                                      </p>
                                      <p className="opacity-80">
                                        Room: {cell.room}
                                      </p>
                                      <p className="opacity-80">
                                        {cell.classId}
                                      </p>
                                      <p className="opacity-80">
                                        Semester {cell.semester}
                                      </p>
                                    </div>
                                  ) : (
                                    <span className="opacity-30">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {isTimeTableOpen && timeTableLoading && (
                  <>
                    <div className="animate-pulse space-y-2 flex-1">
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                      <div className="h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                  </>
                )}
              </div>
              <div
                onClick={() => {
                  const willOpen = !isSubjectsOpen;
                  setIsSubjectsOpen(willOpen);

                  if (willOpen) {
                    fetchSubjects();
                  }
                }}
                className={`rounded-xl p-6 transition-colors cursor-pointer ${
                  theme == "dark"
                    ? "bg-gradient-to-br from-gray-900/30 to-orange-900/30 border-2 border-gray-800"
                    : "bg-gradient-to-br from-gray-50 to-orange-50 border-2 border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        theme == "dark" ? "bg-gray-600" : "bg-gray-500"
                      }`}
                    >
                      <BookOpen className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="font-bold text-xl">Subjects</h2>
                    </div>
                  </div>
                  <div>
                    {isSubjectsOpen ? (
                      <ChevronUp size={30}></ChevronUp>
                    ) : (
                      <ChevronDown size={30}></ChevronDown>
                    )}
                  </div>
                </div>
                {isSubjectsOpen && !subjectLoading && (
                  <div className="mt-4 space-y-6">
                    {Object.keys(subjects).map((sem) => (
                      <div key={sem}>
                        <h2 className="text-lg font-bold mb-3">
                          Semester {sem}
                        </h2>

                        <div className="space-y-4">
                          {subjects[sem].map((subj, idx) => (
                            <div
                              key={idx}
                              className={`rounded-xl p-4 border-2 ${
                                theme === "dark"
                                  ? "bg-gray-900/50 border-gray-700"
                                  : "bg-white border-gray-300"
                              }`}
                            >
                              <div className="w-full grid grid-cols-3">
                                <p className="font-semibold text-md text-left px-5">
                                  {subj.subjectName}
                                </p>

                                <div className="text-sm opacity-80 text-center">
                                  Code: {subj.subjectCode}
                                </div>

                                <div className="text-sm opacity-80 text-right px-5">
                                  Branch: {subj.classId}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {isSubjectsOpen && subjectLoading && (
                  <>
                    <div className="mt-4 space-y-6 animate-pulse">
                      <div className="text-lg h-10 w-40 bg-gray-200 rounded-lg font-bold mb-3"></div>
                      <div className="text-lg h-18 bg-gray-200 rounded-lg font-bold mb-3"></div>
                      <div className="text-lg h-18 bg-gray-200 rounded-lg font-bold mb-3"></div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <div
            className={`rounded-3xl shadow-sm overflow-hidden transition-colors ${
              theme == "dark"
                ? "bg-gray-800 border-2 border-gray-700"
                : "bg-white border-2 border-gray-200"
            }`}
          >
            <div
              className={`h-32 animate-pulse ${
                theme == "dark" ? "bg-gray-700" : "bg-gray-300"
              }`}
            ></div>
            <div className="px-8 pb-8">
              <div className="flex items-start gap-6 -mt-16 mb-8">
                <div
                  className={`w-32 h-32 rounded-full animate-pulse ${
                    theme == "dark"
                      ? "bg-gray-700 border-4 border-gray-800"
                      : "bg-gray-300 border-4 border-white"
                  }`}
                ></div>
                <div className="flex-1 mt-20">
                  <div
                    className={`h-8 rounded w-1/2 mb-2 animate-pulse ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-300"
                    }`}
                  ></div>
                  <div
                    className={`h-5 rounded w-1/3 animate-pulse ${
                      theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                    }`}
                  ></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`rounded-xl p-5 transition-colors ${
                      theme == "dark"
                        ? "bg-gray-900/50 border-2 border-gray-700"
                        : "bg-gray-50 border-2 border-gray-200"
                    }`}
                  >
                    <div
                      className={`h-16 rounded animate-pulse ${
                        theme == "dark" ? "bg-gray-700" : "bg-gray-200"
                      }`}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
