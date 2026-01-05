"use client";

import { useSearchParams } from "next/navigation";
import axios from "axios";
import { useEffect, useState } from "react";
import { Search, Check, X, Calendar, User } from "lucide-react";
import { useRouter } from "next/navigation";

interface Student {
  uid: string;
  name: string;
  enrollmentNo: string;
}

type AttendanceStatus = "Present" | "Absent" | "Unmarked";

interface StudentAttendance {
  uid: string;
  status: AttendanceStatus;
}

export default function TakeAttendance() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const branch = searchParams.get("branch");
  const semester = Number(searchParams.get("semester"));
  const section = searchParams.get("section");
  const period = Number(searchParams.get("period"));
  const subjectCode = searchParams.get("subjectCode");
  const subjectName = searchParams.get("subjectName");
  const facultyId = searchParams.get("facultyId");
  const today = new Date().toDateString();
  const groupNumber = Number(searchParams.get("groupnumber")) || null;
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<StudentAttendance[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function startAttendanceSession() {
      setLoading(true);

      const res = await axios.post(
        "https://upasthiti-backend-production.up.railway.app/api/faculty/attendance/start",
        {
          facultyId,
          branch,
          section,
          semester,
          period,
          subjectCode,
          groupNumber,
          date: new Date("2026-01-06").toISOString(),
        }
      );

      const newSessionId = res.data.session.sessionId;
      setSessionId(newSessionId);
      const list: Student[] = res.data.session.studentList;
      setStudents(list);

      const initialAttendance: StudentAttendance[] = list.map((s) => ({
        uid: s.uid,
        status: "Unmarked",
      }));

      const saved = localStorage.getItem(newSessionId);
      if (saved) {
        try {
          const parsed: StudentAttendance[] = JSON.parse(saved);
          setAttendance(parsed);
        } catch (e) {
          setAttendance(initialAttendance);
        }
      } else {
        setAttendance(initialAttendance);
      }

      setLoading(false);
    }

    startAttendanceSession();
  }, []);

  function updateStatus(uid: string, status: AttendanceStatus) {
    setAttendance((prev) =>
      prev.map((s) => (s.uid === uid ? { ...s, status } : s))
    );
  }

  function markAll(status: AttendanceStatus) {
    setAttendance((prev) => prev.map((s) => ({ ...s, status })));
  }

  async function saveAttendance() {
    console.log("Final Attendance Data:", attendance);
    try {
      const res = await axios.post(
        `https://upasthiti-backend-production.up.railway.app/api/faculty/attendance/mark`,
        {
          sessionId,
          attendanceData: attendance,
          facultyId,
        }
      );
      localStorage.setItem(sessionId || "", JSON.stringify(attendance))
      router.replace("/faculty/dashboard");
    } catch (error) {
      console.log("Error");
    }
  }

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.enrollmentNo.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen p-6 animate-pulse">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-10 w-60 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded-2xl"></div>
          <div className="h-24 bg-gray-200 rounded-2xl"></div>
          <div className="h-96 bg-gray-200 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold">Mark Attendance</h1>

        <div className="bg-white rounded-2xl border border-gray-200 shadow px-8 py-6 flex justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{subjectName}</h1>
            <p className="text-slate-500">{subjectCode}</p>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Calendar className="w-5 h-5" />
              {today}
            </div>
            <p className="text-slate-500">
              {branch} · Section {section} · Semester {semester}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow p-4 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => markAll("Present")}
              className="px-4 py-1.5 font-medium rounded-lg bg-green-600 text-white cursor-pointer"
            >
              Mark All Present
            </button>

            <button
              onClick={() => markAll("Absent")}
              className="px-4 py-1.5 font-medium rounded-lg bg-red-500 text-white cursor-pointer"
            >
              Mark All Absent
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-gray-300">
              <tr>
                <th className="px-6 py-4 text-left">Enrollment Number</th>
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((s) => {
                const current = attendance.find((a) => a.uid === s.uid);
                return (
                  <tr
                    key={s.uid}
                    className="border-b border-gray-200 hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">{s.enrollmentNo}</td>

                    <td className="px-6 py-4 flex gap-3 items-center">
                      <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-red-600" />
                      </div>
                      {s.name}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          current?.status === "Present"
                            ? "bg-green-100 text-green-700"
                            : current?.status === "Unmarked"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {current?.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => updateStatus(s.uid, "Present")}
                          className="w-10 h-10 flex justify-center items-center rounded-xl bg-slate-100 hover:bg-green-100"
                        >
                          <Check className="w-5 h-5" />
                        </button>

                        <button
                          onClick={() => updateStatus(s.uid, "Absent")}
                          className="w-10 h-10 flex justify-center items-center rounded-xl bg-slate-100 hover:bg-red-100"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <button
          onClick={saveAttendance}
          className="ml-auto px-6 py-2 rounded-lg bg-red-600 text-white flex justify-end cursor-pointer"
        >
          Save Attendance
        </button>
      </div>
    </div>
  );
}
