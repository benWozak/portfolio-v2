import { NextRequest, NextResponse } from "next/server";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { ContactVerificationRequest } from "@/types/contact";

export async function POST(req: NextRequest) {
  try {
    const body: ContactVerificationRequest = await req.json();
    const { turnstileToken } = body;

    if (!turnstileToken) {
      return NextResponse.json(
        { success: false, error: "Missing Turnstile token" },
        { status: 400 }
      );
    }

    const turnstileValid = await verifyTurnstileToken(turnstileToken);
    if (!turnstileValid) {
      console.log("Turnstile verification failed");
      return NextResponse.json(
        { success: false, error: "CAPTCHA verification failed" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in contact verification:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST to verify contact form." },
    { status: 405 }
  );
}
