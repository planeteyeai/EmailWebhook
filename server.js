const express = require("express");
const sgMail = require("@sendgrid/mail");

const app = express();

// Read SendGrid API Key from ENV
sgMail.setApiKey(process.env.SENDGRID_KEY);

// Middleware
app.use(express.json());

// Health check endpoint
app.get("/", (req, res) => {
  res.send("✅ Alert Mailer is running!");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "alert-mailer" });
});

// Helper function to send alert email
async function sendAlertEmail(alert, recipients) {
  const severity = alert.labels.severity || "warning";
  const subject = `🚨 Alert: ${alert.labels.alertname || "Unknown"} [${severity.toUpperCase()}]`;

  const message = `
ALERT: ${alert.labels.alertname}

Severity: ${severity.toUpperCase()}
Status: ${alert.status}
Instance: ${alert.labels.instance || "N/A"}
Summary: ${alert.annotations.summary || "No summary"}
Description: ${alert.annotations.description || "No description"}
  `;

  await sgMail.send({
    to: recipients,
    from: "planeteyefarm@gmail.com",
    subject: subject,
    text: message,
  });
}

// GET handler for browser testing
app.get("/alert", (req, res) => {
  res.send("✅ Alert endpoint is ready. Use POST to send alerts.");
});

app.get("/alert/critical", (req, res) => {
  res.send("✅ Critical alert endpoint is ready. Use POST to send alerts.");
});

// Default alerts endpoint - only Aniket
app.post("/alert", async (req, res) => {
  try {
    const alerts = req.body.alerts;

    if (!alerts || alerts.length === 0) {
      return res.status(400).send("No alerts received");
    }

    const alert = alerts[0];
    const recipients = ["Aniket.Shinde@planeteyefarm.ai"];

    await sendAlertEmail(alert, recipients);

    console.log(`✅ Default alert sent to ${recipients.length} recipient(s)`);
    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    res.status(500).send("Email failed");
  }
});

// Critical alerts endpoint - all recipients
app.post("/alert/critical", async (req, res) => {
  try {
    const alerts = req.body.alerts;

    if (!alerts || alerts.length === 0) {
      return res.status(400).send("No alerts received");
    }

    const alert = alerts[0];
    const recipients = [
      "Aniket.Shinde@planeteyefarm.ai",
      "tushar.patil@mitconindia.com",
      "ram.thakur@planeteyeinfra.ai",
      "sahil.sonawane@planeteyefarm.ai",
      "snigdha.take@planeteyefarm.ai",
      "Kalyani.Pawar@planeteyefarm.ai",
    ];

    await sendAlertEmail(alert, recipients);

    console.log(`✅ Critical alert sent to ${recipients.length} recipient(s)`);
    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    res.status(500).send("Email failed");
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mailer running on port ${PORT}`);
});
