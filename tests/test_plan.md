# 🧪 InternHire Testing Strategy

## 📂 Directory Structure
We separate tests by **type** to ensure fast feedback loops.

- **`tests/unit/`**: Pure business logic. No Database. Fast (<1s).
  - *Run command:* `npm run test:unit` (to be configured)
- **`tests/integration/`**: Database interactions. Real Prisma. Slower.
  - *Run command:* `npm run test:int` (to be configured)

## 📝 Roadmap

### Phase 1: Core Business Logic (Unit Tests)
- [x] **Subscription Service** (`tests/unit/core/subscription/subscriptionService.test.ts`)
  - [x] Pricing Resolution
  - [x] Pending Subscription Creation
  - [x] Activation & Referral Locking
- [ ] **Referral Service**
  - [ ] Code generation uniqueness
  - [ ] Circular referral prevention
- [ ] **Wallet Service**
  - [ ] Reward calculation logic

### Phase 2: Data Access Layer (Integration Tests)
- [x] **Subscription Repository** (`tests/integration/core/subscription/subscriptionRepository.test.ts`)
  - [x] Create & Activate
  - [x] Expiry filtering
- [ ] **Referral Repository**
  - [ ] Unique constraint enforcement
  - [ ] Chain traversal queries
- [ ] **Wallet Repository**
  - [ ] Transaction atomicity
  - [ ] Balance aggregation

### Phase 3: Critical Flows (E2E / Functional)
- [ ] **Payment Flow** (Mocked Razorpay)
- [ ] **Signup Flow**

## 🧹 Best Practices
1. **Isolation**: Each test must clean up its own data (use `beforeEach` or unique IDs).
2. **Factories**: Use helper functions like `createTestUser()` instead of raw Prisma calls.
3. **AAA Pattern**: Arrange, Act, Assert.
```

