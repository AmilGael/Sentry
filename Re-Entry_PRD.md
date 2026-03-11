PRODUCT REQUIREMENTS DOCUMENT (PRD)

RE-ENTRY RESIDENT MANAGEMENT & EMPLOYMENT PASS SYSTEM

Version: 1.3
Date: March 11, 2026
Status: Draft — Final v1 scope locked (all decisions resolved)
Authors: Project Team

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


1. EXECUTIVE SUMMARY


1.1 Problem Statement

Re-entry programs and halfway houses manage supervised populations who must be accounted for at all times. A critical component of successful re-entry is gainful employment, which requires coordination between Case Managers, Employment Specialists, and Front Desk Officers to authorize, document, and track resident movements in and out of the facility.

Currently, this process relies on physical paperwork — authorization forms are filled out, stamped, and physically delivered to the front desk. This creates delays, introduces human error, makes tracking difficult, and generates a paper trail that is hard to audit. Worse, residents have been known to alter paper-based or screenshot-based passes to extend unauthorized time outside the facility.


1.2 Proposed Solution

A web-based Resident Management and Employment Pass System that:

  1) Digitizes the entire authorization workflow — from employment verification to pass generation — eliminating paper entirely.

  2) Provides real-time Front Desk visibility — approved passes appear instantly on the Front Desk dashboard with no physical handoff required.

  3) Employs cryptographic tamper-proofing (HMAC-SHA256) — every digital pass is signed with a server-side secret key, making it mathematically impossible for residents to alter pass details (times, dates, destinations) without detection.

  4) Tracks resident movements in real time — who is out, where they went, when they're expected back, and whether they're overdue.

  5) Generates audit-ready logs — every action in the system is timestamped and attributed to a specific user for compliance and oversight.


1.3 Target Users

  ADMINISTRATOR
  Description: Facility director or IT admin. Configures system settings, manages user accounts, views reports.
  Estimated count per facility: 1–2

  CASE MANAGER
  Description: Manages resident caseloads. Initiates employment authorization requests, monitors resident progress.
  Estimated count per facility: 3–10

  EMPLOYMENT SPECIALIST
  Description: Verifies employment offers, approves or denies authorization requests, manages employer relationships.
  Estimated count per facility: 1–5

  FRONT DESK OFFICER
  Description: Operates the check-in/check-out station. Scans passes, monitors the real-time dashboard, escalates overdue residents.
  Estimated count per facility: 2–4 per shift

  RESIDENT
  Description: Supervised individual residing in the facility. Receives digital passes on personal device.
  Estimated count per facility: 50–300+


1.4 Success Metrics

  • Time from approval to Front Desk visibility: Less than 2 seconds (real-time)
  • Paper forms eliminated: 100%
  • Pass fraud/tampering detection rate: 100% (cryptographically guaranteed)
  • Average time to process a check-out at Front Desk: Less than 30 seconds
  • Overdue resident detection: Immediate (within 1 minute of scheduled return)
  • System uptime: 99.9%


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


2. USER ROLES & PERMISSIONS


2.1 Role-Based Access Control (RBAC)

The system enforces strict role-based access. No user should be able to perform actions outside their designated role.

ADMINISTRATOR can:
  • Manage user accounts
  • Configure facility settings (curfews, max hours, etc.)
  • View all reports and audit logs
  • Create and edit resident profiles
  • Revoke an active pass
  • View Front Desk dashboard

CASE MANAGER can:
  • Create and edit resident profiles
  • Create Employment Authorization Requests
  • Self-approve an Employment Authorization in emergency or after-hours situations (triggers automatic notification to Employment Specialist)
  • Revoke an active pass

EMPLOYMENT SPECIALIST can:
  • Approve or deny Employment Authorization Requests
  • Revoke an active pass

FRONT DESK OFFICER can:
  • View Front Desk dashboard
  • Check residents in and out
  • Scan and verify QR passes

RESIDENT can:
  • View their own pass on personal device
  • View their own schedule on personal device


2.2 Authentication Requirements

  • All staff users (Admin, Case Manager, Employment Specialist, Front Desk) authenticate via email and password with mandatory strong password policy (minimum 10 characters, mixed case, number, special character).

  • Session timeout after 30 minutes of inactivity for staff.

  • Residents access their passes via a unique, time-limited secure link (no account creation required). No resident portal or login is needed for v1.

  • All authentication events are logged.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


3. CORE MODULES & FUNCTIONAL REQUIREMENTS


3.1 — MODULE 1: RESIDENT MANAGEMENT

Purpose: Maintain a complete, up-to-date profile of every resident in the facility.


3.1.1 Resident Profile Fields

  • Resident ID — Auto-generated, system-assigned unique identifier (e.g., R-00001). Required.
  • Inmate Number — The resident's official DOC/facility-issued inmate number, used for identity verification at Front Desk. Required.
  • First Name — Text. Required.
  • Last Name — Text. Required.
  • Date of Birth — Date. Required.
  • Intake Date — Date the resident entered the facility. Required.
  • Expected Release Date — Date. Required.
  • Assigned Case Manager — Dropdown of active Case Managers. Required.
  • Current Status — See status states below. Required.
  • Room/Bed Assignment — Text. Optional.
  • Emergency Contact Name — Text. Required.
  • Emergency Contact Phone — Phone number. Required.
  • Conditions/Restrictions — Special conditions, e.g., "no travel beyond 10 miles." Optional.
  • Notes — Internal notes from Case Manager. Optional.


