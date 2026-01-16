# Debit Card Management Application - Implementation Plan

## Overview
A standalone debit card management simulator for a banking ecosystem, built with the bsg-demo-platform look and feel. The application will handle card transactions and publish events to Azure Event Hub for system integration.

## Architecture

### Technology Stack
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | React 18 + TypeScript + Vite | Matches bsg-demo-platform |
| Styling | Tailwind CSS | Matches bsg-demo-platform design system |
| Backend | FastAPI (Python) | Matches bsg-demo-platform patterns |
| Database | In-memory (simulated) | Demo purposes, easily extendable |
| Events | Azure Event Hub (Kafka protocol) | User requirement |

### Color Scheme (from bsg-demo-platform)
- Primary Blue: `#283054`
- Light Blue: `#0066CC`
- Accent Cyan: `#00A3E0`
- Background Light: `#F8FAFC`
- Background Dark: `#0f172a`

---

## Application Features

### 1. PIN Authentication
- 4-digit PIN entry with masked input
- 3 attempts before card lockout
- Session management after successful auth

### 2. Account Management
- Support for multiple named accounts (Checking, Savings, Custom)
- Account selection for transactions
- Real-time balance display

### 3. Transaction Functions
| Function | Description | Event Type |
|----------|-------------|------------|
| Check Balance | View account balance | `BALANCE_INQUIRY` |
| Withdraw | Withdraw cash from account | `WITHDRAWAL` |
| Deposit Cash | Deposit cash to account | `CASH_DEPOSIT` |
| Deposit Check | Deposit check to account | `CHECK_DEPOSIT` |
| Transfer | Transfer between accounts | `TRANSFER` |

---

## Event Publishing

### Azure Event Hub Configuration
- **Namespace:** `aiprojectseventhubns.servicebus.windows.net`
- **Topic:** `debitcards`
- **Connection Key:** Set via `EVENT_HUB_CONNECTION_STRING` environment variable
- **Protocol:** Kafka-compatible

### Event Schema
```json
{
  "eventId": "uuid",
  "eventType": "WITHDRAWAL | CASH_DEPOSIT | CHECK_DEPOSIT | TRANSFER | BALANCE_INQUIRY",
  "timestamp": "ISO8601",
  "cardNumber": "masked-card-number",
  "accountId": "account-identifier",
  "accountName": "account-name",
  "amount": 0.00,
  "currency": "USD",
  "balanceBefore": 0.00,
  "balanceAfter": 0.00,
  "status": "SUCCESS | FAILED | PENDING",
  "metadata": {
    "sourceAccount": "for-transfers",
    "destinationAccount": "for-transfers",
    "checkNumber": "for-check-deposits"
  }
}
```

---

## Project Structure

```
DallasAiProjects/
├── debitcards/
│   ├── frontend/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── PinEntry.tsx
│   │   │   │   ├── AccountSelector.tsx
│   │   │   │   ├── BalanceDisplay.tsx
│   │   │   │   ├── WithdrawForm.tsx
│   │   │   │   ├── DepositCashForm.tsx
│   │   │   │   ├── DepositCheckForm.tsx
│   │   │   │   ├── TransferForm.tsx
│   │   │   │   ├── TransactionHistory.tsx
│   │   │   │   └── TransactionReceipt.tsx
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.tsx
│   │   │   │   └── DashboardPage.tsx
│   │   │   ├── services/
│   │   │   │   └── api.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   ├── App.tsx
│   │   │   ├── main.tsx
│   │   │   └── index.css
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── vite.config.ts
│   │   └── tsconfig.json
│   │
│   ├── backend/
│   │   ├── app/
│   │   │   ├── main.py
│   │   │   ├── api/
│   │   │   │   ├── auth.py
│   │   │   │   ├── accounts.py
│   │   │   │   ├── transactions.py
│   │   │   │   └── health.py
│   │   │   ├── models/
│   │   │   │   ├── account.py
│   │   │   │   ├── transaction.py
│   │   │   │   └── card.py
│   │   │   ├── services/
│   │   │   │   ├── card_service.py
│   │   │   │   ├── account_service.py
│   │   │   │   └── event_publisher.py
│   │   │   └── core/
│   │   │       ├── config.py
│   │   │       └── event_hub.py
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   └── README.md
```

