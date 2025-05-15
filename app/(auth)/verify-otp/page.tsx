"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import ApiService from "@/lib/api.service";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initialize refs array
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, 6);
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtpValues = [...otpValues];
    newOtpValues[index] = value;
    setOtpValues(newOtpValues);

    // Auto focus next input
    if (value !== "" && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all fields are filled for auto-submission
    const allFilled = newOtpValues.every((val) => val !== "");
    if (allFilled) {
      verifyOtp(newOtpValues.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace" && !otpValues[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();

    // Only proceed if pasted content is numeric and up to 6 digits
    if (!/^\d{1,6}$/.test(pastedData)) return;

    const newOtpValues = [...otpValues];

    // Fill the OTP boxes with pasted digits
    for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
      newOtpValues[i] = pastedData[i];
    }

    setOtpValues(newOtpValues);

    // Focus the next empty input or the last input if all filled
    const nextEmptyIndex = newOtpValues.findIndex((val) => val === "");
    if (nextEmptyIndex !== -1 && inputRefs.current[nextEmptyIndex]) {
      inputRefs.current[nextEmptyIndex]?.focus();
    } else if (inputRefs.current[5]) {
      inputRefs.current[5]?.focus();
      // If all filled after paste, verify OTP
      verifyOtp(newOtpValues.join(""));
    }
  };

  const verifyOtp = async (otp: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await ApiService.post("/auth/verify-otp", {
        email,
        otp,
      });
      setSuccess("OTP verified successfully.");
      // Redirect to reset password page with email and otp as query params
      router.push(
        `/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
      );
    } catch (err: unknown) {
      let errorMessage = "Invalid or expired OTP";
      if (err instanceof Error) {
        errorMessage = err.message || errorMessage;
      }
      setError(errorMessage);
      // Clear OTP fields on error
      setOtpValues(["", "", "", "", "", ""]);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Verify OTP</h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit OTP sent to {email}
          </p>
        </div>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="otp-input-0">OTP</Label>
            <div className="flex justify-between gap-2" onPaste={handlePaste}>
              {otpValues.map((value, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  id={`otp-input-${index}`}
                  className="w-12 h-12 text-center text-xl font-semibold border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  maxLength={1}
                  value={value}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  disabled={loading}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {success && <p className="text-green-500 text-sm text-center">{success}</p>}
          {loading && (
            <div className="text-center">
              <div className="inline-flex items-center">
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Verifying OTP...
              </div>
            </div>
          )}
        </div>
        <div className="text-center text-sm">
          Didn&apos;t receive the OTP?{" "}
          <Link
            href={`/forgot-password?email=${encodeURIComponent(email)}`}
            className="text-primary hover:underline"
          >
            Resend OTP
          </Link>
        </div>
      </div>
    </div>
  );
}