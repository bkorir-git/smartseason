# SmartSeason Field Monitoring System

SmartSeason is a full-stack field monitoring platform built to track crop progress across multiple agricultural fields throughout a growing season. It was developed in direct response to the **SmartSeason Full Stack Developer Technical Assessment**, which asks for a simple, usable web application that supports **Admin (Coordinator)** and **Field Agent** roles, field assignment, crop-stage tracking, and core business logic around seasonal progress monitoring.

The project focuses on the operational reality of field coordination: multiple plots, multiple agents, ongoing updates, and the need for a clear picture of what is progressing well, what is stalled, and what has been completed.

---

## 1. Project Overview

SmartSeason solves a common agricultural operations problem: **field data is often fragmented, delayed, or difficult to act on in real time**. Coordinators need a consolidated view of every field, while field agents need a focused workflow for reporting progress only on the fields assigned to them.

This system provides:

- secure role-based access for **Admins** and **Field Agents**
- centralized field creation and assignment
- structured crop-stage updates throughout the season
- dashboard-level visibility into active, at-risk, and completed fields
- backend-driven field status classification based on recent update activity and harvest completion

In short, SmartSeason turns seasonal field monitoring into a structured, auditable workflow instead of a spreadsheet-and-messaging process.

---

## 2. Features

### Authentication & Role-Based Access

The technical assessment explicitly requires support for two user roles: **Admin (Coordinator)** and **Field Agent**. SmartSeason implements this through JWT-based authentication and route-level authorization.

#### Admin capabilities
- log in securely
- access the admin dashboard
- create fields
- assign fields to agents
- view all fields
- view the global updates feed
- see season-wide analytics and recent activity

#### Agent capabilities
- log in securely
- access the agent dashboard
- view only assigned fields
- submit updates to assigned fields
- track field progress and review update history

This ensures users only access what is relevant to their role, matching the assessment’s access-control requirement.

---

### Field Management

The assessment requires the ability to create and manage fields, assign them to field agents, and track minimum field attributes such as:

- **Name**
- **Crop type**
- **Planting date**
- **Current stage**

SmartSeason implements a structured field model with:

- `id`
- `name`
- `crop_type`
- `planting_date`
- `current_stage`
- `assigned_agent_id`
- `created_by`

Admins can create fields and assign them to a specific field agent. Agents can then view only the records relevant to them.

---

### Field Updates

Field updates are central to the system’s day-to-day usefulness.

Agents can:
- submit a new update for an assigned field
- change the field’s stage
- attach notes describing crop progress, conditions, or readiness

Implemented update flows include:

- `POST /api/fields/:id/updates`
- `GET /api/fields/:id/updates`
- `GET /api/updates/feed`

This creates a clean audit trail of field activity and gives Admins a live operational feed across the season.

---

### Dashboard & Insights

SmartSeason includes role-specific dashboards designed around the assessment’s requirement to build a usable interface and implement core business logic.

#### Admin dashboard
- total number of fields
- count of **Active**, **At Risk**, and **Completed** fields
- recent updates feed
- full field overview table

#### Agent dashboard
- assigned fields summary
- update submission form
- recent updates for assigned fields
- field-specific update history

The dashboard structure makes it easy to understand both the macro view of the season and the operational details of each field.

---

### Field Status Logic

A key business-rule requirement in the assessment is the ability to interpret field progress, not just store it.

SmartSeason computes a field’s high-level operational status as:

- **Active**
- **At Risk**
- **Completed**

This logic is implemented on the backend, not the frontend, so the rules remain centralized, consistent, and reusable across all clients.

More detail is provided in the dedicated **Field Status Logic** section below.

---

## 3. Tech Stack

### Frontend — React + Vite
- **React** was chosen for component-driven UI development and clean stateful page flows.
- **Vite** was used for fast development startup, simple configuration, and lean modern bundling.
- **Axios** handles API communication.
- **React Router** powers role-based navigation and protected client routes.

Why this works well:
- fast local development
- simple routing structure
- strong separation between layout, pages, and API logic
- easy deployment to static hosting platforms like Render

---

### Backend — Node.js + Express
- **Node.js** provides a natural full-stack JavaScript workflow.
- **Express** keeps the API layer lightweight and explicit.
- **JWT authentication** enables stateless session handling across frontend and backend.
- business rules such as field status calculation live in backend utilities/services

