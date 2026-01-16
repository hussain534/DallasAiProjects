# LMS API Authentication Plan

## Overview
Implement proper API authentication flow using the `/api/v1/login` endpoint with API key authentication and Bearer token management.

## API Details

### Login Endpoint
```
POST https://lmsdemo1.temenos.com/LendingAPI/api/v1/login
```

### Request Payload
```json
{
  "ApiKey": "xKHCjZOXMACk1xGmTPmYD2y3ov3BANyGI/thJB0YOCDntzw9LVsfx3IjRWJqwoPZ0pPhATz8YtyR6qn+aLjomve5GU7BktkOBhf1cH88+KS78/ujIPmsztVVQ0l7xdQubgmj3I+9T40YUFZjSLgcP4hUM0dRxPJALHRYlbKtptY"
}
```

### Response Payload
```json
{
  "Token": "eyJhbGciOiJodHRwOi8vd3d3LnczLm9yZy8yMDAxLzA0L3htbGRzaWctbW9yZSNobWFjLXNoYTI1NiIsInR5cCI6IkpXVCJ9...",
  "Result": true,
  "Messages": [],
  "ExceptionId": 0
}
```

### Token Details
- **Type**: Bearer Token
- **Expiration**: 15 minutes
- **Usage**: Authorization header for all API calls

## Implementation Tasks

### 1. Create Token Management Service
**File**: `src/api/services/tokenService.ts`

Create a dedicated service to manage API tokens:
- Store token and timestamp in localStorage
- Check token validity before use
- Auto-refresh token when expired
- Provide method to get valid token

```typescript
interface TokenData {
  token: string;
  timestamp: number;  // Unix timestamp when token was obtained
  expiresIn: number;  // Expiration time in seconds (900 = 15 min)
}

const TOKEN_EXPIRY_SECONDS = 900; // 15 minutes
const TOKEN_BUFFER_SECONDS = 60;  // Refresh 1 minute before expiry
```

### 2. Update API Client
**File**: `src/api/client.ts`

Modify the axios interceptor to:
- Check token validity before each request
- Auto-fetch new token if expired or about to expire
- Add Bearer token to Authorization header

### 3. Create API Key Configuration
**File**: `src/api/config.ts`

Store API configuration:
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://lmsdemo1.temenos.com/LendingAPI',
  API_KEY: 'xKHCjZOXMACk1xGmTPmYD2y3ov3BANyGI/thJB0YOCDntzw9LVsfx3IjRWJqwoPZ0pPhATz8YtyR6qn+aLjomve5GU7BktkOBhf1cH88+KS78/ujIPmsztVVQ0l7xdQubgmj3I+9T40YUFZjSLgcP4hUM0dRxPJALHRYlbKtptY',
  TOKEN_EXPIRY_SECONDS: 900,
  TOKEN_BUFFER_SECONDS: 60,
};
```

### 4. Update Login Types
**File**: `src/types/api.ts`

Add new types for API key login:
```typescript
export interface ApiKeyLoginRequest {
  ApiKey: string;
}

export interface ApiKeyLoginResponse {
  Token: string;
  Result: boolean;
  Messages: string[];
  ExceptionId: number;
}
```

### 5. Update Application Login Flow
**File**: `src/pages/LoginPage.tsx`

Modify login to:
1. First call `/api/v1/login` with ApiKey to get Bearer token
2. Store token with timestamp
3. Then call `/api/v1/application/search` with Bearer token

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/api/config.ts` | Create | API configuration and constants |
| `src/api/services/tokenService.ts` | Create | Token management service |
| `src/api/client.ts` | Modify | Update interceptor for auto token refresh |
| `src/types/api.ts` | Modify | Add ApiKey login types |
| `src/pages/LoginPage.tsx` | Modify | Use token service before API calls |
| `src/api/services/index.ts` | Modify | Export tokenService |

## Token Validation Logic

```typescript
function isTokenValid(): boolean {
  const tokenData = getStoredTokenData();
  if (!tokenData) return false;

  const now = Date.now() / 1000; // Current time in seconds
  const tokenAge = now - tokenData.timestamp;
  const bufferExpiry = TOKEN_EXPIRY_SECONDS - TOKEN_BUFFER_SECONDS;

  return tokenAge < bufferExpiry; // Valid if less than 14 minutes old
}

async function getValidToken(): Promise<string> {
  if (!isTokenValid()) {
    await refreshToken();
  }
  return getStoredToken();
}
```

## API Call Flow

```
┌─────────────────┐
│  API Call Made  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check Token     │
│ Validity        │
└────────┬────────┘
         │
    ┌────┴────┐
    │ Valid?  │
    └────┬────┘
         │
    Yes  │  No
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌──────────────┐
│ Use   │  │ Call /login  │
│ Token │  │ Get new token│
└───┬───┘  └──────┬───────┘
    │             │
    └──────┬──────┘
           │
           ▼
    ┌──────────────┐
    │ Make API     │
    │ Request with │
    │ Bearer Token │
    └──────────────┘
```

## localStorage Keys

| Key | Description |
|-----|-------------|
| `lms_api_token` | The Bearer token string |
| `lms_token_timestamp` | Unix timestamp when token was obtained |
| `user_ssn` | User's SSN for API calls |
| `user_applications` | Cached application search results |

## Implementation Checklist

- [x] Create API config file with API key and constants
- [x] Create token service with validation and refresh logic
- [x] Update API client interceptor for auto token management
- [x] Add ApiKey login types to api.ts
- [x] Update login page to use token service
- [ ] Test token refresh flow
- [ ] Verify Bearer token is sent with all API calls

## Security Notes

- API key is stored in code (consider environment variables for production)
- Token stored in localStorage (consider more secure storage for production)
- Token automatically refreshed before expiry to prevent failed requests
