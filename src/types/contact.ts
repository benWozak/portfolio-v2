export interface ContactVerificationRequest {
  turnstileToken: string;
}

export interface ContactVerificationResponse {
  success: boolean;
  error?: string;
}

export interface TurnstileVerifyResponse {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
}