Why this works well:
- minimal overhead
- easy route organization
- straightforward middleware composition
- simple role-based protection with reusable guards

---

### Database — MySQL
- **MySQL** is used for relational integrity and clear modeling of users, fields, and field updates.
- Foreign keys enforce relationships between:
  - users
  - fields
  - field updates

Why MySQL fits this project:
- the domain is inherently relational
- field assignment and update ownership matter
- structured reporting is easier with normalized tables
- it maps well to dashboard aggregation and feed queries

---

### Hosting Platforms — Railway + Render
- **Railway** is a strong fit for deploying the Express API and attaching a managed MySQL database.
- **Render** is a clean option for deploying the Vite frontend as a static site with SPA routing support.

Why these choices are practical:
- quick setup for portfolio/demo deployments
- simple environment variable management
- easy separation between API hosting and frontend hosting
- predictable developer experience for recruiter review

---

## 4. System Architecture

SmartSeason follows a clear client-server architecture with separation of concerns across presentation, API, and persistence layers.

### Frontend ↔ Backend API Communication

The React frontend communicates with the Express backend over HTTP using Axios. All client requests are routed through a centralized API client configured with:

- a shared base URL
- automatic JWT attachment via request interceptor
- consistent error handling at the page level

This keeps API logic centralized and reduces duplication across pages.

### Backend Structure

The backend is organized into:

- **routes** for endpoint definitions
- **controllers** for request/response handling
- **services** for reusable business/data workflows
- **middleware** for authentication, authorization, and error handling
- **utils** for shared logic such as field status computation
- **database** scripts for schema creation and seeding

This structure keeps route handlers thin and makes the codebase easier to maintain and extend.

### Database Layer

The persistence layer is MySQL, accessed via `mysql2`. The schema models:

- users
- fields
- field updates

Relationships are explicit:
- a field is assigned to one agent
- a field is created by an admin
- updates belong to a field
- updates are authored by an agent

This supports both integrity and reporting use cases.

### Separation of Concerns

A key design goal was ensuring that:
- the **frontend** focuses on user interaction and rendering
- the **backend** owns rules, access control, and data shaping
- the **database** enforces relational structure and historical update storage

That separation is especially important for:
- role-based access
- status calculation consistency
- dashboard aggregation
- future scalability

---

## 5. Field Status Logic

The technical assessment is not just about storing field data; it expects meaningful business logic around crop progress. SmartSeason addresses this by computing a field-level status in the backend.

### Status Categories

#### Active
A field is considered **Active** when:
- its current stage is `Planted` or `Growing`
- and it has recent update activity
- and it is not flagged as stalled or overdue for attention

This represents a field that is progressing normally through the season.

#### At Risk
A field is considered **At Risk** when:
- there have been **no updates for X days**
- or growth appears **stalled**

In this implementation, **X = 7 days**.

A field becomes At Risk when:
- there are no recorded updates and the planting date is older than the risk threshold
- or the last update is older than the risk threshold
- or repeated updates suggest the field has remained in the same stage for too long without progression

This maps directly to the assessment’s requirement that fields should become **At Risk** when updates are missing for a period of time or growth is stalled.

#### Completed
A field is considered **Completed** when:
- its `current_stage` is `Harvested`

This provides a clear end-of-season state and supports completion reporting on the dashboard.

### Why this logic is implemented in the backend

The status logic lives in a backend utility rather than the frontend because:
- business rules should have a single source of truth
- all consumers should calculate status consistently
- dashboard metrics and field lists should reflect the same computed state
- it avoids duplication and drift across pages/components

---

## 6. API Overview

Below is a concise summary of the main API surface area.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/login` | Authenticate user and return JWT |
| GET | `/api/auth/me` | Return current authenticated user |

### Fields

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/fields` | Get fields visible to the current user |
| POST | `/api/fields` | Create a new field (Admin only) |
| GET | `/api/fields/:id/updates` | Get updates for a specific field |
| POST | `/api/fields/:id/updates` | Add an update to a specific field (Agent only) |

### Updates

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/updates/feed` | Global updates feed for Admin |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/admin` | Admin dashboard metrics and data |
| GET | `/api/dashboard/agent` | Agent dashboard metrics and assigned-field data |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/agents` | List available field agents (Admin only) |

---

## 7. Local Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-username/smartseason.git
cd smartseason
