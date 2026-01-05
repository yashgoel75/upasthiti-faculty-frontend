"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { Search, Bell, Camera, Clock } from "lucide-react";
import Footer from "@/app/components/footer/page";
import { useAuth } from "../..//context/auth";
import { useTheme } from "@/app/context/theme";
import { useRouter } from "next/navigation";

interface PrivacySettings {
  privacy: {
    showEmail: boolean;
    showPhone: boolean;
  };
}

export default function Dashboard() {
  const router = useRouter();
  const { theme } = useTheme();
  const { user, setFacultyData, facultyData } = useAuth();
  const [loading, setLoading] = useState<boolean | null>(true);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [totalWeeklyHours, setTotalWeeklyHours] = useState(0);
  const [totalSubjects, setTotalSubjects] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] = useState<PrivacySettings>({
    privacy: {
      showEmail: true,
      showPhone: false,
    },
  });

  const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  // const today = dayNames[new Date().getDay()];
  const today = "tuesday";

  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) setSettings(JSON.parse(saved));
  }, []);

  useEffect(() => {
    if (!facultyData?.facultyId) return;

    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `https://upasthiti-backend-production.up.railway.app/api/faculty/schedule?facultyId=${facultyData.facultyId}`
        );
        setSchedule(res.data.schedule || []);
        setTotalWeeklyHours(res.data.count || 0);
        setTotalSubjects(res.data.timetableMeta.uniqueSubjects);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [facultyData?.facultyId]);

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

      await axios.patch(
        "https://upasthiti-backend-production.up.railway.app/api/admin/update",
        {
          uid: user.uid,
          updates: { profilePicture: data.secure_url },
        }
      );

      setFacultyData((prev: any) =>
        prev ? { ...prev, profilePicture: data.secure_url } : prev
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const todaysSchedule = schedule
    .filter((item: any) => item.day === today)
    .sort((a: any, b: any) => a.period - b.period);

  return (
    <div className="w-full min-h-screen bg-[#fafafa] p-6">
      {/* Profile Section */}
      <section className="rounded-2xl bg-white border border-gray-300 p-6 mb-6 shadow-sm">
        {!facultyData ? (
          <div className="flex items-center gap-6 animate-pulse">
            <div className="w-28 h-28 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-gray-200 rounded w-64" />
              <div className="h-4 bg-gray-200 rounded w-96" />
              <div className="flex gap-4 mt-3">
                <div className="h-4 bg-gray-200 rounded w-40" />
                <div className="h-4 bg-gray-200 rounded w-48" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>
          </div>
        ) : (
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
                className="absolute bottom-0 right-0 bg-red-500 cursor-pointer text-white p-2 rounded-full border"
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
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                  <b>Faculty ID:</b> {facultyData?.facultyId || "UD1230R9234FU23"}
                </p>
                <p>
                  <b>Email:</b>{" "}
                  {settings.privacy.showEmail
                    ? facultyData?.officialEmail || "sonakshivj@vipstc.edu.in"
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
        )}
      </section>

      {/* Stats Cards */}
      <section>
        <div className="flex gap-4 mb-5 justify-between">
          <div className="min-w-[140px] w-full rounded-xl border border-gray-300 p-4 text-center bg-[#fff]">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{todaysSchedule.length}</p>
                <p className="text-sm text-gray-600 mt-1">Today's Classes</p>
              </>
            )}
          </div>

          <div className="min-w-[140px] w-full rounded-xl border border-gray-300 p-4 text-center bg-[#fff]">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-28 mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{totalWeeklyHours}</p>
                <p className="text-sm text-gray-600 mt-1">Total Weekly Hours</p>
              </>
            )}
          </div>

          <div className="min-w-[140px] w-full rounded-xl border border-gray-300 p-4 text-center bg-[#fff]">
            {loading ? (
              <div className="animate-pulse space-y-2">
                <div className="h-8 bg-gray-200 rounded w-12 mx-auto" />
                <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold">{totalSubjects}</p>
                <p className="text-sm text-gray-600 mt-1">Total Subjects</p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 bg-white border border-gray-300 rounded-2xl p-4 shadow-sm">
          <h3 className="text-xl font-bold px-4 py-2">Today's Schedule</h3>
          <h4 className="text-base font-bold px-4 capitalize">{today}</h4>
          
          <div className="space-y-3 px-2 py-2">
            {loading ? (
              // Skeleton loading for schedule
              <>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border border-gray-300 rounded-lg p-3 bg-[#fff] animate-pulse"
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 rounded-full bg-gray-200" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-48" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                        <div className="h-3 bg-gray-200 rounded w-64" />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-gray-200 rounded w-20" />
                      <div className="h-8 bg-gray-200 rounded w-32" />
                    </div>
                  </div>
                ))}
              </>
            ) : todaysSchedule.length > 0 ? (
              todaysSchedule.map((item: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border border-gray-300 rounded-lg p-3 bg-[#fff]"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500">
                      <Clock className="w-4 h-4" />
                    </div>

                    <div>
                      <p className="font-semibold">{item.subjectName}</p>

                      <p className="text-sm text-gray-500">
                        {item.subjectCode} • Room {item.room}
                      </p>

                      <div className="mt-1 text-sm text-gray-400 flex flex-wrap gap-x-2">
                        <span>
                          {item.branch}-{item.section}
                        </span>
                        <span>•</span>
                        <span>Sem {item.semester}</span>
                        <span>•</span>
                        <span className="capitalize">{item.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 whitespace-nowrap">
                      {item.time}
                    </div>

                    <button
                      onClick={() => {
                        router.push(
                          `/faculty/dashboard/takeAttendance?branch=${
                            item.branch
                          }&section=${item.section}&subjectCode=${
                            item.subjectCode
                          }&semester=${item.semester}${
                            item.type == "lab"
                              ? `&groupnumber=${item.groupNumber}`
                              : ""
                          }&period=${item.period}&subjectName=${
                            item.subjectName
                          }&facultyId=${facultyData.facultyId}`
                        );
                      }}
                      className="bg-green-200 font-medium text-green-800 px-3 py-1 rounded-md text-sm cursor-pointer"
                    >
                      Take Attendance
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No classes scheduled for today
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Footer />
      </div>
    </div>
  );
}