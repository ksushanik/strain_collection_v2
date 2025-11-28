# Audit Log System

The Audit Log system tracks user actions within the application, providing accountability and traceability.

## Overview

- **Backend**: Automatically intercepts `POST`, `PUT`, `PATCH`, `DELETE` requests and records them.
- **Frontend**: Provides a UI for viewing logs, accessible only to `ADMIN` and `MANAGER` roles.

## Data Model

The `AuditLog` model records:
- `userId`: Who performed the action.
- `action`: Type of action (`CREATE`, `UPDATE`, `DELETE`, `LOGIN`, etc.).
- `entity`: The resource affected (e.g., `Strain`, `Sample`).
- `entityId`: ID of the affected resource.
- `changes`: JSON object showing `before` and `after` states (for updates).
- `metadata`: Additional info (IP, User Agent).

## API Endpoints

### `GET /api/v1/audit-logs`

Retrieves a paginated list of audit logs.

**Query Parameters:**
- `userId`: Filter by user ID.
- `entity`: Filter by entity name (e.g., `Strain`).
- `startDate`: Filter by start date.
- `endDate`: Filter by end date.

**Permissions:**
- Requires `read` permission on `AuditLog` (Admin/Manager).

## Frontend UI

Located at `/audit`.
- **Table View**: Shows Date, User, Action, Entity, ID, and Details.
- **Filtering**: Allows filtering by User ID and Entity.
- **Access Control**: The link in the sidebar is only visible to authorized users. The page itself is protected by `AuthGuard` and backend permissions.