3.1.2 Resident Status States

  INTAKE → The resident has just been registered in the system.

  IN_FACILITY → The resident is physically present in the facility. This is the default active state.

  AUTHORIZED_OUT → The resident has been checked out at the Front Desk with a valid, active pass.

  OVERDUE → The resident has not returned by their scheduled return time, plus a configurable grace period (default: 15 minutes).

  AWOL → The resident has been overdue beyond the escalation threshold (default: 2 hours) or has been manually escalated.

  RELEASED → The resident has completed their program or sentence and is no longer under supervision. This is a terminal state.

Status Transition Rules:

  • INTAKE to IN_FACILITY — Automatic upon profile completion.
  • IN_FACILITY to AUTHORIZED_OUT — Only when checked out at Front Desk with a valid, active pass.
  • AUTHORIZED_OUT to IN_FACILITY — When checked back in at Front Desk.
  • AUTHORIZED_OUT to OVERDUE — Automatic when current time exceeds the pass return time by the configurable threshold.
  • OVERDUE to AWOL — Manual escalation by Admin or Case Manager, or automatic after the configurable AWOL threshold.
  • OVERDUE or AWOL to IN_FACILITY — When the resident returns and is checked in. An incident report is auto-generated.
  • IN_FACILITY to RELEASED — Manual action by Admin only.


3.1.3 Resident Search and Filters

  • Search by name, Resident ID, or status.
  • Filter by status, assigned Case Manager, intake date range, expected release date range.
  • Sort by name, status, intake date, release date.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


3.2 — MODULE 2: EMPLOYMENT AUTHORIZATION WORKFLOW

Purpose: Digitize the entire flow from employment offer verification to pass generation, eliminating all paper forms.


3.2.1 Employment Authorization Request (Created by Case Manager)

  • Authorization ID — Auto-generated (e.g., EA-00001). Required.
  • Resident — Dropdown/search of active residents on this Case Manager's caseload. Required.
  • Employer Name — Text. Required.
  • Employer Address — Full street address. Required.
  • Employer Phone — Phone number. Required.
  • Employer Contact Person — Name of hiring manager or supervisor. Required.
  • Job Title / Position — Text. Required.
  • Pay Rate — Hourly or salary. Optional.
  • Employment Type — One of: Full-Time, Part-Time, Temporary, Day Labor. Required.
  • Proposed Schedule — Structured schedule (see 3.2.2). Required.
  • Transportation Method — One of: Public Transit, Personal Vehicle, Employer Transport, Walking, Other. Required.
  • Transportation Details — e.g., "Bus route 42" or "Employer van picks up at 6:45 AM." Optional.
  • Supporting Documents — File uploads (offer letter, employer verification, etc.). Optional.
  • Case Manager Notes — Context for the Employment Specialist. Optional.
  • Status — See 3.2.3. Required.
  • Created At — Auto-generated timestamp.
  • Created By — Auto-assigned to the Case Manager who created it.


3.2.2 Proposed Schedule Structure

The schedule defines when the resident is authorized to be out. It supports both recurring and one-time schedules.

  • Schedule Type — RECURRING or ONE_TIME. Required.
  • Start Date — When employment begins. Required.
  • End Date — When employment ends. Null means ongoing. Optional.
  • Days of Week — Applicable days (Mon through Sun). Required for recurring.
  • Departure Time — When the resident should leave. Required.
  • Required Return Time — When the resident MUST be back. Required.
  • Travel Buffer — Minutes added for commute time (default: 30 min). Required.

Example of a Recurring Schedule:
  Days: Monday through Friday
  Departure: 6:30 AM
  Return by: 5:30 PM
  Travel buffer: 30 minutes
  Start date: March 15, 2026
  End date: None (ongoing)

Example of a One-Time Schedule:
  Type: One-Time
  Date: March 12, 2026
  Departure: 9:00 AM
  Return by: 12:00 PM
  Purpose: Job interview at ABC Company


3.2.3 Authorization Status States

  PENDING — Just submitted by Case Manager. Awaiting Employment Specialist review.

  UNDER REVIEW — Employment Specialist has opened and is actively reviewing.

  APPROVED — Employment Specialist has approved. Movement passes can now be generated.

  CM_SELF_APPROVED — Case Manager has self-approved under emergency or after-hours conditions. Movement passes can be generated immediately, but the Employment Specialist is automatically notified and must review and ratify or flag the authorization after the fact. These authorizations are visually distinguished throughout the system (e.g., tagged "CM Self-Approved — Pending ES Review").

  ES_RATIFIED — Employment Specialist has reviewed and ratified a previously self-approved authorization. This confirms the authorization as fully approved.

  ACTIVE — At least one movement pass has been generated and used.

  DENIED — Employment Specialist denied the request. A reason must be provided.

  REVOKED — A previously approved or active authorization has been cancelled. A reason must be provided. All future passes under this authorization are immediately invalidated.

  EXPIRED — The authorization end date has passed.


3.2.4 Approval Model: Dual-Approval with Emergency Bypass

