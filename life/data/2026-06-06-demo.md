---
id: 1
date: 2026-06-06
title: How MCP works
tags: AI, Protocol, Dev Tools
summary: Model Context Protocol (MCP) is an open standard that lets AI models connect to external tools — like USB-C, but for AI.
---

## What is MCP?

**Model Context Protocol (MCP)** is an open protocol by Anthropic that lets AI models like Claude connect to external tools and data sources through a unified standard.

## How it works

MCP uses a **client-server** model:

- **MCP Host** (e.g. Claude Desktop, IDE) — where the AI runs
- **MCP Client** — lives inside the host, manages connections to servers
- **MCP Server** — a small program that exposes tools or resources (Gmail, GitHub, filesystem...)

## Data flow

```
User → Claude → MCP Client → MCP Server → Tool/API
                    ↑________________________↓
                         result returned
```

## Why it matters

Before MCP, every AI needed its own custom integration per tool. MCP standardizes this — one protocol, any tool. Any developer can build an MCP server, and any MCP-compatible AI can use it.

## Real example

Connect Claude to Gmail via MCP: Claude can read, search, and draft emails — without Anthropic needing to build a Gmail integration themselves.
