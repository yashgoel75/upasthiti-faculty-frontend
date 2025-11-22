"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  Lock,
  Palette,
  Globe,
  Shield,
  Mail,
  Volume2,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import { useTheme } from "@/app/context/theme";

interface AppearanceSettings {
  theme: "light" | "dark";
}

interface PrivacySettings {
  showEmail: boolean;
  showPhone: boolean;
  dataSharing: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  sessionTimeout: string;
  loginAlerts: boolean;
}

interface AuthSettings {
  authMethod: "google" | "email";
  googleEmail?: string;
}

interface AppSettings {
  appearance: AppearanceSettings;
  privacy: PrivacySettings;
  security: SecuritySettings;
  auth: AuthSettings;
}

const defaultSettings: AppSettings = {
  appearance: { theme: "light" },
  privacy: {
    showEmail: true,
    showPhone: false,
    dataSharing: false,
  },
  security: {
    twoFactorAuth: false,
    sessionTimeout: "30",
    loginAlerts: true,
  },
  auth: {
    authMethod: "google",
    googleEmail: "user@gmail.com",
  },
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [signInMethod, setSignInMethod] = useState<string>("google.com");
  const [userEmail, setUserEmail] = useState<string>("user@example.com");

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [modalType, setModalType] = useState<"linkGoogle" | "unlinkGoogle" | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Load on client only (fix hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem("appSettings");
    if (saved) {
      setSettings(JSON.parse(saved));
    } else {
      setSettings(defaultSettings);
    }
  }, []);

  if (!settings) return null; // prevents hydration issues

  const isDark = settings.appearance.theme === "dark";

  const handleToggle = (category: keyof AppSettings, key: string) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: !prev[category][key as keyof typeof prev[typeof category]],
        },
      };
      localStorage.setItem("appSettings", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSelect = (category: keyof AppSettings, key: string, value: any) => {
    setSettings((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        [category]: {
          ...prev[category],
          [key]: value,
        },
      };
      localStorage.setItem("appSettings", JSON.stringify(updated));
      return updated;
    });
  };

  const saveSettings = () => {
    setIsSaving(true);
    localStorage.setItem("appSettings", JSON.stringify(settings));

    setTimeout(() => {
      setIsSaving(false);
      setSaveMessage(true);
      setTimeout(() => setSaveMessage(false), 1500);
    }, 800);
  };

  const handleUnlinkGoogle = () => {
    setModalType("unlinkGoogle");
    setShowAuthModal(true);
  };

  const handleLinkGoogle = () => {
    setModalType("linkGoogle");
    setShowAuthModal(true);
  };

  const confirmUnlinkGoogle = () => {
    if (!newPassword || !confirmPassword) return alert("Please fill both fields.");
    if (newPassword !== confirmPassword) return alert("Passwords don't match.");
    if (newPassword.length < 6) return alert("Password must be at least 6 characters.");

    setSignInMethod("password");
    setShowAuthModal(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const confirmLinkGoogle = () => {
    setSignInMethod("google.com");
    setShowAuthModal(false);
  };

  const closeModal = () => {
    setShowAuthModal(false);
    setModalType(null);
    setNewPassword("");
    setConfirmPassword("");
  };

  const themes = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
  ] as const;

  return (
    <div
      className={`min-h-screen p-2 md:p-8 transition-colors ${
        isDark ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="mb-8">
          <h1
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Settings
          </h1>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Manage your application preferences and configurations
          </p>
        </div>

        {/* APPEARANCE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div
            className={`border-2 rounded-3xl shadow-sm p-6 ${
              isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  isDark ? "bg-purple-900" : "bg-purple-100"
                }`}
              >
                <Palette
                  className={isDark ? "text-purple-400" : "text-purple-600"}
                />
              </div>
              <div>
                <h2 className={isDark ? "text-white" : "text-gray-900"}>
                  Appearance
                </h2>
                <p className={isDark ? "text-gray-400" : "text-gray-600"}>
                  Customize your interface
                </p>
              </div>
            </div>

            <label
              className={isDark ? "text-gray-300" : "text-gray-700"}
            >
              Theme
            </label>

            <div className="grid grid-cols-2 gap-3 mt-3">
              {themes.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    handleSelect("appearance", "theme", opt.value);
                    setTheme(opt.value);
                  }}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                    settings.appearance.theme === opt.value
                      ? isDark
                        ? "border-red-500 bg-red-950"
                        : "border-red-500 bg-red-50"
                      : isDark
                      ? "border-gray-700 hover:border-gray-600 bg-gray-750"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <opt.icon
                    className={isDark ? "text-gray-300" : "text-gray-700"}
                  />
                  <span className={isDark ? "text-gray-200" : "text-gray-900"}>
                    {opt.label}
                  </span>
                  {settings.appearance.theme === opt.value && (
                    <Check className="w-4 h-4 text-red-600 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* PRIVACY */}
          <SectionCard
            title="Privacy"
            icon={Shield}
            isDark={isDark}
          >
            <ToggleItem
              label="Show Email"
              description="Display email on profile"
              checked={settings.privacy.showEmail}
              onChange={() => handleToggle("privacy", "showEmail")}
              isDark={isDark}
            />
            <ToggleItem
              label="Show Phone"
              description="Display phone on profile"
              checked={settings.privacy.showPhone}
              onChange={() => handleToggle("privacy", "showPhone")}
              isDark={isDark}
            />
          </SectionCard>

          {/* SECURITY */}
          <SectionCard
            title="Security"
            icon={Lock}
            isDark={isDark}
          >
            <ToggleItem
              label="Two-Factor Authentication"
              description="Add extra layer of security"
              checked={settings.security.twoFactorAuth}
              onChange={() => handleToggle("security", "twoFactorAuth")}
              isDark={isDark}
            />
            <ToggleItem
              label="Login Alerts"
              description="Notify on new device login"
              checked={settings.security.loginAlerts}
              onChange={() => handleToggle("security", "loginAlerts")}
              isDark={isDark}
            />
          </SectionCard>

          {/* AUTH */}
          <SectionCard
            title="Authentication"
            icon={Mail}
            isDark={isDark}
          >
            <AuthBlock
              isDark={isDark}
              signInMethod={signInMethod}
              userEmail={userEmail}
              handleUnlinkGoogle={handleUnlinkGoogle}
              handleLinkGoogle={handleLinkGoogle}
            />
          </SectionCard>
        </div>

        {/* MODAL */}
        {showAuthModal && (
          <AuthModal
            isDark={isDark}
            modalType={modalType}
            newPassword={newPassword}
            confirmPassword={confirmPassword}
            setNewPassword={setNewPassword}
            setConfirmPassword={setConfirmPassword}
            closeModal={closeModal}
            confirmUnlinkGoogle={confirmUnlinkGoogle}
            confirmLinkGoogle={confirmLinkGoogle}
          />
        )}

        {/* SAVE SETTINGS */}
        <SaveBar
          isDark={isDark}
          isSaving={isSaving}
          saveMessage={saveMessage}
          saveSettings={saveSettings}
        />
      </div>
    </div>
  );
}

function SectionCard({ children, title, icon: Icon, isDark }: any) {
  return (
    <div
      className={`border-2 rounded-3xl shadow-sm p-6 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            isDark ? "bg-blue-900" : "bg-blue-100"
          }`}
        >
          <Icon className={isDark ? "text-blue-400" : "text-blue-600"} />
        </div>
        <div>
          <h2 className={isDark ? "text-white" : "text-gray-900"}>{title}</h2>
          <p className={isDark ? "text-gray-400" : "text-gray-600"}>
            Configure settings
          </p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ToggleItem({ label, description, checked, onChange, isDark }: any) {
  return (
    <div
      className={`flex items-center justify-between p-4 border-2 rounded-xl ${
        isDark
          ? "bg-gray-750 border-gray-700 hover:bg-gray-700"
          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
      }`}
    >
      <div>
        <p className={isDark ? "text-white" : "text-gray-900"}>{label}</p>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          {description}
        </p>
      </div>

      <button
        onClick={onChange}
        className={`relative w-14 h-8 rounded-full ${
          checked ? "bg-red-500" : isDark ? "bg-gray-600" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
            checked ? "translate-x-6" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

function AuthBlock({
  isDark,
  signInMethod,
  userEmail,
  handleUnlinkGoogle,
  handleLinkGoogle,
}: any) {
  return (
    <div
      className={`p-4 border-2 rounded-xl ${
        isDark ? "bg-gray-750 border-gray-700" : "bg-gray-50 border-gray-200"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <p className={isDark ? "text-white" : "text-gray-900"}>Current Method</p>

        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${
            signInMethod === "google.com"
              ? isDark
                ? "bg-blue-900 text-blue-300"
                : "bg-blue-100 text-blue-700"
              : isDark
              ? "bg-green-900 text-green-300"
              : "bg-green-100 text-green-700"
          }`}
        >
          {signInMethod === "google.com" ? "Google" : "Email/Password"}
        </span>
      </div>

      {signInMethod === "google.com" && (
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Linked account: {userEmail}
        </p>
      )}

      <button
        onClick={
          signInMethod === "google.com"
            ? handleUnlinkGoogle
            : handleLinkGoogle
        }
        className="w-full mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        {signInMethod === "google.com"
          ? "Switch to Email/Password"
          : "Link Google Account"}
      </button>
    </div>
  );
}

function AuthModal({
  isDark,
  modalType,
  newPassword,
  confirmPassword,
  setNewPassword,
  setConfirmPassword,
  closeModal,
  confirmUnlinkGoogle,
  confirmLinkGoogle,
}: any) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`rounded-2xl max-w-md w-full p-6 ${
          isDark ? "bg-gray-800" : "bg-white"
        }`}
      >
        <h3 className={isDark ? "text-white" : "text-gray-900"}>
          {modalType === "unlinkGoogle"
            ? "Switch to Email/Password"
            : "Link Google Account"}
        </h3>

        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          {modalType === "unlinkGoogle"
            ? "Create a password to switch from Google authentication."
            : "You'll be redirected to Google to link your account."}
        </p>

        {modalType === "unlinkGoogle" && (
          <div className="space-y-4 mt-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New password"
              className={`w-full p-3 rounded-xl border ${
                isDark ? "bg-gray-750 text-white" : "bg-white text-gray-900"
              }`}
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              className={`w-full p-3 rounded-xl border ${
                isDark ? "bg-gray-750 text-white" : "bg-white text-gray-900"
              }`}
            />
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={closeModal}
            className={`flex-1 p-3 rounded-xl border ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            Cancel
          </button>
          <button
            onClick={
              modalType === "unlinkGoogle"
                ? confirmUnlinkGoogle
                : confirmLinkGoogle
            }
            className="flex-1 p-3 bg-red-500 text-white rounded-xl"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function SaveBar({ isDark, isSaving, saveMessage, saveSettings }: any) {
  return (
    <div
      className={`border-2 rounded-3xl shadow-sm p-6 flex items-center justify-between mt-6 ${
        isDark ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div>
        <h3 className={isDark ? "text-white" : "text-gray-900"}>
          Save Changes
        </h3>
        <p className={isDark ? "text-gray-400" : "text-gray-600"}>
          Apply your settings configuration
        </p>
      </div>

      <button
        onClick={saveSettings}
        disabled={isSaving || saveMessage}
        className="px-8 py-3 bg-red-500 text-white font-semibold rounded-xl disabled:opacity-50"
      >
        {isSaving ? "Saving..." : saveMessage ? "Saved" : "Save Settings"}
      </button>
    </div>
  );
}
