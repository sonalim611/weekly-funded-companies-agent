/**
 * StartWithStartup feedback webhook
 *
 * Setup:
 * 1. Go to https://script.google.com → New project
 * 2. Paste this file's contents into Code.gs
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Authorize when prompted (Advanced → Go to project → Allow)
 * 5. Copy the Web App URL into GOOGLE_SHEETS_FEEDBACK_WEBHOOK_URL
 *
 * The first submission creates a spreadsheet named "StartupFeedback" in your Drive.
 */

const SPREADSHEET_NAME = "StartupFeedback";
const SHEET_NAME = "Feedback";

function getOrCreateSpreadsheet() {
  const files = DriveApp.getFilesByName(SPREADSHEET_NAME);
  if (files.hasNext()) {
    return SpreadsheetApp.open(files.next());
  }
  return SpreadsheetApp.create(SPREADSHEET_NAME);
}

function getOrCreateFeedbackSheet() {
  const spreadsheet = getOrCreateSpreadsheet();
  const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "received_at",
      "event_timestamp",
      "rating",
      "liked",
      "confusing",
      "feature_request",
      "user_agent",
    ]);
  }

  return sheet;
}

function doPost(e) {
  try {
    const sheet = getOrCreateFeedbackSheet();
    const raw = e && e.postData && e.postData.contents ? e.postData.contents : "{}";
    const body = JSON.parse(raw);

    const rating = Number(body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return jsonResponse({ ok: false, error: "Invalid rating" }, 400);
    }

    sheet.appendRow([
      new Date(),
      body.timestamp || "",
      rating,
      (body.liked || "").toString(),
      (body.confusing || "").toString(),
      (body.feature || "").toString(),
      (body.userAgent || "").toString(),
    ]);

    return jsonResponse({ ok: true }, 200);
  } catch (err) {
    return jsonResponse(
      { ok: false, error: err && err.message ? err.message : "Unknown error" },
      500,
    );
  }
}

function jsonResponse(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