The system uses a dual-approval model. Under normal circumstances, both the Case Manager and the Employment Specialist must approve before passes are generated. In emergency or after-hours situations, the Case Manager may bypass the Employment Specialist and self-approve.

  NORMAL FLOW:
  1. Case Manager creates the Employment Authorization Request.
  2. Employment Specialist receives a notification and reviews the request.
  3. Employment Specialist approves or denies.
  4. If approved, movement passes are generated.

  EMERGENCY / AFTER-HOURS FLOW:
  1. Case Manager creates the Employment Authorization Request.
  2. Employment Specialist is unavailable (after hours, weekend, emergency).
  3. Case Manager selects "Self-Approve (Emergency)" and provides a brief justification.
  4. The authorization status is set to CM_SELF_APPROVED.
  5. Movement passes are generated immediately.
  6. The Employment Specialist receives an automatic notification flagging this as a self-approval that requires their review.
  7. The Employment Specialist reviews the authorization at their earliest opportunity and either ratifies it (status becomes ES_RATIFIED) or flags issues and contacts the Case Manager.

  SELF-APPROVAL RULES:
  • Self-approved authorizations are visually tagged throughout the system as "CM Self-Approved — Pending ES Review" so they are never mistaken for fully vetted authorizations.
  • The system tracks and reports self-approval frequency per Case Manager for oversight purposes.
  • Administrators can optionally disable self-approval capability if facility policy prohibits it.

EMPLOYMENT SPECIALIST REVIEW:

When the Employment Specialist reviews a request (normal flow or ratifying a self-approval), they see:
  • Full request details and supporting documents.
  • Resident's profile, history, and any conditions or restrictions.
  • Resident's existing authorizations (to detect schedule conflicts).
  • If reviewing a self-approval: the Case Manager's justification and the date/time it was self-approved.

They must provide:
  • Decision — Approve, Deny, or Ratify (for self-approvals).
  • Reason — Required for Deny, optional for Approve/Ratify.
  • Schedule adjustments (optional) — The specialist may modify departure/return times before approving.
  • Expiration date (optional) — Override the authorization end date.

  When a new request is submitted:
    → Employment Specialist(s) are notified via in-app notification.

  When a request is approved:
    → Case Manager and Front Desk are notified via in-app real-time push.

  When a request is denied:
    → Case Manager is notified via in-app notification.

  When an authorization is revoked:
    → Case Manager and Front Desk are notified via in-app real-time push.

  When an authorization is expiring (7 days out):
    → Case Manager is notified via in-app notification.


3.2.5 Notifications — Self-Approval Alert

  When a Case Manager self-approves an Employment Authorization (emergency / after-hours):
    → The Employment Specialist receives an automatic in-app notification flagging the authorization as a CM self-approval that requires their review. The notification includes the authorization ID, resident name, employer, the Case Manager's justification, and the date/time of the self-approval so the Employment Specialist can prioritize and ratify or follow up promptly.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


3.3 — MODULE 3: MOVEMENT PASS GENERATION & CRYPTOGRAPHIC SIGNING

Purpose: Automatically generate tamper-proof digital passes from approved authorizations and deliver them to both the Front Desk and the resident.


3.3.1 Pass Generation Rules

  • When an Employment Authorization is approved and has a RECURRING schedule, the system auto-generates daily passes for each scheduled day, generated the night before (configurable, default: 10:00 PM).

  • When an Employment Authorization is approved and has a ONE-TIME schedule, the system generates a single pass immediately upon approval.

  • Passes are never generated for dates beyond the authorization's expiration.

  • Passes are never generated if the resident's status is AWOL or RELEASED.

  • If an authorization is revoked, all future unused passes under it are immediately invalidated.


3.3.2 Movement Pass Data Fields

  • Pass ID — Auto-generated unique identifier (e.g., MP-20260310-0042).
  • Resident ID — Reference to the resident.
  • Resident Full Name — Stored directly on the pass for display.
  • Resident Inmate Number — Stored directly on the pass for identity verification at Front Desk.
  • Authorization ID — Reference to the parent authorization.
  • Employer Name — Text.
  • Employer Address — Text.
  • Pass Type — One of: Work, Job Search, Interview.
  • Date — The specific date this pass is valid for.
  • Scheduled Departure — Date and time.
  • Scheduled Return — Date and time.
  • Status — One of: Active, Used, Completed, Expired, Cancelled.
  • HMAC Signature — Cryptographic signature (see 3.3.3).
  • QR Code Data — Encoded payload for scanning (see 3.3.4).
  • Issued At — Timestamp when the pass was generated.
  • Issued By — System (auto-generated).


3.3.3 Cryptographic Signing (HMAC-SHA256) — CRITICAL SECURITY FEATURE

Objective: Ensure that any digital pass displayed on a resident's personal device cannot be altered without detection.

SIGNING PROCESS (when a pass is created):

  Step 1: The system constructs a canonical pass payload as a deterministic data structure containing the pass ID, resident ID, date, departure time, return time, employer name, pass type, and issued-at timestamp.

  Step 2: All data fields are sorted alphabetically by their field names to ensure the exact same ordering every time.

  Step 3: The system computes an HMAC-SHA256 signature using a secret key stored only on the server. This produces a 64-character hexadecimal string that is unique to this exact pass data.

  Step 4: The signature is stored alongside the pass record in the database.

  Step 5: The pass data and signature are encoded into a QR code.

VERIFICATION PROCESS (when Front Desk scans the QR code):

  Step 1: Front Desk officer scans the QR code from the resident's phone.

  Step 2: The system extracts the pass data and signature from the QR payload.

  Step 3: The system reconstructs the canonical payload from the extracted data.

  Step 4: The system recomputes the HMAC-SHA256 using the same server secret key.

  Step 5: The system checks all of the following:
    — Does the computed signature match the presented signature?
    — Is the pass status still Active?
    — Is the pass date today?
    — Is the current time within the departure/return window?
    — Is the resident's status IN_FACILITY?

  Step 6: Result:
    — If ALL checks pass: Display a green "VERIFIED" screen with the resident's name and inmate number.
    — If ANY check fails: Display a red "DENIED" screen with the specific reason.

