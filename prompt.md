Prompt

“Design a software system for managing borrowing of kits by students in a library-style environment, built using JavaScript with a Node.js back-end and a front-end built with Vite, using PostgreSQL for the primary relational database and Redis for caching. The system will be part of a larger company ecosystem and must later integrate with payment systems, so design with extension/integration in mind. It must also integrate with a Student Information System (SIS) for account data and support notifications via email and SMS.

The system must support the following functional capabilities:

Student account lifecycle management: registration, deletion, deactivation, freezing,-flagging (“flagging” = marking misconduct) of student accounts.

Kit catalogue and kit condition tracking: each kit entry (and its components) can be tracked; when borrowed the condition is logged, when returned the condition is logged; the system enforces or logs condition deterioration, missing parts, damage.

Borrowing/returning workflow: students borrow kits (subject to account status, kit availability, configured time span/loan period). At borrow time: log student, kit id(s), borrow date, due date, initial condition. At return time: log actual return date/time, condition at return, compare to initial, calculate overdue or damage. Change kit status accordingly (available, needs repair, lost, etc).

Account status enforcement: if student is flagged, frozen, deactivated or has overdue/damaged items, the system should inhibit further borrowing according to rules. Admin should be able to review and unfreeze/unflag.

Configurable business rules: the admin must be able to set the loan period (time span), maximum number of kits per student, condition categories, penalty rules (damage/missing parts), retention policies (logs retention period).

Logging/tracking: comprehensive logs must be kept for each student’s usage of kits (borrow history, returns, condition issues, statuses), as well as for each kit (when borrowed, by whom, how many times, damage history). The system must retain logs for a maximum of 2 years, after which archival or deletion occurs.

Integration and extension: the system must integrate with the Student Information System (to obtain/verify student data), and must support email and SMS notifications (for due‐date reminders, account status change, penalties, etc). In future it will integrate with payment systems (for fines, deposits, etc) so the design should allow for that.

Non-functional requirements:

The system should perform responsively (e.g., UI actions, borrow/return logging should complete in < 2 s under typical load).

Use Redis as caching layer to improve performance for frequently accessed data (e.g., kit catalogue, student status, account flags).

Data integrity: transactional operations (borrow, return, status updates) must be atomic and consistent; no kit double‐borrowing, no lost updates.

Security: authentication & authorization for students and staff/admin; role separation (student vs librarian/admin). Audit logs for account freezes/flags and status changes. Secure storage of sensitive data (student info, notifications).

Maintainability & extensibility: the architecture should allow future integration modules (e.g., payments) to be plugged in; codebase should follow modular design patterns in Node.js.

Data retention & archival: logs older than 2 years must be archived or purged according to retention policy; kit condition history and account history older than 2 years may be archived.

Deployment/operational considerations: must support scaling (multiple concurrent students borrowing kits), caching (via Redis) to reduce load on PostgreSQL, monitoring/logging of system health.

Provide the following deliverables:

System overview (context, actors: student, librarian/admin, system).

Use cases or user stories for major workflows (student registration, borrowing, returning, account freeze/flag, admin config rules, integration for notifications).

Data model (key entities and relationships) consistent with PostgreSQL; include entity definitions for StudentAccount, Kit, BorrowTransaction, AccountStatusChange, LogEntry, etc.

API endpoints (for Node.js back-end) covering student account management, kit catalogue, borrow/return operations, admin operations.

Cache strategy (Redis) – what data is cached, invalidation rules, how freshness is maintained.

Integration design – how the system will connect to the Student Information System (SIS) for student data, and notification services (email/SMS); future payment integration points (e.g., fine payment).

Retention/archival design – how to enforce 2‐year maximum log retention, how older data is handled (archive or purge).

Non-functional requirements and constraints (performance, security, maintainability, scalability).

Deployment/architecture diagram (high-level) showing Node.js server, PostgreSQL, Redis, front-end (Vite), external systems (SIS, email/SMS service, payment gateway future).

The system should assume that it is one component in a larger company system; design accordingly (APIs, modular services, clear interfaces).

Generate a full specification document (SRS) based on the above, ready for handing to developers and architects.”