import { Resend } from "resend";

import type {
  SupportCase,
  SupportUrgency,
} from "./types";

function getAdminEmails(): string[] {
  return (
    process.env
      .SUPPORT_ADMIN_EMAILS ?? ""
  )
    .split(",")
    .map((email) =>
      email.trim().toLowerCase()
    )
    .filter(Boolean);
}

function escapeHtml(
  value?: string | null
): string {
  return (value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getUrgencyLabel(
  urgency: SupportUrgency
): string {
  switch (urgency) {
    case "critical":
      return "CRITICAL";

    case "high":
      return "HIGH PRIORITY";

    case "low":
      return "LOW PRIORITY";

    default:
      return "NORMAL PRIORITY";
  }
}

function getUrgencyColor(
  urgency: SupportUrgency
): string {
  switch (urgency) {
    case "critical":
      return "#fb7185";

    case "high":
      return "#fb923c";

    case "low":
      return "#94a3b8";

    default:
      return "#22d3ee";
  }
}

function createPlainTextMessage(
  supportCase: SupportCase,
  adminUrl: string
): string {
  return `
A new ASCEND support case has been created.

Reference: ${supportCase.referenceNumber}
Priority: ${getUrgencyLabel(supportCase.urgency)}
Category: ${supportCase.category}
Title: ${supportCase.title}
Contact email: ${supportCase.contactEmail ?? "Signed-in ASCEND user"}
Created: ${supportCase.createdAt}

Reported issue:
${supportCase.initialMessage}

Diagnosis:
${supportCase.diagnosis.summary}

Open the Support Administrator workspace:
${adminUrl}
`.trim();
}

function createHtmlMessage(
  supportCase: SupportCase,
  adminUrl: string
): string {
  const urgencyColor =
    getUrgencyColor(
      supportCase.urgency
    );

  return `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />
    <title>New ASCEND Support Case</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background: #020617;
      color: #e2e8f0;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <div
      style="
        width: 100%;
        padding: 32px 16px;
        box-sizing: border-box;
      "
    >
      <div
        style="
          max-width: 680px;
          margin: 0 auto;
          overflow: hidden;
          border: 1px solid #1e293b;
          border-radius: 24px;
          background: #0b1220;
        "
      >
        <div
          style="
            padding: 28px;
            border-bottom: 1px solid #1e293b;
            background:
              linear-gradient(
                135deg,
                rgba(37, 99, 235, 0.18),
                rgba(34, 211, 238, 0.08)
              );
          "
        >
          <p
            style="
              margin: 0;
              color: #67e8f9;
              font-size: 12px;
              font-weight: 700;
              letter-spacing: 0.2em;
              text-transform: uppercase;
            "
          >
            ASCEND Support
          </p>

          <h1
            style="
              margin: 12px 0 0;
              color: #ffffff;
              font-size: 28px;
              line-height: 1.25;
            "
          >
            New support case received
          </h1>

          <p
            style="
              margin: 12px 0 0;
              color: #94a3b8;
              font-size: 15px;
              line-height: 1.6;
            "
          >
            A user has escalated an issue that requires
            administrator attention.
          </p>
        </div>

        <div style="padding: 28px;">
          <div
            style="
              display: inline-block;
              margin-bottom: 20px;
              padding: 8px 12px;
              border: 1px solid ${urgencyColor}55;
              border-radius: 999px;
              background: ${urgencyColor}18;
              color: ${urgencyColor};
              font-size: 12px;
              font-weight: 700;
            "
          >
            ${escapeHtml(
              getUrgencyLabel(
                supportCase.urgency
              )
            )}
          </div>

          <table
            role="presentation"
            style="
              width: 100%;
              border-collapse: collapse;
              font-size: 14px;
            "
          >
            <tr>
              <td
                style="
                  width: 140px;
                  padding: 10px 0;
                  color: #64748b;
                  vertical-align: top;
                "
              >
                Reference
              </td>

              <td
                style="
                  padding: 10px 0;
                  color: #67e8f9;
                  font-weight: 700;
                "
              >
                ${escapeHtml(
                  supportCase.referenceNumber
                )}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px 0;
                  color: #64748b;
                  vertical-align: top;
                "
              >
                Category
              </td>

              <td
                style="
                  padding: 10px 0;
                  color: #e2e8f0;
                  text-transform: capitalize;
                "
              >
                ${escapeHtml(
                  supportCase.category
                )}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px 0;
                  color: #64748b;
                  vertical-align: top;
                "
              >
                Contact
              </td>

              <td
                style="
                  padding: 10px 0;
                  color: #e2e8f0;
                "
              >
                ${escapeHtml(
                  supportCase.contactEmail ??
                    "Signed-in ASCEND user"
                )}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 10px 0;
                  color: #64748b;
                  vertical-align: top;
                "
              >
                Title
              </td>

              <td
                style="
                  padding: 10px 0;
                  color: #ffffff;
                  font-weight: 600;
                "
              >
                ${escapeHtml(
                  supportCase.title
                )}
              </td>
            </tr>
          </table>

          <div
            style="
              margin-top: 24px;
              padding: 20px;
              border: 1px solid #1e293b;
              border-radius: 16px;
              background: #020617;
            "
          >
            <p
              style="
                margin: 0;
                color: #67e8f9;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.18em;
                text-transform: uppercase;
              "
            >
              Reported issue
            </p>

            <p
              style="
                margin: 12px 0 0;
                color: #cbd5e1;
                font-size: 14px;
                line-height: 1.7;
                white-space: pre-wrap;
              "
            >
              ${escapeHtml(
                supportCase.initialMessage
              )}
            </p>
          </div>

          <div
            style="
              margin-top: 16px;
              padding: 20px;
              border: 1px solid #1e293b;
              border-radius: 16px;
              background: #020617;
            "
          >
            <p
              style="
                margin: 0;
                color: #67e8f9;
                font-size: 11px;
                font-weight: 700;
                letter-spacing: 0.18em;
                text-transform: uppercase;
              "
            >
              Support AI diagnosis
            </p>

            <p
              style="
                margin: 12px 0 0;
                color: #cbd5e1;
                font-size: 14px;
                line-height: 1.7;
              "
            >
              ${escapeHtml(
                supportCase.diagnosis
                  .summary
              )}
            </p>
          </div>

          <div
            style="
              margin-top: 28px;
              text-align: center;
            "
          >
            <a
              href="${escapeHtml(adminUrl)}"
              style="
                display: inline-block;
                padding: 14px 24px;
                border-radius: 12px;
                background: #2563eb;
                color: #ffffff;
                font-size: 14px;
                font-weight: 700;
                text-decoration: none;
              "
            >
              Open Support Administrator
            </a>
          </div>
        </div>

        <div
          style="
            padding: 20px 28px;
            border-top: 1px solid #1e293b;
            color: #64748b;
            font-size: 12px;
            line-height: 1.6;
            text-align: center;
          "
        >
          This notification was generated automatically by
          ASCEND Support.
        </div>
      </div>
    </div>
  </body>
</html>
`.trim();
}

export async function notifySupportAdminsOfNewCase(
  supportCase: SupportCase
): Promise<void> {
  const apiKey =
    process.env.RESEND_API_KEY;

  const adminEmails =
    getAdminEmails();

  if (!apiKey) {
    console.warn(
      "Support notification skipped: RESEND_API_KEY is missing."
    );

    return;
  }

  if (
    adminEmails.length === 0
  ) {
    console.warn(
      "Support notification skipped: SUPPORT_ADMIN_EMAILS is empty."
    );

    return;
  }

  const from =
    process.env
      .SUPPORT_EMAIL_FROM ??
    "ASCEND Support <support@ascendai.space>";

  const appUrl = (
    process.env
      .NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  ).replace(/\/+$/, "");

  const adminUrl =
    `${appUrl}/support/admin`;

  const urgencyLabel =
    getUrgencyLabel(
      supportCase.urgency
    );

  const subject =
    `[${urgencyLabel}] New ASCEND case ${supportCase.referenceNumber}`;

  const resend =
    new Resend(apiKey);

  const results =
    await Promise.allSettled(
      adminEmails.map(
        (adminEmail) =>
          resend.emails.send({
            from,

            to: adminEmail,

            subject,

            text:
              createPlainTextMessage(
                supportCase,
                adminUrl
              ),

            html:
              createHtmlMessage(
                supportCase,
                adminUrl
              ),
          })
      )
    );

  results.forEach(
    (result, index) => {
      if (
        result.status ===
        "rejected"
      ) {
        console.error(
          `Support notification failed for ${adminEmails[index]}:`,
          result.reason
        );

        return;
      }

      if (
        result.value.error
      ) {
        console.error(
          `Support notification failed for ${adminEmails[index]}:`,
          result.value.error
        );
      }
    }
  );
}