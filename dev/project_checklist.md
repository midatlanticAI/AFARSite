# Project Checklist

## Overall Project Notes
- **Priorities**: Start with Contacts (mostly done) and Jobs (core feature), then Opportunities and Invoices. Reports and integrations (e.g., QuickBooks, Google Maps) can come later.
- **Best Practices**: All implementations will follow your rules (e.g., clear modular code, error handling, async patterns, security for sensitive data, PEP 8 style).
- **Tech Stack**: Backend (FastAPI/MongoDB for CRUD), Frontend (React/MUI for UI/forms/lists).
- **Next Steps**: We can tackle one section at a time. Let me know where to start (e.g., "Implement Job Create/Edit")—I'll propose code changes with explanations first.

## 1. Contact Page (Create/Edit View)
[ ] Auto-assign Customer number on create  
[ ] Display full name as "Last Name, First Name" (computed if not provided)  
[ ] First name field  
[ ] Last name field  
[ ] Phone numbers (up to 3):  
  - Cell number  
  - Checkbox for "Can receive texts"  
  - Two additional numbers (if available)  
[ ] Email addresses (up to 3): Send messages to all when applicable  
[ ] Service address (with Google Maps for pinpointing location and auto-population via dropdown with address prediction):  
  - Address #1  
  - Address #2  
  - City  
  - State  
  - Zip Code  
  - Country  
  - Latitude & Longitude (auto-filled from Maps)  
[ ] Billing address (same fields as service address)  
[ ] Source field (e.g., dropdown: "How did contact hear of us?")  
[ ] Special Instructions field (textarea)  
[ ] Tax checkbox ("Will this contact be taxed?")  
[ ] Distinguish between person and company contact (toggle/switch)  
[ ] Service location button (for tenant/landlord, property management, etc.): Close-up/street view, auto-population for address fields  
[ ] Add custom tags (chip input with add/remove)  
[ ] Merge contact feature (select another contact to merge into, reassign jobs/invoices)  
[ ] Mark Inactive button  
[ ] Delete contact button (with confirmation dialog to prevent accidents)  

## 2. Contact Page Tabs
[ ] **Messages Tab**: Display and send messages to contact's email(s)  
[ ] **Overview Tab**: Display Source, Tax, Last updated to QuickBooks, Open Balance, Customer Center URL, Contact History  
[ ] **Locations & Additional Contacts Tab**: List/edit additional locations and contacts  
[ ] **Opportunities Tab**: List unscheduled/lost opportunities (won convert to Jobs)  
[ ] **Jobs Tab**: List all jobs (default tab)  
[ ] **Invoices Tab**: List all invoices  
[ ] **Payments Tab**: List all payments  
[ ] **Refunds Tab**: List all refunds  
[ ] **Notes Tab**: Display/add notes and attachments from jobs  
[ ] **Reminders Tab**: Set/display reminders for jobs/tasks  

## 3. Job Page
[ ] Display/auto-assign Job number  
[ ] Display name (linked to Contact)  
[ ] Display Opportunity won date  
[ ] Display address (linked to Google Maps)  
[ ] Display email (linked to client)  
[ ] Display phone (linked to dialer)  
[ ] Display appliance failure  
[ ] Job status (color-coded)  
[ ] Display Special Instructions from Contact  

### Job Page Tabs
[ ] **Messages Tab**: Display/send messages to email  
[ ] **Job Details Tab**: Schedule job, set reminder, add charges/payments, request payments (with auto-reminders), expenses, time tracking, notes (toggle visibility), attachments (toggle visibility), job history (archive after 1 year), generate invoices  

## 4. Invoice Page
[ ] Sync with QuickBooks  
[ ] Collect signature  
[ ] Mark paid/unpaid  
[ ] Preview (view/download/print/send)  
[ ] Send to email  
[ ] Save copy  
[ ] Display sent/opened dates  
[ ] Display charges, payments, notes/terms  

## 5. Contact List Page
[ ] List all contacts (linked) with name, address, phone (linked), email (linked)  
[ ] Search/filter/sort  

## 6. Reports Page
[ ] Implement key reports (e.g., sales, job stats) with filters/export  

## 7. QuickBooks Page
[ ] Batch sync invoices  

## 8. Schedule Page
[ ] View events (Today, Overdue, Upcoming, Completed) with filters  

## 9. Calendar Page
[ ] Color-coded jobs (daily/weekly/monthly views, drag-and-drop)  

## 10. Resources Page
[ ] Grid of techs with assigned jobs (daily/weekly, assign/reassign)  

## Backend Endpoints Status
- Contacts
  - [x] List `/api/v1/contacts/list`
  - [x] Get `/api/v1/contacts/{id}`
  - [x] Upsert `/api/v1/contacts/upsert`
  - [x] Merge `/api/v1/contacts/merge`
  - [x] Deactivate `/api/v1/contacts/deactivate`
  - [x] Delete `/api/v1/contacts/delete`
  - [x] Export `/api/v1/contacts/export`
  - [x] Import `/api/v1/contacts/import`
- Jobs
  - [x] List `/api/v1/jobs/list`
  - [x] Get `/api/v1/jobs/{id}`
  - [x] Create `/api/v1/jobs/create`
  - [x] Upsert `/api/v1/jobs/upsert`
  - [x] Delete `/api/v1/jobs/delete`
- Opportunities
  - [x] List `/api/v1/opportunities/list`
  - [x] Upsert `/api/v1/opportunities/upsert`
  - [x] Delete `/api/v1/opportunities/delete`
- Reminders
  - [x] List `/api/v1/reminders/list`
  - [x] Upsert `/api/v1/reminders/upsert`
  - [x] Delete `/api/v1/reminders/delete`
- Files
  - [x] Upload `/api/v1/files/upload`
- Voice / Chat / Repair
  - [x] Voice create job `/api/v1/voice/create_job_from_voice`
  - [x] Voice append note `/api/v1/voice/append_note`
  - [x] Voice schedule tech `/api/v1/voice/schedule_tech`
  - [x] Voice update status `/api/v1/voice/update_job_status`
  - [x] Diagnostic fee `/api/v1/voice/get_diagnostic_fee`
  - [x] Chat create job `/api/v1/chat/create_job_from_chat`
  - [x] Chat append note `/api/v1/chat/append_chat_note`
  - [x] Chat escalate `/api/v1/chat/escalate`
  - [x] Repair triage `/api/v1/repair/triage_suggest`
  - [x] Repair dispatch suggest `/api/v1/repair/dispatch_suggest`
  - [x] Repair parts forecast `/api/v1/repair/parts_forecast`

Note: Idempotency is optional; clients may pass `Idempotency-Key` header for mutating calls.

## Frontend Integration Tasks
- [ ] Replace DEMO data with live calls where possible; default DEMO only in dev.
- [x] Attach `Idempotency-Key` header automatically on mutating requests.
- [ ] Job Detail page: wire notes, status updates, scheduling, reminders, files.
- [ ] Contact Detail page: wire notes, messages, reminders, opportunities.
- [ ] Billing UI: invoices/payments/refunds lists (read-only first).
- [ ] Snackbar/toast error handling for API failures.

**Progress Notes** (Updated 2025-08-21):
- Optional idempotency enabled; no 400s without key.
- In-memory DB fallback upgraded to support CRUD used by services.
- Frontend attaches Idempotency-Key for mutating requests.