WHY THIS IS TAMPER-PROOF:

  • Changing any single character of the pass data (even changing "5:00 PM" to "5:01 PM") produces a completely different HMAC signature.

  • Computing a valid HMAC requires the secret key, which exists only on the server and is never shared.

  • The QR code is merely a transport mechanism. The server is the ultimate authority.

  • To forge a pass, a resident would need to break into the server, steal the secret key, understand cryptographic signing, generate a new HMAC, and encode it into a valid QR code. This is the same level of security used by banks and government systems.

SERVER SECRET KEY MANAGEMENT:

  • The HMAC secret key is a randomly generated 256-bit (32-byte) key.
  • Stored securely as an environment variable on the server (PASS_SIGNING_SECRET).
  • Never exposed to any client, API response, or log.
  • Rotated periodically (recommended every 90 days) with a key versioning scheme so existing passes remain verifiable during transition.


3.3.4 QR Code Specification

The QR code encodes a compact payload containing:
  • Schema version number (for forward compatibility)
  • Pass ID
  • Resident ID
  • Date
  • Departure time
  • Return time
  • Employer name
  • Pass type
  • HMAC signature

Field names are abbreviated to minimize QR code density. Error correction level is set to High (30% recovery), which tolerates screen scratches and cracks. The QR code must be scannable from 8 inches away on a standard phone screen.


3.3.5 Resident Pass Delivery

Passes are delivered via on-screen display. No SMS or email delivery is used. The resident views their pass on any available screen and either shows it directly to the Front Desk or photographs it for their records. A printed paper pass is the fallback for residents without phone access.

  PRIMARY — Secure Web Link (Screen Display):
  The system generates a unique, time-limited URL containing a signed token with 24-hour expiry. The Case Manager or Front Desk officer shares the link with the resident (verbally, written on paper, or displayed on a staff screen for the resident to photograph). The resident opens the link in any browser to see the pass with a scannable QR code. No app installation or account creation is required. The link page is optimized for mobile display and includes the resident's name, inmate number, employer, authorized times, and the QR code prominently centered for easy scanning at the Front Desk. The resident may photograph the screen to retain a copy of the QR code for presentation at check-out.

  FALLBACK — Printed Paper Pass:
  For residents who do not have a cell phone, the Front Desk or Case Manager can print a paper pass that includes the same QR code and pass details. The paper pass follows the same cryptographic signing process and is verified identically on scan. Printed passes are generated from the staff interface via a "Print Pass" action on any active movement pass.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


3.4 — MODULE 4: FRONT DESK DASHBOARD & CHECK-IN/CHECK-OUT

Purpose: Provide Front Desk officers with a real-time command center for monitoring all resident movements.


3.4.1 Dashboard Layout

The Front Desk Dashboard is the primary operational screen. It must be designed for a wall-mounted monitor or dedicated desktop and update in real-time without page refresh.

The dashboard contains four sections:

  SECTION 1 — FACILITY STATUS BAR (top of screen):
  Displays at a glance: Total Residents, In Facility count, Currently Out count, Overdue count (with warning indicator), and AWOL count (with critical indicator).

  SECTION 2 — CURRENTLY OUT (left panel):
  A list of all residents currently outside the facility, sorted by return time (soonest first). Each entry shows the resident's name, where they went, and their expected return time. Entries are color-coded by urgency (see 3.4.2).

  SECTION 3 — UPCOMING DEPARTURES (right panel):
  A list of residents with active passes scheduled to depart within the next 2 hours. Shows name, employer, and departure time.

  SECTION 4 — CHECK-IN / CHECK-OUT STATION (bottom of screen):
  Two primary action buttons: "Scan QR Code" (activates camera) and "Search Resident" (manual lookup by name or ID).


3.4.2 Color Coding and Alerts

  GREEN — Resident is out and return time is 30+ minutes away. No action needed.

  YELLOW — Resident is out and return time is within 30 minutes. Prepare for check-in.

  RED — Resident is overdue (past scheduled return time). Alert is displayed on screen and a notification is sent to the Case Manager.

  RED FLASHING — Resident is AWOL (overdue beyond the escalation threshold). Alert is displayed on screen and escalated to Admin.

  Audio alerts:
    • Configurable audible chime when a resident becomes overdue.
    • Configurable alarm when the AWOL threshold is reached.


3.4.3 Check-Out Process

  1. Resident approaches the Front Desk with their phone showing the QR code.

  2. The Front Desk officer taps the "Scan QR Code" button on the dashboard.

  3. The device camera activates and scans the QR code.

  4. The system performs cryptographic verification (as described in Section 3.3.3).

  5. A verification result screen appears showing:
     — Green "PASS VERIFIED" banner (or red "DENIED" banner)
     — Resident's name and inmate number
     — Employer name
     — Authorized departure and return times
     — Pass type (Work, Job Search, or Interview)
     — A "Confirm Check-Out" button

  6. The officer verbally confirms the resident's name and inmate number match.

  7. The officer taps "Confirm Check-Out."

  8. The system logs the departure with a timestamp.

  9. The resident's status changes to AUTHORIZED_OUT.

  10. The resident immediately appears in the "Currently Out" section of the dashboard.


CHECK-OUT DENIAL SCENARIOS:

  If the signature is invalid (tampered pass):
  → "PASS VERIFICATION FAILED — This pass has been altered. Do not permit departure."

  If the pass is expired or cancelled:
  → "PASS INVALID — This pass is no longer active."

  If the pass is for a different date:
  → "PASS NOT VALID TODAY — This pass is for [date]."

  If it is outside the departure window:
  → "OUTSIDE AUTHORIZED WINDOW — Departure authorized between [start time] and [end time]."

  If the resident is already checked out:
  → "ALREADY CHECKED OUT — Resident checked out at [time]."

  If the resident's status is AWOL or RELEASED:
  → "RESIDENT NOT ELIGIBLE — Current status: [status]."


