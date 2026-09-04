import "server-only";

/**
 * Email helpers used by OTP + password reset.
 * Logs in development when no provider is configured so the build/routes work.
 * Wire RESEND_API_KEY (or another provider) for real delivery later.
 */

type SendResult = { ok: true } | { ok: false; error: string };

function appName() {
  return process.env.NEXT_PUBLIC_APP_NAME || "Sreshta";
}

export async function sendOtpEmail(
  email: string,
  otp: string,
): Promise<void> {
  const subject = `${appName()} verification code`;
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;

  const result = await deliverEmail({ to: email, subject, text });
  if (!result.ok) {
    throw new Error(result.error);
  }
}

export async function sendPasswordResetEmail(
  email: string,
  resetLink: string,
): Promise<void> {
  const subject = `${appName()} password reset`;
  const text = `Reset your password using this link:\n\n${resetLink}\n\nIf you did not request this, ignore this email.`;

  const result = await deliverEmail({ to: email, subject, text });
  if (!result.ok) {
    throw new Error(result.error);
  }
}

async function deliverEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<SendResult> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const from =
    process.env.EMAIL_FROM?.trim() ||
    "Sreshta <onboarding@resend.dev>";

  // Optional: Resend
  if (resendKey) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to: [input.to],
          subject: input.subject,
          text: input.text,
        }),
      });

      if (!res.ok) {
        const body = await res.text();
        return {
          ok: false,
          error: `Email provider error (${res.status}): ${body}`,
        };
      }

      return { ok: true };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : "Email send failed",
      };
    }
  }

  // Dev / no provider: log so OTP flows still work on Vercel without email setup
  console.info("[email:dev]", {
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  return { ok: true };
}