# Replit.md

## Overview

This is a full-stack AI Search Assistant web application built with Node.js/Express backend and React frontend. The application allows users to submit search queries that are processed through the OpenRouter API (using DeepSeek models), returning structured responses with clean direct answers and expandable "People Also Ask" questions with their answers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for the user interface
- **Vite** as the build tool and development server
- **Wouter** for client-side routing
- **TanStack Query** for server state management and API calls
- **Tailwind CSS** with shadcn/ui components for styling
- **Radix UI** primitives for accessible component foundation

### Backend Architecture
- **Express.js** server with TypeScript
- **RESTful API** design with a single `/api/search` endpoint
- **Proxy pattern** to securely communicate with external Deepseek AI API
- **Environment-based configuration** for API keys and database connections
- **Vite middleware integration** for development hot reloading

### Data Storage Solutions
- **Drizzle ORM** configured for PostgreSQL (though currently using in-memory storage)
- **Neon Database** serverless PostgreSQL integration ready
- **In-memory storage class** for development/testing
- **Schema definitions** shared between client and server

## Key Components

### Frontend Components
- **Search Interface**: Main search form with input field and submit functionality
- **Results Display**: Shows AI-generated answers and "People also ask" suggestions
- **UI Components**: Comprehensive shadcn/ui component library
- **Error Handling**: Toast notifications and error states
- **Loading States**: Visual feedback during API calls

### Backend Components
- **Search Endpoint**: Validates requests, proxies to Deepseek API, returns structured responses
- **Storage Layer**: Abstracted storage interface with in-memory implementation
- **Route Handler**: Express middleware for API routing and error handling
- **Vite Integration**: Development server setup with hot module replacement

### Shared Components
- **Schema Validation**: Zod schemas for request/response validation
- **Type Safety**: TypeScript interfaces shared between frontend and backend
- **API Contracts**: Consistent data structures for client-server communication

## Data Flow

1. **User Input**: User enters search query in the frontend form
2. **Client Validation**: Query is validated using Zod schema
3. **API Request**: Frontend sends POST request to `/api/search` endpoint
4. **Server Processing**: Backend validates request and constructs AI prompt
5. **External API Call**: Server proxies request to Deepseek AI API
6. **Response Processing**: AI response is parsed and structured
7. **Client Update**: Frontend receives structured response and updates UI
8. **Error Handling**: Any errors are caught and displayed to user via toast notifications

## External Dependencies

### AI Integration
- **Deepseek AI API**: External service for generating search responses
- **API Key Management**: Secure storage via environment variables
- **Structured Prompting**: Custom prompts to ensure consistent JSON responses

### UI Framework Dependencies
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Type-safe variant API for components

### Development Tools
- **Replit Integration**: Cartographer plugin for development environment
- **TypeScript**: Full type safety across the application
- **ESBuild**: Fast bundling for production builds

## Deployment Strategy

### Build Process
- **Frontend Build**: Vite builds React app to `dist/public`
- **Backend Build**: ESBuild bundles Express server to `dist/index.js`
- **Type Checking**: TypeScript compilation verification
- **Asset Optimization**: Vite handles CSS processing and asset bundling

### Environment Configuration
- **Development**: Uses Vite dev server with Express API proxy
- **Production**: Serves static files from Express with API routes
- **Database**: Configured for PostgreSQL with Drizzle migrations
- **Secrets Management**: Environment variables for API keys and database URLs

### Runtime Requirements
- **Node.js**: ES modules support required
- **Database**: PostgreSQL instance (Neon serverless recommended)
- **Environment Variables**: `DEEPSEEK_API_KEY` and `DATABASE_URL`
- **Port Configuration**: Express server with configurable port binding

The application follows a modern full-stack pattern with clear separation of concerns, type safety throughout, and a focus on user experience with proper loading states and error handling.