# Product Requirements Document: Daily Nutrient & Food Checklist App

**Version:** 1.0
**Date:** 2026-03-21
**Status:** Draft

---

## 1. Overview

### 1.1 Product Summary

The Daily Nutrient & Food Checklist is a lightweight personal habit-tracking application for a single user to consistently consume a curated set of health-supporting foods and supplements each day. The product is grounded in a specific, research-backed food protocol and provides a simple, frictionless daily check-off experience.

### 1.2 Problem Statement

Following a structured nutritional protocol means remembering and consistently tracking multiple daily food targets. Generic habit trackers do not support item-specific quantity guidance, frequency rules (e.g., "2x per week"), or categorized food groups in a way that maps naturally to a nutrition-focused workflow.

### 1.3 Goals

- Provide a clear, daily checklist of target foods and quantities.
- Support items with conditional frequency (e.g., sardines 2x/week on user-chosen days).
- Enable users to check off items as they consume them throughout the day.
- Track daily and weekly completion streaks to reinforce habit formation.
- Be accessible on a single personal device with minimal friction at point of use.

---

## 2. Target User

Single personal user following the defined nutritional protocol. No multi-user, account, or sharing features required.

---

## 3. Functional Requirements

### 3.1 Daily Checklist

The app must display the following checklist items each day, grouped by category:

#### Beverages & Teas
| Item | Target |
|---|---|
| Matcha | 2–3 cups, steeped 3–5 min at 175°F |
| Pomegranate Juice | 8 oz total (split morning/evening) |

#### Fruits
| Item | Target |
|---|---|
| Berries | 1 cup |
| Kiwi Fruit | 1 whole |

#### Vegetables & Greens
| Item | Target |
|---|---|
| Broccoli | 1 cup |
| Greens (Spinach, Kale, etc.) | 2–4 cups |
| Sauerkraut | ¼ cup |
| Tomato Paste | 3 Tbsp |

#### Proteins & Fats
| Item | Target |
|---|---|
| Raw Cacao | 1 oz (nibs, powder, etc.) |
| Sardines | 4 oz — appears only on user's 2 chosen days per week |
| Extra Virgin Olive Oil | 3 Tbsp |
| Yogurt or Kefir | 6 oz |

#### Spices / Heat
| Item | Target |
|---|---|
| Hot Pepper or Capsaicin Equivalent | 1 hot pepper or equivalent |

#### Supplements
| Item | Target |
|---|---|
| Omega Supplement | 1,000 mg |

### 3.2 Conditional Frequency Items

- Users must be able to designate 2 days per week for sardines (e.g., Monday & Thursday).
- On non-sardine days, the sardines item must be hidden or visually marked as "not today."
- The app must prompt the user to configure their sardine days during onboarding.

### 3.3 Check-off Behavior

- Each item has a checkbox that toggles between checked and unchecked — always reversible.
- Checked state persists for the current calendar day and resets at midnight local time.
- Checked items may be visually distinguished (e.g., strikethrough, muted color) but remain visible so overall progress is clear.

### 3.4 Daily Progress Indicator

- A progress bar or count (e.g., "9 / 13 completed") must be shown at the top of the checklist.
- The count must reflect only items applicable to the current day (excluding non-sardine days when applicable).

### 3.5 Streak Tracking

- Track consecutive calendar days on which all applicable items are checked before midnight.
- Display current streak and longest streak. Longest streak is never reduced.
- A missed day shows as a gap on the calendar strip; the current streak resets to zero but longest streak is preserved.
- The week starts on Monday.

### 3.6 Weekly Overview

- Display a 7-day calendar strip (Mon–Sun) showing complete, incomplete, and missed days distinctly.
- Show weekly sardine completion (e.g., "1 / 2 sardine days hit this week").
- Week resets on Monday.

### 3.7 Reminders / Notifications (Optional, Phase 2)

- Allow users to set optional time-based reminders for specific items or categories (e.g., "Matcha reminder at 8 AM and 12 PM," "Pomegranate evening reminder at 6 PM").
- Notifications must be opt-in.

---

## 4. Non-Functional Requirements

| Requirement | Detail |
|---|---|
| Platform | Android PWA (Add to Home Screen); no App Store, no cost |
| Performance | Checklist must load and be interactive within 1 second |
| Data persistence | localStorage (Web Storage API); no cloud sync or account required |
| Accessibility | Tap targets ≥ 44×44px; readable font sizes |
| Privacy | No data leaves the device |

---

## 5. User Flows

### 5.1 First-Time Onboarding

1. User opens app for the first time.
2. App displays a brief welcome screen explaining the checklist purpose.
3. App prompts user to select their 2 sardine days from a day-of-week picker.
4. User is taken directly to today's checklist.

### 5.2 Daily Use (Returning User)

1. User opens app.
2. Today's checklist is shown immediately with current check-off state.
3. User taps items as they consume them throughout the day.
4. Progress indicator updates in real time.
5. On full completion, a subtle success animation is shown and the streak counter increments.

### 5.3 Viewing History

1. User taps the weekly calendar strip or a "History" tab.
2. Past days show completion status; tapping a past day shows which items were checked.

---

## 6. Design Principles

- **Glanceability:** The full checklist must be visible without scrolling on a standard phone screen, or near-complete with minimal scrolling.
- **Minimal friction:** Opening the app goes directly to today's checklist — no login wall, no onboarding nag after setup.
- **Positive reinforcement:** Completion states and streaks are rewarding, not punitive for missed days.
- **Quantity guidance always visible:** Each item must display its target quantity alongside its name at all times, not hidden behind a tap.

---

## 7. Out of Scope (v1.0)

- Custom food item creation or removal.
- Calorie or macro tracking.
- Integration with wearables or third-party health apps.
- Social / sharing features.
- Recipe suggestions.
- Cloud sync or account system.

---

## 8. Success Metrics

Personal use — formal retention metrics are not applicable. The primary indicator of success is daily personal use and consistent protocol adherence, reflected by streak history visible in the app.

---

## 9. Decisions Log

| Decision | Choice | Rationale |
|---|---|---|
| Daily reset | Calendar day midnight | Simplest; aligns with sardine day-of-week logic |
| Accidental tap | Always reversible toggle | A checkbox that can't be unticked is a trap |
| Missed day behavior | Gap on calendar strip; current streak resets, longest streak preserved | Resetting longest streak is punitive and kills motivation |
| Week start | Monday | Aligns with standard fitness convention and Mon/Thu sardine example |
| Data export | Included in v1.0 | One button, JSON export; trivial to build, protects years of history |
| Sardine list | Fixed; not swappable | Personal protocol is fixed; scope creep otherwise |

---

## 10. Milestones

| Milestone | Deliverable |
|---|---|
| M1 | Core checklist with check-off, quantity labels, and daily reset |
| M2 | Sardine day configuration and conditional item display |
| M3 | Progress indicator and streak tracking |
| M4 | Weekly calendar overview |
| M5 | PWA manifest, service worker, and Add to Home Screen support |
| M6 | JSON data export |
| M7 | Optional notification system |