3.4.4 Check-In Process

  1. The resident returns to the facility.

  2. The Front Desk officer scans the QR code or searches for the resident by name or ID.

  3. The system records the return timestamp.

  4. The system compares the actual return time to the scheduled return time.

  5. If the resident is on time or early:
     — Status changes to IN_FACILITY.
     — Pass status changes to COMPLETED.
     — A green confirmation is displayed.

  6. If the resident is late (past scheduled return):
     — Status changes to IN_FACILITY.
     — Pass status changes to COMPLETED.
     — A warning is displayed: "RETURNED LATE — [X] minutes past scheduled return."
     — A late return incident is automatically logged.
     — The Case Manager is notified.


3.4.5 Real-Time Updates (WebSocket)

The Front Desk Dashboard receives real-time updates via WebSocket connection:

  • When a new pass is approved → it appears in "Upcoming Departures."
  • When a pass is revoked or cancelled → it is removed from the dashboard. If the resident is currently out, an alert is displayed.
  • When a resident is checked out → they move to "Currently Out."
  • When a resident is checked in → they are removed from "Currently Out."
  • When a resident becomes overdue → their entry changes to red with an audible alert.
  • When a resident is escalated to AWOL → their entry flashes red with an escalation alert.


3.4.6 Lightweight Offline Fallback

The Front Desk device caches today's active passes locally so that QR code verification continues to work if internet connectivity drops. This ensures the check-in/check-out process is never blocked by a network outage.

  CACHE STRATEGY:
  • Each morning (and on every subsequent pass approval or revocation), the system downloads a local copy of all active movement passes for the current date to the Front Desk device using browser local storage or IndexedDB.
  • The cached data includes the pass payload fields needed for HMAC verification (pass ID, resident ID, date, departure/return times, employer, pass type, signature) as well as the resident's name and inmate number.
  • The HMAC signing secret is NOT cached on the device. Instead, the cache stores the pre-computed expected signature for each pass. Verification in offline mode compares the QR code's embedded signature against the cached expected signature for that pass ID.

  OFFLINE BEHAVIOR:
  • When the Front Desk device detects loss of connectivity (WebSocket disconnect and failed health-check ping), the dashboard displays a visible "OFFLINE MODE" banner.
  • QR code scanning and verification continue using the local cache. The system matches the scanned pass ID against the cached pass list and validates the signature match.
  • Check-out and check-in actions are recorded locally with timestamps and queued for sync.
  • New pass approvals or revocations that occur while the device is offline will not be reflected until connectivity returns. The "OFFLINE MODE" banner alerts staff to this limitation.

  SYNC ON RECONNECTION:
  • When connectivity is restored, the device automatically uploads all queued check-in/check-out events to the server in chronological order.
  • The server processes each event and resolves any conflicts (e.g., a pass revoked while the device was offline that was used during the outage triggers an incident report).
  • The local cache is refreshed with the latest pass data from the server.
  • The "OFFLINE MODE" banner is removed once sync is complete.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


3.5 — MODULE 5: INCIDENT REPORTING

Purpose: Automatically log and track security-relevant incidents.


3.5.1 Auto-Generated Incidents

The system automatically creates incident reports for the following triggers:

  • Resident returns more than 15 minutes late → LATE_RETURN incident, LOW severity.
  • Resident returns more than 1 hour late → OVERDUE incident, MEDIUM severity.
  • Resident status escalated to AWOL → AWOL incident, HIGH severity.
  • Tampered pass detected (signature mismatch at scan) → PASS_TAMPERING incident, CRITICAL severity.
  • Resident attempts check-out with an invalid pass → UNAUTHORIZED_ATTEMPT incident, MEDIUM severity.


3.5.2 Incident Report Fields

  • Incident ID — Auto-generated (e.g., INC-20260310-0003).
  • Resident — Reference to the resident involved.
  • Pass — Reference to the pass involved (if applicable).
  • Type — One of: Late Return, Overdue, AWOL, Pass Tampering, Unauthorized Attempt, Other.
  • Severity — One of: Low, Medium, High, Critical.
  • Description — Auto-generated narrative plus space for officer notes.
  • Status — One of: Open, Under Review, Resolved, Closed.
  • Created At — Timestamp.
  • Created By — System or the user who filed it.
  • Resolved At — Timestamp.
  • Resolved By — Reference to the user who resolved it.
  • Resolution Notes — Text.


3.5.3 Manual Incident Reports

Front Desk officers and Case Managers can also create manual incident reports for situations not covered by auto-generation, such as behavioral issues or facility rule violations.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


3.6 — MODULE 6: REPORTING & ANALYTICS

Purpose: Provide administrators with compliance-ready reports and operational insights.


3.6.1 Standard Reports

  Daily Movement Log — All check-ins and check-outs for a given date. For Admin and Front Desk.

  Currently Out Report — Snapshot of all residents currently outside the facility. For Admin and Front Desk.

  Overdue/AWOL Report — All overdue and AWOL events within a date range. For Admin.

  Resident Movement History — Complete in/out history for a specific resident. For Admin and Case Manager.

  Employment Placement Report — Number of residents with approved employment, broken down by Case Manager. For Admin.

  Pass Utilization Report — Passes generated vs. used vs. cancelled, by date range. For Admin.

  Incident Summary — All incidents by type, severity, and resolution status. For Admin.

  Case Manager Caseload — Resident count, authorization count, and incident count per Case Manager. For Admin.

  Audit Trail — Chronological log of all system actions by user. For Admin.


