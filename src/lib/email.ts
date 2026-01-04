export async function sendEmail(to: string, subject: string, body: string) {
  if (process.env.RESEND_API_KEY) {
    // placeholder for real provider
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({ from: "noreply@pulselink.app", to, subject, html: body })
    });
  } else {
    console.info("Email send skipped. Subject:", subject, "Body:", body);
  }
}
