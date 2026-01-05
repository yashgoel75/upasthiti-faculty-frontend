"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import axios from "axios";

interface AuthContextType {
  user: any;
  setFacultyData: any;
  facultyData: any;
  schoolData: any;
  setSchoolData: any;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<any>(null);
  const [facultyData, setFacultyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schoolData, setSchoolData] = useState<any>(null);

  // Safe JSON parse
  const safeParse = (value: string | null) => {
    try {
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  };

  const fetchUserDetails = async (uid: string) => {
    try {
      const res = await axios.get(
        `https://upasthiti-backend-production.up.railway.app/api/faculty?uid=${uid}`
      );
      const data = res.data;
      console.log(res.data);

      setFacultyData(res.data.data);
      // setSchoolData(data.data.data.school);
      // localStorage.setItem("facultyData", JSON.stringify(data));

      return res.data.data;
    } catch (error) {
      console.error("Error fetching admin:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (!user?.uid) {
        setFacultyData(null);
        setLoading(false);
        return;
      }

      // Try cached admin first
      // const cached = safeParse(localStorage.getItem("facultyData"));

      // if (cached) {
      //   setFacultyData(cached);
      //   setLoading(false);
      //   return;
      // }

      // If cached is invalid or missing, clear storage
      // localStorage.removeItem("facultyData");

      // Fetch from backend
      const data = await fetchUserDetails(user.uid);
      setFacultyData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Sync state to localStorage when facultyData changes
  // useEffect(() => {
  //   if (facultyData) {
  //     localStorage.setItem("facultyData", JSON.stringify(facultyData));
  //   }
  // }, [facultyData]);

  return (
    <AuthContext.Provider value={{ user, setFacultyData, facultyData, schoolData, setSchoolData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;