---

## Implementation Steps

### Phase 1: Project Setup
1. Create project directory structure in DallasAiProjects/debitcards
2. Initialize frontend with Vite + React + TypeScript
3. Configure Tailwind CSS with bsg-demo-platform theme
4. Initialize backend with FastAPI
5. Set up Azure Event Hub connection

### Phase 2: Backend Development
1. Create Pydantic models for Card, Account, Transaction
2. Implement in-memory data store with sample accounts
3. Create PIN authentication endpoint
4. Create transaction endpoints (withdraw, deposit, transfer, balance)
5. Implement Event Hub publisher service using `azure-eventhub` SDK
6. Add health check endpoint

### Phase 3: Frontend Development
1. Create base layout components (Header, Sidebar)
2. Build PIN entry screen with keypad UI
3. Create dashboard with account selector
4. Build transaction forms:
   - Balance inquiry view
   - Withdraw form with amount input
   - Cash deposit form
   - Check deposit form with check number
   - Transfer form with account selection
5. Add transaction history display
6. Implement transaction receipt/confirmation modal

### Phase 4: Event Integration
1. Wire up all transactions to publish events
2. Test event delivery to Azure Event Hub
3. Add event status feedback in UI

### Phase 5: Verification & Testing
1. Test PIN authentication flow
2. Test each transaction type
3. Verify events are published to Event Hub
4. Test error handling (insufficient funds, invalid PIN)

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/pin` | Authenticate with PIN |
| GET | `/api/v1/accounts` | Get all accounts for card |
| GET | `/api/v1/accounts/{id}/balance` | Get account balance |
| POST | `/api/v1/transactions/withdraw` | Withdraw funds |
| POST | `/api/v1/transactions/deposit/cash` | Deposit cash |
| POST | `/api/v1/transactions/deposit/check` | Deposit check |
| POST | `/api/v1/transactions/transfer` | Transfer between accounts |
| GET | `/api/v1/transactions/history` | Get transaction history |
| GET | `/api/v1/health` | Health check |

---

## Sample Data (Pre-loaded)

### Demo Card
- Card Number: `**** **** **** 4242`
- PIN: `1234`

### Demo Accounts
| Account Name | Account Number | Initial Balance |
|--------------|----------------|-----------------|
| Checking | 1001 | $5,000.00 |
| Savings | 1002 | $10,000.00 |
| Investment | 1003 | $25,000.00 |

---

## Dependencies

### Frontend (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.2",
    "lucide-react": "^0.303.0",
    "clsx": "^2.1.0"
  },
  "devDependencies": {
    "vite": "^5.0.8",
    "typescript": "^5.3.3",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32"
  }
}
```

### Backend (requirements.txt)
```
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.3
pydantic-settings==2.1.0
azure-eventhub==5.11.5
python-jose==3.3.0
```

---

## Verification

### Manual Testing
1. Start backend: `cd backend && uvicorn app.main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser to `http://localhost:5173`
4. Enter PIN `1234` to authenticate
5. Perform each transaction type
6. Verify events in Azure Event Hub (use Azure Portal or Event Hub explorer)

### Event Verification
- Use Azure Portal > Event Hubs > debitcards > Process Data
- Or use Azure Event Hub Explorer tool to monitor incoming events

---

## Files to Create

### Critical Files
1. `backend/app/main.py` - FastAPI application entry
2. `backend/app/core/event_hub.py` - Event Hub publisher
3. `backend/app/services/event_publisher.py` - Event formatting and publishing
4. `backend/app/api/transactions.py` - Transaction endpoints
5. `frontend/src/App.tsx` - Main React application
6. `frontend/src/components/PinEntry.tsx` - PIN authentication UI
7. `frontend/src/pages/DashboardPage.tsx` - Main transaction dashboard
8. `frontend/tailwind.config.js` - Theme configuration
