"use client";

import { useState } from "react";
import axios from "axios";

export default function Notify() {
  const [loading, setLoading] = useState(false);

  const sendEmail = async () => {
    setLoading(true);
    await axios.post("/api/sendLowAttendanceEmail");
    setLoading(false);
  };

  return (
    <>
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-3">Notify Parents</h1>
          <h3>Send an alert email to the parents of students having low attendance!</h3>
        </div>

        <div className="my-5">
          <button
            onClick={sendEmail}
            className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 cursor-pointer text-white"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Email"}
          </button>
        </div>
      </div>
    </>
  );
}
