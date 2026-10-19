/* ═══════════════════════════════════════════════════════════════
   KProjectXX — lead notifier (Google Apps Script)

   Every time the website form is submitted this script:
     1. adds the lead as a new row in the "Leads" sheet
     2. emails you the lead details, with tap-to-call and WhatsApp links

   It runs inside your Google account, so no password or app password
   is needed (and none ever goes into the website code).

   Setup: see SETUP.md → "Lead capture + email alerts".
   ═══════════════════════════════════════════════════════════════ */

/** Who gets the alert. Leave "" to use the Google account that deploys this script. */
const NOTIFY_EMAIL = "";

const SHEET_NAME = "Leads";
const HEADERS = ["Time", "Name", "Mobile", "I am a", "School", "Source"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents);
    const lead = {
      time: String(d.timestamp || new Date().toISOString()),
      name: clean(d.name),
      mobile: clean(d.mobile),
      type: clean(d.type),
      school: clean(d.school),
      source: clean(d.source),
    };

    saveToSheet(lead);
    sendAlert(lead);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    console.error(err);
    return ContentService.createTextOutput("error");
  } finally {
    lock.releaseLock();
  }
}

/** Opening the /exec URL in a browser shows this, which confirms the deploy is live. */
function doGet() {
  return ContentService.createTextOutput("KProjectXX lead notifier is running.");
}

function saveToSheet(lead) {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) return; // standalone script with no sheet: email only
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = book.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([lead.time, lead.name, lead.mobile, lead.type, lead.school, lead.source]);
}

function sendAlert(lead) {
  const to = NOTIFY_EMAIL || Session.getEffectiveUser().getEmail();
  const digits = lead.mobile.replace(/\D/g, "");
  const wa = "https://wa.me/" + (digits.length === 10 ? "91" + digits : digits);
  const isCallback = lead.source === "callback_request";
  const subject = (isCallback ? "Callback request — " : "New KPX Jr lead — ") + lead.name + " (" + lead.type + ")";

  const row = (label, value) =>
    '<tr><td style="padding:6px 16px 6px 0;color:#667;">' + label + '</td><td style="padding:6px 0;"><b>' + value + "</b></td></tr>";

  const html =
    '<div style="font-family:Arial,sans-serif;font-size:15px;color:#111;max-width:480px">' +
    '<h2 style="margin:0 0 12px">' + (isCallback ? "Someone asked for a callback" : "New lead from the website") + "</h2>" +
    '<table style="border-collapse:collapse">' +
    row("Name", esc(lead.name)) +
    row("Mobile", '<a href="tel:+91' + esc(digits) + '">' + esc(lead.mobile) + "</a>") +
    row("I am a", esc(lead.type)) +
    row("School", esc(lead.school) || "-") +
    row("Source", esc(lead.source)) +
    row("Time", esc(lead.time)) +
    "</table>" +
    '<p style="margin:18px 0 0"><a href="' + esc(wa) + '" style="background:#25D366;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;font-weight:bold">Message on WhatsApp</a></p>' +
    "</div>";

  const text =
    "Name: " + lead.name + "\nMobile: " + lead.mobile + "\nI am a: " + lead.type +
    "\nSchool: " + (lead.school || "-") + "\nSource: " + lead.source + "\nTime: " + lead.time + "\nWhatsApp: " + wa;

  MailApp.sendEmail({ to: to, subject: subject, body: text, htmlBody: html, name: "KProjectXX Website" });
}

/** Trim, cap length, and drop control characters from anything the form sent. */
function clean(v) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 200);
}

function esc(v) {
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Run this once from the editor: it asks for permission and sends a test email. */
function testLead() {
  doPost({
    postData: {
      contents: JSON.stringify({
        name: "Test Parent",
        mobile: "+918008115595",
        type: "Parent",
        school: "Demo School",
        source: "kpx_unlock",
        timestamp: new Date().toISOString(),
      }),
    },
  });
}
