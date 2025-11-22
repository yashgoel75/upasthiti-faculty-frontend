"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { Search, Bell, Camera } from "lucide-react";
import Footer from "@/app/components/footer/page";
import { useAuth } from "../..//context/auth";
import { useTheme } from "@/app/context/theme";

interface Faculty {
  facultyId: string;
  name: string;
  profilePicture?: string;
  email: string;
  phone: number;
  uid: string;
  schoolId: string;
  school?: { name: string };
  timetable?: any[]; // optional, from your Faculty schema
}

interface FacultyCounts {
  professor: number;
  professorOfPractice: number;
  associateProfessor: number;
  assistantProfessor: number;
}

interface BranchCounts {
  [key: string]: number;
}

interface CountsData {
  studentCount: number;
  facultyCounts: FacultyCounts;
  branchCounts: BranchCounts;
}

interface PrivacySettings {
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

export default function Dashboard() {
  const { theme } = useTheme();
  const { user, setFacultyData, facultyData, loading } = useAuth();
  const [counts, setCounts] = useState<CountsData>({
    studentCount: 0,
    facultyCounts: {
      professor: 0,
      professorOfPractice: 0,
      associateProfessor: 0,
      assistantProfessor: 0,
    },
    branchCounts: {},
  });
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const CACHE_INTERVAL = 50000;

  const [settings, setSettings] = useState<PrivacySettings>({
    privacy: {
      showEmail: true,
      showPhone: false,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setSettings(parsed);
    }
  }, []);

  const getCount = async () => {
    try {
      const res = await axios.get(
        "https://upasthiti-backend-production.up.railway.app/api/count"
      );
      const data = res.data;

      const branchCounts: BranchCounts = {};
      if (data.students?.byBranch) {
        Object.keys(data.students.byBranch).forEach((branch) => {
          branchCounts[branch] = data.students.byBranch[branch].count || 0;
        });
      }

      setCounts({
        studentCount: data.students?.total || 0,
        facultyCounts: {
          professor: data.faculty?.byType?.Professor?.count || 0,
          professorOfPractice:
            data.faculty?.byType?.ProfessorOfPractice?.count || 0,
          associateProfessor:
            data.faculty?.byType?.AssociateProfessor?.count || 0,
          assistantProfessor:
            data.faculty?.byType?.AssistantProfessor?.count || 0,
        },
        branchCounts,
      });
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  useEffect(() => {
    getCount();
    // optional refresh interval (not enabled by default)
    // const t = setInterval(getCount, CACHE_INTERVAL);
    // return () => clearInterval(t);
  }, []);

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good Morning,";
    if (hours < 18) return "Good Afternoon,";
    return "Good Evening,";
  };

  const handleProfilePictureChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setIsUploadingImage(true);
    try {
      const signRes = await fetch("/api/signprofilepicture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "profilepictures" }),
      });

      const { timestamp, signature, apiKey, folder } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await uploadRes.json();
      const imageUrl = data.secure_url;

      await axios.patch(
        "https://upasthiti-backend-production.up.railway.app/api/admin/update",
        {
          uid: user.uid,
          updates: { profilePicture: imageUrl },
        }
      );

      setFacultyData((prev: Faculty) =>
        prev ? { ...prev, profilePicture: imageUrl } : prev
      );
    } catch (err) {
      console.error(err);
      alert("Failed to upload profile picture.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // derive stats similar to screenshot
  const todaysClassesCount = (() => {
    // try to derive from facultyData.timetable or fallback to sample
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
    const tts = facultyData?.timetable || [];
    if (!tts || tts.length === 0) return 0;
    // timetable array assumed: [{ day: "Monday", schedule: [{ time, subjectCode, teacherID, classRoomID, subjectName }] }]
    const todayRow = tts.find(
      (d: any) => (d.day || "").toLowerCase() === today.toLowerCase()
    );
    if (!todayRow) return 0;
    return Array.isArray(todayRow.schedule) ? todayRow.schedule.length : 0;
  })();

  // sample weekly hours and total subjects fallback:
  const totalWeeklyHours = 8.15;
  const totalSubjects = facultyData?.subjects?.length || 10;

  // Build today's schedule items (best-effort)
  const todaysSchedule = (() => {
    const weekdays = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });
    const tts = facultyData?.timetable || [];

    // find by day name, otherwise take first day's schedule as fallback
    let dayObj =
      tts?.find(
        (d: any) => d.day && d.day.toLowerCase() === weekdays.toLowerCase()
      ) || tts?.[0];

    if (
      !dayObj ||
      !Array.isArray(dayObj.schedule) ||
      dayObj.schedule.length === 0
    ) {
      // fallback sample schedule (matches screenshot structure)
      return [
        {
          subjectName: "Database Management Systems",
          subjectCode: "CS301",
          room: "Room 301",
          time: "09:00 AM - 10:00 AM",
        },
        {
          subjectName: "Database Management Systems",
          subjectCode: "CS301",
          room: "Room 301",
          time: "09:00 AM - 10:00 AM",
        },
        {
          subjectName: "Database Management Systems",
          subjectCode: "CS301",
          room: "Room 301",
          time: "09:00 AM - 10:00 AM",
        },
        {
          subjectName: "Database Management Systems",
          subjectCode: "CS301",
          room: "Room 301",
          time: "09:00 AM - 10:00 AM",
        },
        {
          subjectName: "Database Management Systems",
          subjectCode: "CS301",
          room: "Room 301",
          time: "09:00 AM - 10:00 AM",
        },
      ];
    }

    return dayObj.schedule.map((s: any) => ({
      subjectName: s.subjectName || s.subject || s.subjectCode || "Unknown",
      subjectCode: s.subjectCode || s.subject || s.code || "N/A",
      room: s.classRoomID || s.room || "TBD",
      time: s.time || "TBD",
    }));
  })();

  const timetableButtons = ["CSE-AM", "AIML-A", "AIML-B", "AIDS", "VLSI"];

  return (
    <div className="w-full min-h-screen bg-[#fafafa] p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search your things"
            className="w-full rounded-lg border border-gray-300 px-12 py-3 text-sm shadow-sm focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4 ml-6">
          <button className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white">
            <Bell className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <section className="rounded-2xl bg-white border border-gray-300 p-6 mb-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative w-28 h-28">
              {facultyData?.profilePicture ? (
                <Image
                  src={facultyData.profilePicture}
                  alt="Profile"
                  fill
                  className="object-cover rounded-full border-2 border-gray-300"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-red-400 flex items-center justify-center text-white text-3xl font-bold">
                  {facultyData?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
              )}

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full border"
                title="Change profile"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleProfilePictureChange}
              />
              {isUploadingImage && (
                <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-3xl font-bold">
                {getGreeting()} {facultyData?.name || "Faculty"}
              </h2>
              <p className="text-sm text-gray-600">
                {facultyData?.school?.name ||
                  "School of Engineering and Technology"}
              </p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
                <p>
                  <b>Faculty ID:</b>{" "}
                  {facultyData?.facultyId || "UD1230R9234FU23"}
                </p>
                <p>
                  <b>Email:</b>{" "}
                  {settings.privacy.showEmail
                    ? facultyData?.email || "sonakshivj@vipstc.edu.in"
                    : "•••••"}
                </p>
                <p>
                  <b>Phone:</b>{" "}
                  {settings.privacy.showPhone
                    ? facultyData?.phone || "9876543210"
                    : "•••••"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="flex gap-4 mb-5 justify-between">
          <div className="min-w-[140px] w-full rounded-xl border border-gray-300 p-4 text-center bg-[#fff]">
            <p className="text-2xl font-bold">{todaysSchedule.length}</p>
            <p className="text-sm text-gray-600 mt-1">Today's Classes</p>
          </div>

          <div className="min-w-[140px] w-full rounded-xl border border-gray-300 p-4 text-center bg-[#fff]">
            <p className="text-2xl font-bold">{totalWeeklyHours}</p>
            <p className="text-sm text-gray-600 mt-1">Total Weekly Hours</p>
          </div>

          <div className="min-w-[140px] w-full rounded-xl border border-gray-300 p-4 text-center bg-[#fff]">
            <p className="text-2xl font-bold">{totalSubjects}</p>
            <p className="text-sm text-gray-600 mt-1">Total Subjects</p>
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-300 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xl font-bold px-4 py-2">Today's Schedule</h3>
          <div className="space-y-3 px-2 py-2">
            {todaysSchedule.map((item: any, idx: number) => (
              <div
                key={idx}
                className="flex items-center justify-between border border-gray-300 rounded-lg p-3 bg-[#fff]"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500">
                    ⏱️
                  </div>
                  <div>
                    <p className="font-semibold">{item.subjectName}</p>
                    <p className="text-sm text-gray-500">
                      {item.subjectCode} - {item.room}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">{item.time}</div>
                  <button className="bg-green-200 text-green-800 px-4 py-1 rounded-md text-sm">
                    Take Attendance
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-300 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-center mb-4">Time-Table</h3>
          <div className="flex flex-col gap-3">
            {timetableButtons.map((t) => (
              <button
                key={t}
                className="w-full border border-gray-300 rounded-lg py-3 text-lg font-medium bg-[#f6fff6]"
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}
