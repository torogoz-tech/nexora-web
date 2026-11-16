# Product experience

The web application is the place where a person sees Nexora's technical context as a working system.

The source and tests cover experiences for authentication, projects, repositories, analysis profiles, code context, knowledge articles, documents, tasks, task relationships, approvals, workflows, branch protection, Git integrations, notifications, calendars, developer analysis, ratings, and MCP keys.

The interface should always make scope visible: project, repository, snapshot, task, document revision, or workflow version. A screen that displays an analysis result must not imply that the browser computed or authorized that result.

## Bilingual behavior

English and Spanish are supported as human-facing languages. Technical identifiers, API fields, profile IDs, policy statuses, and evidence anchors remain stable across languages so that a Spanish-speaking user and an English-speaking user can refer to the same object.

## Evidence-first presentation

When the API returns a finding, diagnostic, incomplete coverage, unresolved relationship, or unknown status, the UI should show the state and its context rather than flattening it into a positive or negative label.
