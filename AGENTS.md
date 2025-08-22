# Agentic Coding Guidelines

This document outlines the conventions and commands for agents operating within this repository.

## Build, Lint, and Test Commands
- **Build:** `bun run build`
- **Lint:** `bun run lint`
- **Run Single Test:** Not explicitly defined. Common patterns include `npm test -- <filename>` or `npx jest <filename>` if Jest is configured.

## Code Style Guidelines
- **Imports:** Use standard ES module imports. Utilize path aliases (e.g., `@/lib/utils`) for cleaner imports.
- **Formatting:** Consistent 2-space indentation. Tailwind CSS is the primary styling utility.
- **Types:** TypeScript is enforced. Use `class-variance-authority` for defining component variants.
- **Naming:** PascalCase for React components, camelCase for functions and variables.
- **Error Handling:** Implement robust error handling, especially for API calls and user input. Consider using a consistent error response format.
- **Cursor/Copilot Rules:** No specific rules found in `.cursor/rules/`, `.cursorrules`, or `.github/copilot-instructions.md`.