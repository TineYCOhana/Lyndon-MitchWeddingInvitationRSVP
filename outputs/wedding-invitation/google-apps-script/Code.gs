/*
  GOOGLE SHEETS RSVP BACKEND

  Sheet 1: Guests
    A: Name
    B: Invited Pax

  Sheet 2: RSVPs
    Created automatically on the first submission.
*/

const GUEST_SHEET = "Guests";
const RSVP_SHEET = "RSVPs";

function doGet(e) {
  try {
    const action = (e.parameter.action || "").toLowerCase();
    if (action !== "lookup") return json_({ success: false, message: "Unknown action." });

    const requestedName = normalize_(e.parameter.name || "");
    if (!requestedName) return json_({ found: false });

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(GUEST_SHEET);
    if (!sheet) throw new Error('Create a sheet named "Guests" first.');

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return json_({ found: false });
    const rows = sheet.getRange(2, 1, lastRow - 1, 2).getDisplayValues();
    const match = rows.find(row => normalize_(row[0]) === requestedName);

    return match
      ? json_({ found: true, name: match[0].trim(), pax: Math.max(1, Number(match[1]) || 1) })
      : json_({ found: false });
  } catch (error) {
    return json_({ success: false, message: error.message });
  }
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse(e.postData.contents);
    if (data.action !== "rsvp") return json_({ success: false, message: "Unknown action." });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const guestSheet = ss.getSheetByName(GUEST_SHEET);
    if (!guestSheet) throw new Error('Create a sheet named "Guests" first.');

    const guestRows = guestSheet.getLastRow() > 1
      ? guestSheet.getRange(2, 1, guestSheet.getLastRow() - 1, 2).getDisplayValues()
      : [];
    const guest = guestRows.find(row => normalize_(row[0]) === normalize_(data.name));
    if (!guest) return json_({ success: false, message: "Guest was not found." });

    const invitedPax = Math.max(1, Number(guest[1]) || 1);
    const attendingPax = Math.max(0, Number(data.attendingPax) || 0);
    if (attendingPax > invitedPax) {
      return json_({ success: false, message: "Party size is greater than the reserved seats." });
    }

    let rsvpSheet = ss.getSheetByName(RSVP_SHEET);
    if (!rsvpSheet) {
      rsvpSheet = ss.insertSheet(RSVP_SHEET);
      rsvpSheet.appendRow([
        "Timestamp", "Guest Name", "Invited Pax", "Attendance",
        "Attending Pax", "Accompanying Guests", "Message"
      ]);
      rsvpSheet.setFrozenRows(1);
    }

    const values = rsvpSheet.getDataRange().getValues();
    const existingIndex = values.findIndex((row, index) =>
      index > 0 && normalize_(row[1]) === normalize_(guest[0])
    );
    const row = [
      new Date(), guest[0], invitedPax, data.attendance === "Yes" ? "Yes" : "No",
      attendingPax, clean_(data.accompanyingGuests), clean_(data.message)
    ];

    if (existingIndex > 0) {
      rsvpSheet.getRange(existingIndex + 1, 1, 1, row.length).setValues([row]);
    } else {
      rsvpSheet.appendRow(row);
    }
    return json_({ success: true });
  } catch (error) {
    return json_({ success: false, message: error.message });
  } finally {
    lock.releaseLock();
  }
}

function normalize_(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

function clean_(value) {
  const text = String(value || "").trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
