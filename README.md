# IDoManage AI Platform — Submission Documentation

Welcome to the official repository for **IDoManage**, a revolutionary, OIDC Google Workspace-aligned, hand-drawn and frosted-glass-styled learning management and productivity suite for students, scholars, and professionals. 

This repository contains the complete full-stack source code, build manifests, and deployment configuration for the IDoManage application.

---

## 🎯 Submission Links & Information

- **Deployed Application Link**: [https://idomanage-1049556592693.us-west1.run.app](https://idomanage-1049556592693.us-west1.run.app)
- **Google AI Studio Development Link**: [https://ais-dev-5g6xdhcrm7tq6kurkaaxoh-1074750798619.asia-southeast1.run.app](https://ais-dev-5g6xdhcrm7tq6kurkaaxoh-1074750798619.asia-southeast1.run.app)
- **Google AI Studio Shared Link**: [https://ais-pre-5g6xdhcrm7tq6kurkaaxoh-1074750798619.asia-southeast1.run.app](https://ais-pre-5g6xdhcrm7tq6kurkaaxoh-1074750798619.asia-southeast1.run.app)
- **GitHub Source Repository**: [https://github.com/HarishRajavarapu/IDoManage](https://github.com/HarishRajavarapu/IDoManage)
- **Primary Credentials Provided**:
  - **Gemini API Access**: `AIzaSyDcs1L48s6O5YFGOZBdFW704BcIi3lZgnw` (Configured server-side)
  - **Google Workspace API Scopes**: Gmail (Enabled), Google Calendar (Enabled), Google Drive & Docs (Enabled)

---

## 📝 Project Submission Document (Google Doc Copy-Paste Format)

Below is the structured project description prepared specifically for submission. It complies with all requirements, detailing the Problem Statement, Solution Overview, Core Features, Uniqueness, and Google Technologies utilized.

---

# PROJECT SUBMISSION: IDOMANAGE AI PLATFORM

## 1. Problem Statement Selected

### The Chaos of "Dumb" Task Lists & Fragmented Workspaces
Modern students, scholars, and researchers face a massive cognitive load. They manage complex project goals, dense academic syllabi, and incoming communication across separate silos (emails, calendar bookings, file drives, and scratchpads). 
Conventional task managers (such as Trello or Todoist) are **"dumb" passive databases**—they require manual data entry, offer no strategic pathing, and fail to provide immediate context-aware help. When timelines shift or deadlines approach, students experience decision paralysis, lose track of high-impact goals, and lack automated ways to recover their schedule or reduce workload stress.

### Key Pain Points Solved:
1. **Inbox-to-Task Friction**: Crucial assignments and directives from professors get buried in cluttered Gmail inboxes.
2. **Goal Decomposition Paralysis**: Breaking big project goals (like a master’s thesis or a term review) into sequential milestones with proper prerequisite dependencies is difficult and overwhelming.
3. **Dead-End Scheduling**: Static calendars do not reflect dynamic velocity, completion risk, or active timeline recovery.
4. **Sterile, Rigid UIs**: Traditional productivity apps look like corporate spreadsheet software, resulting in zero user engagement or fun for younger students and modern creators.

---

## 2. Solution Overview

**IDoManage** is an intelligent, full-stack, OIDC Google Workspace-aligned, hand-drawn/frosted-glass styled productivity and learning management platform. By merging official **Google Gen AI (Gemini 3.5 Flash)** with direct **Google Workspace integrations (Gmail, Calendar, Drive)**, IDoManage acts as a high-executive "AI Chief of Staff" that actively organizes, guides, predicts, and recovers project schedules.

Instead of a passive board, IDoManage is a **living timeline**. It imports real student emails, auto-deconstructs complex syllabi, estimates risk metrics on active deadlines, automatically optimizes workloads under stress (Recovery Mode), and answers natural language commands via an advanced multi-turn Floating Assistant. All of this is wrapped in a highly engaging, custom-themed interactive playground with custom presets (such as Playful Doodle, Frosted Glass, GitHub Dev, Cyberpunk, and tactile high-contrast modes) to make organization feel like a companion rather than a chore.

---

## 3. Core Features

IDoManage features an array of deeply integrated, server-proxied, production-ready modules:

| Core Feature | Technical Description & Utility |
| :--- | :--- |
| 🧠 **AI Task Decomposition** | Uses Gemini 3.5 Flash to decompose any complex project goal or exam topic into logically sequenced, prioritized milestones and tasks, auto-detecting prerequisites and calculating realistic durations. |
| ⚡ **Next Action Engine** | A dedicated algorithm that analyzes the exact dependency graph of your remaining roadmap. It isolates the *single* most crucial, immediate task you need to complete to break inertia, detailing a specific tactical instruction and rationale. |
| 📈 **Deadline Risk Prediction** | A machine-learning-inspired forecasting model. Analyzing remaining task hours, deadline timelines, and available daily focus limits, it outputs a percentage completion probability, a risk warning (LOW to CRITICAL), and tailored study advice. |
| 🛡️ **AI Timeline Recovery Mode** | An emergency optimization protocol. If a student is falling behind, the AI analyzes the task graph to postpone lower-priority deliverables, shorten estimated durations for the critical path, and summarize a streamlined stress-free plan. |
| 📅 **Daily AI Briefing** | An executive startup-grade morning agenda. It merges current task queues, actual real-time Google Calendar schedules, and looming deadlines into 3 immediate daily priorities, an hourly hourly block timetable, and a customized motivational tagline. |
| 📚 **Academic Study Planner** | An education-focused engine where scholars paste raw course syllabi or reading materials. The AI immediately parses topics, schedules a comprehensive day-by-day study routine, and measures exam readiness. |
| ✉️ **Gmail Task Harvester** | Pulls real recent emails from the connected Gmail inbox. The Gen AI parses through subject lines and body copy, instantly extracting deliverables, meeting follow-ups, and assignments with target dates and priorities. |
| 📂 **Tri-Factor Google Connector** | Pulls actual files from Google Drive & Docs to link as task attachments, displays live interactive Gmail message threads, and synchronizes active schedules with Google Calendar in real time. |
| 💬 **Floating AI Assistant** | A multi-agent conversational portal. It understands complex commands like *"read my today's emails, plan my tasks, and suggest some study insights."* It processes this on the backend, modifies database state, logs audit entries, and speaks to the user. |

---

## 4. Uniqueness & Innovation

IDoManage sets a new standard for interactive productivity through three pillars of innovation:

### 1. Active Schedule Orchestration (Living Workspace)
Most productivity tools are passive spreadsheets. IDoManage is active. It doesn't just show that you have 10 tasks left; it constantly recalculates whether you will finish them based on your daily work hours. If your risk is High, it advises you. If you click **Trigger Recovery**, it dynamically edits your roadmap—saving you hours of planning stress.

### 2. Conversational State Modulation
The floating AI companion is not just a chatbot. It is a **fully empowered system operator**. By sending a single message like *"plan my day based on my inbox"*, the backend parses the inbox, updates Firestore with new tasks, logs entries in the History Log, and updates the UI real-time. It bridges natural language with actual database state changes.

### 3. Emotionally Engaging Aesthetics
Instead of standard corporate layouts, IDoManage integrates custom aesthetic modes:
- **Playful Doodle (Standard)**: Hand-drawn outlines, organic notebook patterns, and micro-animations.
- **Frosted Glass**: Premium sleek translucent backdrops and high-depth gradients.
- **Tactile High-Contrast Themes**: Energetic yellow/charcoal and lime/greens for sharp, legible visibility.
- **GitHub / Cyberpunk**: Custom developer and console-styled modes.

---

## 5. Technologies Used

IDoManage utilizes a cutting-edge full-stack architecture built for responsiveness, safety, and scale:

- **Frontend Core**: React 18, Vite (Fast build and Hot Module replacement proxy).
- **Backend Core**: Node.js, Express (Fully server-proxied API keys to guarantee credentials are never exposed to the browser).
- **Styling & Motion**: Tailwind CSS (Fluid responsive layouts), Framer Motion (Physics-based entry animations and card slides), custom variable-driven Tailwind themes.
- **Data & Charts**: Recharts, Lucide React (unified, lightweight iconography).
- **Compilation & Bundling**: TypeScript, ESBuild (bundles backend into safe CommonJS formats), TSX.

---

## 6. Google Technologies Utilized

IDoManage is built from the ground up to showcase the power and synergy of Google's cloud and developer ecosystem:

1. **Google Gemini 3.5 Flash (via `@google/genai` SDK)**:
   - Powers all cognitive intelligence in the applet.
   - Chosen for its exceptionally fast response speeds, advanced JSON schema adherence, and multi-modal comprehension.
   - Prompts are secured server-side to prevent prompt injection and protect developer secrets.
2. **Google Firebase & Firestore**:
   - Acts as the central persistent real-time database.
   - Synchronizes user profiles, customized projects, milestones, task completions, and history trails.
   - Implements strict security rules to guarantee data isolate and user privacy.
3. **Google Cloud Run**:
   - Containers are automatically compiled and deployed on Google's global serverless infrastructure.
   - Provides instant scalability, low latency routing, and robust SSL certificate management.
4. **Google Identity & OAuth 2.0**:
   - Authenticates the user profile using secure OIDC (OpenID Connect) tokens.
   - Maintains scoped authorization for Google Workspace services.
5. **Google Workspace APIs**:
   - **Gmail API**: Interacts with the user's inbox to parse academic/work directives.
   - **Google Calendar API**: Updates study schedules and schedules milestones.
   - **Google Drive API**: Integrates and previews cloud materials.
