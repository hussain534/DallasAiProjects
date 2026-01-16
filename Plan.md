# LMS Applicant Portal - Implementation Plan

## Overview

This document outlines the implementation plan for the LMS Applicant Portal, a web application that allows applicants to view and manage their loan/credit applications, see pre-approval offers, and explore new product offerings.

## UI Components (Based on Design)

### 1. Header
- Organization branding (State Employees' Credit Union)
- Logo with state outline graphic
- Dark blue/navy background

### 2. Welcome Section
- Personalized greeting ("Hello {FirstName},")
- Subtitle describing portal capabilities

### 3. Pre-Approval Offer Banner
- "Apply Now" CTA button

### 4. Application Tabs
- "In Progress" tab (active state)
- "Completed" tab
- Tab filtering functionality

### 5. Application Cards
- Product icon (bank building for loans, credit card for cards)
- Product name
- Status indicator ("In Progress")
- "View Details" link

### 6. New Product Section
- Section header ("Interested in a new product")
- Description text
- "Explore our offerings" CTA button

### 7. Footer
- Copyright notice
- Equal Housing Opportunity link
- Legal link

---

## Technology Stack

### Frontend
- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS for utility-first styling
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: React Router v6
- **Build Tool**: Vite
- **HTTP Client**: Axios

### Project Structure
```
src/
├── api/
│   ├── client.ts              # Axios instance with auth interceptors
│   ├── endpoints.ts           # API endpoint constants
│   └── services/
│       ├── authService.ts     # Login/logout
│       ├── applicationService.ts
│       ├── applicantService.ts
│       └── productService.ts
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Tabs.tsx
│   │   └── Badge.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── portal/
│       ├── WelcomeSection.tsx
│       ├── PreApprovalBanner.tsx
│       ├── ApplicationTabs.tsx
│       ├── ApplicationCard.tsx
│       └── NewProductSection.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useApplications.ts
│   └── useProducts.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── PortalDashboard.tsx
│   ├── ApplicationDetails.tsx
│   └── ProductCatalog.tsx
├── types/
│   ├── api.ts
│   ├── application.ts
│   └── applicant.ts
├── utils/
│   ├── formatters.ts
│   └── constants.ts
├── App.tsx
└── main.tsx
```

---

## API Integration

### Base Configuration
- **Base URL**: `https://lmsdemo1.temenos.com/LendingAPI/`
- **API Version**: v1
- **Authentication**: Bearer token (from `/api/v1/login`)

### Key Endpoints

| Feature | Method | Endpoint | Purpose |
|---------|--------|----------|---------|
| Login | POST | `/api/v1/login` | Authenticate user, receive token |
| Verify Applicant | POST | `/api/v1/verifyapplicant` | Verify applicant identity |
| Get Applications | POST | `/api/v1/application/search` | Search/filter applications |
| Get Application | GET | `/api/v1/application/{id}` | Get application details |
| Get Applicants | GET | `/api/v1/application/{id}/applicants` | Get applicants on application |
| Get Applicant | GET | `/api/v1/application/{id}/applicants/{applicantId}` | Get specific applicant |
| Get Products | GET | `/api/v1/Products/products` | Get available products |
| Get Prescreen Offers | GET | `/api/v1/ExperianPrescreen/{TIN}/GetPrescreenOffers` | Get pre-approval offers |
| Create Application | POST | `/api/v1/application` | Start new application |

### Data Models

#### Application
```typescript
interface Application {
  ApplicationIdentifier: string;
  ApplicationStatus: string;
  ApplicationDate: string;
  ProductName: string;
  ProductType: string;
  ApprovedAmount?: number;
  Applicants: Applicant[];
}
```

#### Applicant
```typescript
interface Applicant {
  ApplicantId: string;
  FirstName: string;
  LastName: string;
  Email: string;
  TIN: string;
  ApplicantType: string;
  Addresses: Address[];
  Phones: Phone[];
}
```

#### Pre-Approval Offer
```typescript
interface PreApprovalOffer {
  ProductName: string;
  ProductType: string;
  ApprovedAmount: number;
  ExpirationDate: string;
}
```

---

## Implementation Phases

### Phase 1: Project Setup & Authentication
**Tasks:**
1. Initialize React project with Vite and TypeScript
2. Configure Tailwind CSS
3. Set up project folder structure
4. Create Axios client with interceptors for auth
5. Implement login page and authentication flow
6. Set up React Query provider
7. Create auth context and useAuth hook
8. Implement token storage and refresh logic

**API Endpoints Used:**
- `POST /api/v1/login`
- `POST /api/v1/verifyapplicant`

### Phase 2: Layout & Core Components
**Tasks:**
1. Create Header component with branding
2. Create Footer component with links
3. Build reusable UI components:
   - Button (primary, secondary, outline variants)
   - Card component
   - Tabs component
   - Badge/Status indicator
4. Set up main layout wrapper
5. Configure React Router with protected routes

### Phase 3: Portal Dashboard
**Tasks:**
1. Create WelcomeSection component
   - Fetch applicant name from API
   - Display personalized greeting
2. Create PreApprovalBanner component
   - Fetch pre-approval offers
   - Display offer details with gradient styling
   - "Apply Now" button navigates to application flow
3. Create ApplicationTabs component
   - "In Progress" and "Completed" tabs
   - Tab state management
4. Create ApplicationCard component
   - Product icon based on type
   - Product name and status
   - "View Details" link
5. Create NewProductSection component
   - Static content with CTA button

**API Endpoints Used:**
- `POST /api/v1/application/search`
- `GET /api/v1/ExperianPrescreen/{TIN}/GetPrescreenOffers`
- `GET /api/v1/application/{id}/applicants/{applicantId}`

### Phase 4: Application Details Page
**Tasks:**
1. Create ApplicationDetails page
2. Display full application information:
   - Application status and timeline
   - Applicant information
   - Product details
   - Required documents
   - Disclosures
3. Add action buttons based on application status
4. Display credit report summary (if available)

**API Endpoints Used:**
- `GET /api/v1/application/{id}`
- `GET /api/v1/application/{id}/applicants`
- `GET /api/v1/application/{id}/applicants/{id}/creditreports`
- `GET /api/v1/application/{id}/accountproducts`

### Phase 5: Product Catalog
**Tasks:**
1. Create ProductCatalog page
2. Fetch and display available products
3. Product cards with images and details
4. "Apply" button to start new application
5. Product filtering/search functionality

**API Endpoints Used:**
- `GET /api/v1/Products/products`
- `GET /api/v1/SubProducts`
- `GET /api/v1/Products/LargeImage`
- `POST /api/v1/application` (to start application)

### Phase 6: Polish & Testing
**Tasks:**
1. Add loading states and skeletons
2. Implement error handling and error boundaries
3. Add empty state displays
4. Responsive design adjustments
5. Accessibility improvements (ARIA labels, keyboard navigation)
6. Unit tests for components
7. Integration tests for API calls
8. End-to-end testing

---

## UI/UX Specifications

### Color Palette
| Color | Hex | Usage |
|-------|-----|-------|
| Primary Blue | `#1e3a5f` | Header, primary buttons |
| Gradient Start | `#4a1942` | Pre-approval banner |
| Gradient End | `#7b2d5b` | Pre-approval banner |
| Success Green | `#2d5a3d` | "Explore offerings" button |
| Text Primary | `#333333` | Main text |
| Text Secondary | `#666666` | Subtitle text |
| Background | `#f5f5f5` | Page background |
| Card Background | `#ffffff` | Card backgrounds |
| Border | `#e0e0e0` | Card borders |

### Typography
- **Headings**: Sans-serif (Inter or similar)
- **Welcome Title**: 24-28px, normal weight
- **Card Titles**: 16-18px, semi-bold
- **Body Text**: 14px, normal weight
- **Status Labels**: 12px, medium weight

### Component Specifications

#### Pre-Approval Banner
- Border radius: 8px
- Padding: 24px
- Gradient: linear-gradient(135deg, #4a1942, #7b2d5b)
- "Apply Now" button: White background, dark text

#### Application Cards
- Border radius: 8px
- Border: 1px solid #e0e0e0
- Padding: 16px
- Shadow: subtle box-shadow on hover
- Icon size: 40x40px

#### Tabs
- Active tab: Filled background (#1e3a5f), white text
- Inactive tab: Transparent background, dark text
- Border radius: 20px (pill shape)

---

## Security Considerations

1. **Token Storage**: Store JWT in httpOnly cookies or secure storage
2. **HTTPS**: All API calls over HTTPS
3. **Token Refresh**: Implement automatic token refresh before expiration
4. **Input Validation**: Validate all user inputs client-side and server-side
5. **CORS**: Ensure proper CORS configuration
6. **XSS Prevention**: Sanitize any rendered user content
7. **Session Timeout**: Implement automatic logout on inactivity

---

## File Deliverables

After implementation, the project will include:

```
lms-applicant-portal/
├── public/
│   └── assets/
│       └── images/
├── src/
│   ├── api/
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── types/
│   ├── utils/
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.8.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "tailwindcss": "^3.3.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

---

## Next Steps

1. Review and approve this plan
2. Set up the React project with the specified stack
3. Begin Phase 1 implementation (Project Setup & Authentication)
4. Iteratively build and test each phase
5. Deploy to staging environment for review