3.6.2 Export Formats

  • All reports are exportable as PDF and CSV.
  • The Audit Trail is exportable as CSV only (for large datasets).


3.6.3 Dashboard Analytics (Admin Home Screen)

  • Residents by status (pie chart)
  • Daily movement volume over the last 30 days (bar chart)
  • Overdue incidents trend over the last 90 days (line chart)
  • Employment placement rate over the last 30, 60, and 90 days (percentage)
  • Average time from authorization request to approval


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


3.7 — MODULE 7: ADMINISTRATION

3.7.1 User Management

  • Create, edit, and deactivate user accounts.
  • Assign roles (one role per user).
  • Password reset functionality.
  • View user activity log.


3.7.2 Facility Configuration

  Facility Name — Displayed in headers and reports.

  Overdue Threshold — Minutes past scheduled return before flagging as overdue. Default: 15 minutes.

  AWOL Threshold — Minutes overdue before escalating to AWOL. Default: 120 minutes.

  Pass Generation Time — When recurring daily passes are auto-generated. Default: 10:00 PM.

  Maximum Hours Out — Hard cap on authorized time outside facility. Default: 14 hours.

  Early Departure Window — How early before scheduled departure a check-out is allowed. Default: 15 minutes.

  QR Code Expiry — How long a QR code link remains accessible. Default: 24 hours.

  Audio Alerts Enabled — Enable or disable dashboard audio alerts. Default: Enabled.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


4. DATA MODEL


