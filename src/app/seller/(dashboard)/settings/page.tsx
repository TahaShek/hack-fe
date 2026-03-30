"use client";

import { useState, useEffect } from "react";
import { Save, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import api from "@/services/api";

interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface BankDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
}

interface SellerSettings {
  storeLogoUrl: string;
  storeName: string;
  ownerName: string;
  phone: string;
  storeDescription: string;
  businessAddress: BusinessAddress;
  bankDetails: BankDetails;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const defaultSettings: SellerSettings = {
  storeLogoUrl: "",
  storeName: "",
  ownerName: "",
  phone: "",
  storeDescription: "",
  businessAddress: {
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "",
  },
  bankDetails: {
    bankName: "",
    accountNumber: "",
    routingNumber: "",
  },
};

const mockSettings: SellerSettings = {
  storeLogoUrl: "https://placehold.co/120x120/1A1A1A/e07b39?text=LOGO",
  storeName: "Bauhaus Supply Co.",
  ownerName: "Tobias Reinhardt",
  phone: "+1 (555) 012-3456",
  storeDescription:
    "Curated collection of modern design essentials, inspired by the Bauhaus movement.",
  businessAddress: {
    street: "42 Dessau Strasse",
    city: "Berlin",
    state: "BE",
    zip: "10115",
    country: "Germany",
  },
  bankDetails: {
    bankName: "Deutsche Bank",
    accountNumber: "••••••7890",
    routingNumber: "••••••4321",
  },
};

export default function SellerSettingsPage() {
  const [settings, setSettings] = useState<SellerSettings>(defaultSettings);
  const [passwords, setPasswords] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/seller/settings");
        if (res.data.success && res.data.data) {
          const data = res.data.data;
          setSettings({
            ...defaultSettings,
            ...data,
            businessAddress: { ...defaultSettings.businessAddress, ...data.businessAddress },
            bankDetails: { ...defaultSettings.bankDetails, ...data.bankDetails },
          });
        }
      } catch {
        setSettings(mockSettings);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const clearMessage = () => {
    setTimeout(() => setMessage(null), 4000);
  };

  const clearPasswordMessage = () => {
    setTimeout(() => setPasswordMessage(null), 4000);
  };

  const handleSettingsSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await api.put("/seller/settings", settings);
      if (res.data.success) {
        setMessage({ type: "success", text: "Settings saved successfully." });
      } else {
        setMessage({ type: "error", text: res.data.message || "Failed to save settings." });
      }
    } catch {
      setMessage({ type: "error", text: "Could not reach the server. Changes were not saved." });
    } finally {
      setSaving(false);
      clearMessage();
    }
  };

  const handlePasswordSave = async () => {
    setPasswordMessage(null);

    if (!passwords.currentPassword || !passwords.newPassword || !passwords.confirmPassword) {
      setPasswordMessage({ type: "error", text: "All password fields are required." });
      clearPasswordMessage();
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPasswordMessage({
        type: "error",
        text: "New password must be at least 8 characters.",
      });
      clearPasswordMessage();
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordMessage({ type: "error", text: "New passwords do not match." });
      clearPasswordMessage();
      return;
    }

    setSavingPassword(true);
    try {
      const res = await api.put("/seller/settings/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      if (res.data.success) {
        setPasswordMessage({ type: "success", text: "Password updated successfully." });
        setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setPasswordMessage({
          type: "error",
          text: res.data.message || "Failed to update password.",
        });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Could not update password. Try again later." });
    } finally {
      setSavingPassword(false);
      clearPasswordMessage();
    }
  };

  const updateField = (field: keyof SellerSettings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field: keyof BusinessAddress, value: string) => {
    setSettings((prev) => ({
      ...prev,
      businessAddress: { ...prev.businessAddress, [field]: value },
    }));
  };

  const updateBank = (field: keyof BankDetails, value: string) => {
    setSettings((prev) => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, [field]: value },
    }));
  };

  const updatePassword = (field: keyof PasswordForm, value: string) => {
    setPasswords((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={24} className="animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-10">
      {/* Page Header */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 mb-1">
          Seller Portal
        </p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Profile &amp; Settings
        </h1>
      </div>

      {/* Store Profile Section */}
      <section className="bg-[#1A1A1A] rounded-sm p-6 space-y-6">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-400">
          Store Profile
        </h2>

        {/* Logo Preview */}
        <div className="flex items-center gap-5">
          <div className="h-16 w-16 rounded-sm bg-zinc-800 overflow-hidden flex items-center justify-center">
            {settings.storeLogoUrl ? (
              <img
                src={settings.storeLogoUrl}
                alt="Store logo"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-zinc-600 text-[11px] uppercase tracking-[0.1rem]">Logo</span>
            )}
          </div>
          <div className="flex-1">
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Store Logo URL
            </label>
            <input
              type="text"
              value={settings.storeLogoUrl}
              onChange={(e) => updateField("storeLogoUrl", e.target.value)}
              placeholder="https://example.com/logo.png"
              data-testid="logo-upload"
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={settings.storeName}
              onChange={(e) => updateField("storeName", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Owner Name
            </label>
            <input
              type="text"
              value={settings.ownerName}
              onChange={(e) => updateField("ownerName", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Phone
            </label>
            <input
              type="text"
              value={settings.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
            Store Description
          </label>
          <textarea
            value={settings.storeDescription}
            onChange={(e) => updateField("storeDescription", e.target.value)}
            rows={3}
            className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600 resize-none"
          />
        </div>
      </section>

      {/* Business Address Section */}
      <section className="bg-[#1A1A1A] rounded-sm p-6 space-y-6">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-400">
          Business Address
        </h2>

        <div>
          <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
            Street
          </label>
          <input
            type="text"
            value={settings.businessAddress.street}
            onChange={(e) => updateAddress("street", e.target.value)}
            className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              City
            </label>
            <input
              type="text"
              value={settings.businessAddress.city}
              onChange={(e) => updateAddress("city", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              State
            </label>
            <input
              type="text"
              value={settings.businessAddress.state}
              onChange={(e) => updateAddress("state", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={settings.businessAddress.zip}
              onChange={(e) => updateAddress("zip", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Country
            </label>
            <input
              type="text"
              value={settings.businessAddress.country}
              onChange={(e) => updateAddress("country", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>
      </section>

      {/* Bank / Payout Details Section */}
      <section className="bg-[#1A1A1A] rounded-sm p-6 space-y-6">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-400">
          Bank / Payout Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Bank Name
            </label>
            <input
              type="text"
              value={settings.bankDetails.bankName}
              onChange={(e) => updateBank("bankName", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Account Number
            </label>
            <input
              type="text"
              value={settings.bankDetails.accountNumber}
              onChange={(e) => updateBank("accountNumber", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Routing Number
            </label>
            <input
              type="text"
              value={settings.bankDetails.routingNumber}
              onChange={(e) => updateBank("routingNumber", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>
      </section>

      {/* Save Profile Button + Message */}
      <div className="flex items-center gap-4">
        <button
          onClick={handleSettingsSave}
          disabled={saving}
          data-testid="save-settings"
          className="flex items-center gap-2 bg-gradient-to-r from-[#9a4601] to-[#e07b39] text-white text-[11px] font-medium uppercase tracking-[0.1rem] px-6 py-3 rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Saving..." : "Save Settings"}
        </button>
        {message && (
          <span
            className={`flex items-center gap-1.5 text-sm ${
              message.type === "success" ? "text-emerald-400" : "text-red-400"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={14} />
            ) : (
              <AlertCircle size={14} />
            )}
            {message.text}
          </span>
        )}
      </div>

      {/* Change Password Section */}
      <section className="bg-[#1A1A1A] rounded-sm p-6 space-y-6">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-400">
          Change Password
        </h2>

        <div className="space-y-6 max-w-md">
          <div className="relative">
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwords.currentPassword}
                onChange={(e) => updatePassword("currentPassword", e.target.value)}
                className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 pr-8 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-0 bottom-2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwords.newPassword}
                onChange={(e) => updatePassword("newPassword", e.target.value)}
                className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 pr-8 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-0 bottom-2 text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium uppercase tracking-[0.1rem] text-zinc-500 block mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwords.confirmPassword}
              onChange={(e) => updatePassword("confirmPassword", e.target.value)}
              className="w-full bg-transparent border-b border-zinc-700 text-sm text-zinc-200 pb-2 focus:outline-none focus:border-[#e07b39] transition-colors placeholder:text-zinc-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={handlePasswordSave}
            disabled={savingPassword}
            data-testid="change-password"
            className="flex items-center gap-2 bg-zinc-800 text-zinc-200 text-[11px] font-medium uppercase tracking-[0.1rem] px-6 py-3 rounded-sm hover:bg-zinc-700 transition-colors disabled:opacity-50 border border-zinc-700/40"
          >
            {savingPassword ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
          {passwordMessage && (
            <span
              className={`flex items-center gap-1.5 text-sm ${
                passwordMessage.type === "success" ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {passwordMessage.type === "success" ? (
                <CheckCircle2 size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              {passwordMessage.text}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
