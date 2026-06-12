# CRITICAL RULES - MUST FOLLOW

## RESPONSES

- Keep responses concise and to the point - unless the user asks otherwise

## PLANNING MODE

- Always ask clarifying questions
- Never assume design, tech stack or features
- Use deep-dive sub-agents to assist with research
- Use deep-dive sub-agents to review the different aspects of your plan before presenting to the user

## CHANGE / EDIT MODE

- Never implement features yourself when possible - use sub-agents!
- Identify changes from the plan that can be implemented in parallel, and use sub-agents to implement the features efficiently
- When using sub-agents to implement features, act as a coordinator only
- Use the best model for the task - premium models for complex tasks (like coding) and mid-tier models for simpler tasks, like documentation
- After completing features, always run commands like lint, type-check, and next build

## Database schema 
- whenever you make changes to the database schema , ALWAYS run the drizzle generate and migrate commands
- NEVER run drizzle push 

## TESTING 
- Use any testing tools, libraries available for testing your changes 
- Never assume your changes simple work, always test!
- If the project doesnt have any testing tools, scripts, MCP tools , skills etc available for testing, ask user whether testing should be skipped 

## UI/Design System

- Must follow the UI design system defined in design.md when creating or reviewing components/pages
- Ensure visual consistency across the entire application
- Design System: @Design.md