4.1 Entities and Relationships

  USER
  Contains: id, email, name, role, password (hashed), isActive flag.
  Relationships: A User with the Case Manager role is assigned to multiple Residents. A User with the Employment Specialist role reviews multiple Employment Authorizations.

  RESIDENT
  Contains: id, inmateNumber, firstName, lastName, dateOfBirth, intakeDate, expectedReleaseDate, status, roomAssignment, emergencyContact, conditions, notes.
  Relationships: Belongs to one Case Manager (User). Has many Employment Authorizations. Has many Movement Passes. Has many Movement Logs. Has many Incident Reports.

  EMPLOYMENT AUTHORIZATION
  Contains: id, residentId, requestedById, reviewedById, employerName, employerAddress, employerPhone, employerContact, jobTitle, payRate, employmentType, schedule (structured data), transportationMethod, transportationDetails, supportingDocuments, status, denialReason, selfApprovedByCM (boolean — true if a Case Manager self-approved this authorization under emergency/after-hours conditions), selfApprovalJustification (text — the Case Manager's written reason for bypassing normal approval), selfApprovalTimestamp (datetime — when the self-approval occurred), esRatifiedAt (datetime — when the Employment Specialist reviewed and ratified the self-approval), esRatifiedById (reference to User — the Employment Specialist who ratified), createdAt.
  Relationships: Belongs to one Resident. Requested by one Case Manager (User). Reviewed by one Employment Specialist (User). Has many Movement Passes.

  MOVEMENT PASS
  Contains: id, residentId, authorizationId, residentFullName, residentInmateNumber, employerName, employerAddress, passType, date, scheduledDeparture, scheduledReturn, actualDeparture, actualReturn, status, hmacSignature, qrCodeData, issuedAt.
  Relationships: Belongs to one Resident. Belongs to one Employment Authorization. Has many Movement Logs.

  MOVEMENT LOG
  Contains: id, residentId, passId, direction (OUT or IN), timestamp, recordedById.
  Relationships: Belongs to one Resident. Belongs to one Movement Pass. Recorded by one Front Desk Officer (User).

  INCIDENT REPORT
  Contains: id, residentId, passId, type, severity, description, status, createdAt, createdBy, resolvedAt, resolvedById, resolutionNotes.
  Relationships: Belongs to one Resident. Optionally linked to one Movement Pass.

  FACILITY CONFIGURATION
  Contains: id, facilityName, overdueThresholdMinutes (default: 15), awolThresholdMinutes (default: 120), passGenerationTime (default: "22:00"), maximumHoursOut (default: 14), earlyDepartureWindowMinutes (default: 15), qrCodeExpiryHours (default: 24), audioAlertsEnabled (default: true), selfApprovalEnabled (default: true), timezone.
  Relationships: Standalone. Single row for v1 (one facility). Referenced by system logic for all threshold calculations, pass generation scheduling, and display settings.

  NOTIFICATION
  Contains: id, recipientId (reference to User), type (one of: NEW_REQUEST, APPROVED, DENIED, REVOKED, EXPIRING, SELF_APPROVAL_ALERT, OVERDUE, AWOL, LATE_RETURN), title, body, relatedEntityType (one of: Authorization, Pass, Resident, Incident), relatedEntityId, isRead (boolean, default: false), createdAt.
  Relationships: Belongs to one User (recipient). Optionally linked to an Authorization, Pass, Resident, or Incident via the relatedEntityType and relatedEntityId fields.


4.2 Key Constraints

  • A Resident belongs to exactly one Case Manager but can be reassigned.
  • An Employment Authorization belongs to exactly one Resident.
  • A Movement Pass belongs to exactly one Authorization and one Resident.
  • Movement Logs are append-only. No edits or deletes are permitted.
  • Incident Reports are append-only for auto-generated fields. Resolution fields are editable.
  • All timestamps are stored in UTC and displayed in the facility's local timezone.
  • Soft deletes only. No hard deletes of any record, ever. Records are deactivated instead.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


5. CRYPTOGRAPHIC SECURITY SPECIFICATION


5.1 HMAC-SHA256 Implementation Requirements

  Algorithm: HMAC-SHA256
  Key length: 256 bits (32 bytes) minimum
  Key storage: Server environment variable (PASS_SIGNING_SECRET)
  Key rotation: Every 90 days, with support for concurrent active keys during transition
  Payload format: Deterministic JSON with keys sorted alphabetically and no extra whitespace
  Output format: 64-character lowercase hexadecimal string


5.2 Canonical Payload Construction

To ensure deterministic signing and verification, the payload MUST be constructed as follows:

  1. Create a plain object with only the signing-relevant fields.
  2. Sort all keys alphabetically.
  3. Serialize to JSON with no extra whitespace.
  4. The resulting string is the HMAC input.

This matters because if the signing process and verification process serialize the data differently (e.g., different key order), the signatures will not match. Canonical serialization prevents this.


5.3 QR Code Security Considerations

  • The QR code is NOT the source of truth. The server database is.
  • On scan, the system MUST verify the HMAC signature AND check the pass status in the database.
  • This dual check prevents: (a) tampered QR data, and (b) replayed or revoked passes.
  • Rate limit QR scan attempts to a maximum of 5 failed verifications per minute per device to prevent brute-force attacks.


5.4 Key Rotation Procedure

  1. Generate new secret key.
  2. Store both old and new keys with version numbers.
  3. All new passes are signed with the new key. Include a key version field in the payload.
  4. Verification checks the key version in the payload and uses the corresponding key.
  5. After all passes signed with the old key have expired, remove the old key.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


6. NON-FUNCTIONAL REQUIREMENTS


6.1 Performance

  • Page load time: Less than 2 seconds on a 4G connection.
  • QR scan to verification result: Less than 1 second.
  • Dashboard real-time update latency: Less than 2 seconds from the event.
  • API response time (95th percentile): Less than 500 milliseconds.
  • Concurrent users supported: 50+ per facility.
  • Database query time (95th percentile): Less than 200 milliseconds.


6.2 Availability and Reliability

  • System uptime: 99.9% (less than 8.76 hours downtime per year).
  • Automatic database backups: Daily, retained for 30 days.
  • Graceful degradation: If the WebSocket connection drops, the dashboard falls back to polling every 10 seconds.


6.3 Security

  • All traffic over HTTPS (TLS 1.2 or higher).
  • Passwords hashed with bcrypt (cost factor 12).
  • CSRF protection on all state-changing endpoints.
  • SQL injection prevention via parameterized queries through the ORM.
  • XSS prevention via output encoding.
  • Rate limiting on authentication endpoints (5 attempts per minute).
  • Session tokens stored as HTTP-only, Secure, SameSite cookies.
  • Audit log immutability: append-only database table with no UPDATE or DELETE permissions.


6.4 Accessibility

  • WCAG 2.1 Level AA compliance.
  • Keyboard navigable.
  • Screen reader compatible.
  • Minimum color contrast ratio of 4.5 to 1.
  • Font size minimum 16px for the Front Desk dashboard (readability from distance).


6.5 Browser and Device Support

  Desktop and laptop (all staff roles):
    Chrome 90+, Firefox 90+, Safari 15+, Edge 90+

  Tablet (Front Desk alternative):
    iPad Safari 15+, Chrome Android 90+

  Mobile phone (resident pass viewing):
    iOS Safari 14+, Chrome Android 80+


6.6 Scalability

  • Architecture should support multi-facility deployment with a single database and facility-scoped data.
  • Adding a new facility should require only configuration, not code changes.
  • Target: support up to 10 facilities and 3,000 residents in a single deployment.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


7. RECOMMENDED TECH STACK

This section is a recommendation, not a mandate. Each team member may choose their own stack. The key constraint is that the system must meet all functional and non-functional requirements described above.

  Frontend: Next.js 14+ (React) with Tailwind CSS
  Rationale: Server-side rendering, file-based routing, excellent TypeScript support, strong ecosystem.

  Backend API: Next.js API Routes or Express.js
  Rationale: Keeps the codebase unified. Express is an option if a separate backend is preferred.

  Database: PostgreSQL 15+
  Rationale: Relational integrity, JSON support for schedules, proven at scale.

  ORM: Prisma
  Rationale: Type-safe queries, automatic migrations, great developer experience.

  Authentication: NextAuth.js (Auth.js)
  Rationale: Built-in session management, supports role-based middleware.

  Real-Time Communication: WebSocket (Socket.io or native WebSocket)
  Rationale: Required for Front Desk dashboard live updates.

  QR Code Generation: "qrcode" npm package
  Rationale: Lightweight, supports all error correction levels.

  QR Code Scanning: "html5-qrcode" or "react-qr-reader"
  Rationale: Browser-based camera scanning, no native app needed.

  PDF Generation: "@react-pdf/renderer" or "jspdf"
  Rationale: For printable passes and reports.

  Cryptography: Node.js built-in "crypto" module
  Rationale: HMAC-SHA256 with no external dependencies.

  Deployment: Vercel or Railway with managed PostgreSQL
  Rationale: Simple deployment with auto-scaling.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


8. MILESTONES & BUILD ORDER

Each team member should aim to deliver in this sequence to enable incremental testing.

  PHASE 1 — Project scaffold, database schema, ORM migrations, seed data.
  Depends on: Nothing.

  PHASE 2 — Authentication system with role-based access.
  Depends on: Phase 1.

  PHASE 3 — Resident Management (create, read, update, search, status tracking).
  Depends on: Phase 2.

  PHASE 4 — Employment Authorization workflow (create, review, approve, deny).
  Depends on: Phase 3.

  PHASE 5 — Movement Pass generation with HMAC-SHA256 signing.
  Depends on: Phase 4.

  PHASE 6 — QR code generation and resident pass delivery (secure link).
  Depends on: Phase 5.

  PHASE 7 — Front Desk Dashboard with real-time updates, QR scanning, and check-in/check-out.
  Depends on: Phase 5 and Phase 6.

  PHASE 8 — Incident reporting (automatic and manual).
  Depends on: Phase 7.

  PHASE 9 — Reporting and analytics module.
  Depends on: Phases 3 through 8.

  PHASE 10 — Admin configuration panel.
  Depends on: Phase 2.

  PHASE 11 — Polish, accessibility audit, performance optimization.
  Depends on: All previous phases.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


9. RESOLVED DECISIONS

The following questions were identified during requirements gathering and have been resolved. Decisions are documented here for traceability.

  Decision 1: Screen Display Primary / Paper Fallback — No SMS or Email
  Question: Should residents be required to have smartphones, or must the system support phone-less residents? How are passes delivered?
  Resolution: Passes are delivered via a secure web link that the resident views on any available screen (phone, staff computer, etc.). The resident photographs the screen or shows it directly to the Front Desk. No SMS or email delivery is used in v1. For residents without phone access, a printed paper pass with the same QR code is available as a fallback. Both delivery methods use identical cryptographic signing and verification. See Section 3.3.5.

  Decision 2: Single Facility for v1
  Question: Is multi-facility support required in version 1, or single-facility only?
  Resolution: Version 1 targets a single facility. The database schema and architecture are designed to be facility-scoped so that multi-facility support can be added in a future release without schema rewrites, but v1 will not include facility-switching UI, cross-facility reporting, or multi-tenant authentication. See Section 6.6 for scalability notes.

  Decision 3: DOC Integration Deferred
  Question: Should the system integrate with any existing Department of Corrections (DOC), BOP, or state systems?
  Resolution: External system integration is deferred beyond v1. The system will operate as a standalone application. The API layer is designed with clean separation so that future integrations (e.g., DOC resident import, state reporting feeds) can be added as integration modules without modifying core business logic.

  Decision 4: Dual-Approval with Emergency CM Self-Approve
  Question: Should Case Managers be able to approve their own requests, bypassing the Employment Specialist?
  Resolution: The system uses a dual-approval model as the default. Both the Case Manager and the Employment Specialist must approve before passes are generated. In emergency or after-hours situations where the Employment Specialist is unavailable, the Case Manager may self-approve with a mandatory written justification. Self-approved authorizations are visually tagged throughout the system, and the Employment Specialist receives an automatic alert to review and ratify the authorization at their earliest opportunity. Self-approval frequency is tracked per Case Manager, and Administrators can disable the capability if facility policy prohibits it. See Sections 3.2.4, 3.2.5, and 4.1.

  Decision 5: Lightweight Offline Fallback for Front Desk
  Question: What happens when internet goes down at the facility?
  Resolution: The Front Desk device caches today's active passes locally so that QR code verification continues to work during a connectivity outage. Check-in and check-out events are queued locally and synced to the server when connectivity returns. The dashboard displays an "OFFLINE MODE" banner to alert staff that new approvals or revocations will not be reflected until the connection is restored. This is a lightweight fallback, not a full offline mode — staff workflows beyond the Front Desk (e.g., creating authorizations, running reports) require connectivity. See Section 3.4.6.

  Decision 6: No Photo — Name and Inmate Number for Identity Verification
  Question: Should resident photos be required for identity verification at the Front Desk?
  Resolution: Photos are not required. Identity verification at the Front Desk uses the resident's name and inmate number, which are displayed on the pass and the verification screen after QR scan. This eliminates the need for photo upload infrastructure, image storage, and file management in v1. See Sections 3.1.1, 3.3.2, and 3.4.3.

  Decision 7: In-App Notifications Only — No Email or SMS
  Question: Should the system send email or SMS notifications to staff or residents?
  Resolution: All notifications are in-app only for v1. Staff receive real-time in-app notifications for approvals, denials, self-approval alerts, overdue/AWOL events, and expiring authorizations. No email service or SMS provider is needed. This eliminates Twilio, transactional email infrastructure, and associated costs. Email and SMS notification channels can be added in a future release. See Sections 3.2.4 and 3.2.5.

  Decision 8: No Resident Portal for v1
  Question: Should residents have a login-based portal to view their passes and schedules?
  Resolution: No resident portal or resident login is built for v1. Residents access their passes via a unique, time-limited secure link that requires no account creation. A resident-facing portal with PIN-based authentication is deferred to a future scaling phase. See Section 2.2.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


10. GLOSSARY

  Resident — An individual in a supervised re-entry program residing at the facility.

  Pass — A digitally signed authorization for a resident to leave and return to the facility.

  HMAC — Hash-based Message Authentication Code. A cryptographic mechanism for verifying data integrity and authenticity.

  QR Code — Quick Response code. A 2D barcode scannable by phone cameras.

  AWOL — Absent Without Leave. A resident who has not returned and exceeded the AWOL threshold.

  Authorization — An approved employment arrangement that enables pass generation.

  Check-out — The act of a resident leaving the facility through the Front Desk.

  Check-in — The act of a resident returning to the facility through the Front Desk.

  Overdue — A resident who has not returned by their scheduled return time.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

END OF DOCUMENT
