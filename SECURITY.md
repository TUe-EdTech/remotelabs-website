# Security Policy

## Reporting a vulnerability

Please report security vulnerabilities **privately**:

1. Preferred: use GitHub's private vulnerability reporting ("Report a
   vulnerability" on this repository's **Security** tab), or
2. Email: k.m.a.aarts@tue.nl

Please do not open public issues for security vulnerabilities. Include a
description, affected files/URLs, reproduction steps and, if possible, a
suggested fix.

## What to expect

- Acknowledgement of your report within **5 business days**.
- A severity assessment and, for confirmed issues, a fix or mitigation plan
  with a target timeline communicated in the report thread.
- Credit in the release notes if you wish (optional).

## Scope

This repository is a **static website** (HTML/CSS/JS, service worker, Apache
`.htaccess`): no server-side code, no database, no user accounts, no secrets
in the repository. The Remote Labs *platform* at <https://remotelabs.tue.nl>
is a separate system and out of scope here — please do not report
platform vulnerabilities against this repo.

The CI workflow holds `contents: write` only to auto-commit rebuilt `deploy/`
artifacts on `main`; it uses no other secrets.

## Supported versions

Only the latest commit on `main` (what is deployed at <https://remote-labs.eu>)
is supported with security fixes.
