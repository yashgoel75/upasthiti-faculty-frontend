"use client";
import Image from "next/image";
import campus from "../../../public/assets/campus.jpg";
import vipsLogo from "../../../public/assets/vips-logo.jpeg";
import logo from "../../../public/assets/upasthiti-logo.png";
import vipsLogoMobile from "../../../public/assets/vipsLogoMobile.jpeg";

import "../../page.css";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  onAuthStateChanged,
  User,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { auth } from "../../../lib/firebase";

interface FormData {
  email: string;
  password: string;
}

export default function Login() {
  const router = useRouter();
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const [resetMessage, setResetMessage] = useState<string>("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        router.replace("/faculty/dashboard");
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 630);

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      router.push("/faculty/dashboard");
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later");
      } else {
        setError("Failed to login. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignInWithGoogle = async () => {
    setLoading(true);
    setError("");

    const provider = new GoogleAuthProvider();

    try {
      await signInWithPopup(auth, provider);
      router.push("/faculty/dashboard");
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in popup closed before completing sign-in.");
      } else {
        setError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResetMessage("");
    setError("");

    if (!resetEmail) {
      setError("Please enter your email address");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetEmail("");
        setResetMessage("");
      }, 3000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email");
      } else {
        setError("Failed to send reset email. Please try again");
      }
    }
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row min-h-screen inter-normal">
        <div className="hidden lg:block relative lg:w-[60%] shadow-lg ml-5 my-5 rounded-xl clip-trapezium overflow-hidden">
          <Image
            src={campus}
            alt="Campus"
            fill
            className="object-cover object-center shadow-xl"
            priority
          />
        </div>

        <div className="w-full lg:w-[40%] px-5 py-8 lg:mr-5 lg:my-5 lg:rounded-e-xl flex flex-col items-center justify-center inter-normal">
          <div className="flex justify-center items-center gap-4 sm:gap-0">
            <Image
              src={logo}
              width={150}
              height={150}
              alt="logo"
              className="sm:w-[200px]"
            />
            <div className="block h-15 w-[1px] bg-gray-400 mx-2 md:mx-5"></div>
            <Image
              src={isMobile ? vipsLogoMobile : vipsLogo}
              width={isMobile ? 100 : 200}
              alt="logo"
              className="pt-2 sm:pt-3"
            />
          </div>

          <div className="my-5 lg:my-7 font-bold text-2xl sm:text-3xl text-center">
            Sign In
          </div>

          <div className="text-base sm:text-lg text-center px-4">
            Welcome to <b>Upasthiti</b>, the official AMS system of VIPS
          </div>

          {!showForgotPassword ? (
            <div className="w-full max-w-md px-4">
              <form
                onSubmit={handleLogin}
                className="flex flex-col mt-6 sm:mt-8 w-full space-y-4 sm:space-y-5"
              >
                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
                    placeholder="username@vips.edu"
                    disabled={loading}
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
                    placeholder="••••••••••••"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-right text-red-500 hover:text-red-700 underline transition-colors duration-200 cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-3 bg-red-500 text-white font-semibold hover:bg-red-600 disabled:bg-red-300 disabled:cursor-not-allowed cursor-pointer rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>

              <div className="flex w-full justify-center items-center my-4">
                <div className="border-b border-gray-300 w-full mx-3"></div>
                <span className="text-gray-500 text-sm whitespace-nowrap">
                  or
                </span>
                <div className="border-b border-gray-300 w-full mx-3"></div>
              </div>

              <div
                onClick={handleSignInWithGoogle}
                className="flex justify-center items-center gap-3 sm:gap-4 border border-gray-200 py-2 sm:py-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="24"
                  height="24"
                  viewBox="0 0 48 48"
                  className="sm:w-[30px] sm:h-[30px]"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
                <span className="text-sm sm:text-base">
                  Continue with Google
                </span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleForgotPassword}
              className="flex flex-col mt-6 sm:mt-8 w-full max-w-md px-4 space-y-4 sm:space-y-5"
            >
              <div className="text-center mb-2">
                <h3 className="text-xl font-semibold">Reset Password</h3>
                <p className="text-sm text-gray-600 mt-2">
                  Enter your email to receive a password reset link
                </p>
              </div>

              <div className="flex flex-col space-y-2">
                <label
                  htmlFor="resetEmail"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="resetEmail"
                  value={resetEmail}
                  onChange={(e) => {
                    setResetEmail(e.target.value);
                    setError("");
                  }}
                  className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-200"
                  placeholder="username@vips.edu"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {resetMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                  {resetMessage}
                </div>
              )}

              <button
                type="submit"
                className="px-4 py-3 bg-red-500 text-white font-semibold hover:bg-red-600 cursor-pointer rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Send Reset Link
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                  setError("");
                  setResetMessage("");
                }}
                className="text-sm text-gray-600 hover:text-gray-800 underline transition-colors duration-200 cursor-pointer"
              >
                Back to Login
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
