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

// Endpoint for Alertmanager
app.post("/alert", async (req, res) => {
  try {
    const alerts = req.body.alerts;

    if (!alerts || alerts.length === 0) {
      return res.status(400).send("No alerts received");
    }

    const alert = alerts[0];

    const subject = `🚨 Alert: ${alert.labels.alertname || "Unknown"}`;

    const message = `
ALERT: ${alert.labels.alertname}

Status: ${alert.status}
Instance: ${alert.labels.instance || "N/A"}
Summary: ${alert.annotations.summary || "No summary"}
Description: ${alert.annotations.description || "No description"}
    `;

    await sgMail.send({
      to: [
        "Aniket.Shinde@planeteyefarm.ai",
        "tushar.patil@mitconindia.com",
        "ram.thakur@planeteyeinfra.ai",
        "sahil.sonawane@planeteyefarm.ai",
        "snigdha.take@planeteyefarm.ai",
        "Kalyani.Pawar@planeteyefarm.ai",
      ],
      from: "planeteyefarm@gmail.com", // must be verified in SendGrid
      subject: subject,
      text: message,
    });

    console.log("✅ Email sent successfully");

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
