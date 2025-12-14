import { TurnstileVerifyResponse } from "@/types/contact";

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
    return false;
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);

    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const data: TurnstileVerifyResponse = await response.json();

    if (!data.success) {
      console.error("Turnstile verification failed:", data["error-codes"]);
    }

    return data.success;
  } catch (error) {
    console.error("Error verifying Turnstile token:", error);
    return false;
  }
}
