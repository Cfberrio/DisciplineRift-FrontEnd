# 🎫 Coupon System Documentation

## Overview

The coupon system allows parents to apply discount codes during the registration review process. Server-side validation ensures pricing integrity and security.

## 📋 Supported Coupons

| Code     | Discount | Description        |
|----------|----------|--------------------|
| `FACULTY`| 15%      | Faculty discount   |
| `SIBLING`| 10%      | Sibling discount   |

## 🔧 Implementation Details

### Frontend (Review Registration - Step 5)

**Location**: `components/register-section.tsx`

**Components Added**:
- Coupon input field with "Add" button
- Applied coupon display with "Remove coupon" button
- Payment summary showing price breakdown
- Real-time price calculation

**State Management**:
```typescript
const [couponCode, setCouponCode] = useState("");
const [appliedCoupon, setAppliedCoupon] = useState<{
  code: string;
  discount: number;
  percentage: number;
} | null>(null);
const [couponError, setCouponError] = useState("");
```

**Key Functions**:
- `validateCoupon(code)` - Client-side validation
- `applyCoupon()` - Apply coupon with error handling
- `removeCoupon()` - Remove applied coupon
- `calculateFinalPrice()` - Calculate final price with discount

### Backend (Payment Processing)

**Location**: `app/api/create-checkout-session/route.ts`

**Server-side Validation**:
- Fetches team price from database (source of truth)
- Validates coupon code server-side
- Recalculates final amount with security checks
- Adds comprehensive metadata to Stripe session

**Flow**:
1. Get team price from `team` table using `teamid`
2. Validate coupon code (case-insensitive)
3. Calculate discount and final amount
4. Create Stripe session with correct price
5. Add metadata for tracking

## 💳 Stripe Integration

**Metadata Added**:
- `coupon_code`: Applied coupon code
- `discount_percentage`: Discount percentage
- `original_price`: Base team price
- `final_price`: Price after discount
- `discount_amount`: Discount amount in dollars

**Price Calculation**:
```typescript
// Server-side calculation
const basePrice = teamData.price; // From database
const discountAmount = Math.round(basePrice * (percentage / 100) * 100) / 100;
const finalAmount = Math.max(0, basePrice - discountAmount);
const stripeAmount = Math.round(finalAmount * 100); // Convert to cents
```

## 🎯 User Experience

### Coupon Application Flow

1. **Enter Code**: User types coupon in input field
2. **Validation**: Real-time validation with error feedback
3. **Applied State**: Shows applied coupon with percentage and remove option
4. **Price Update**: Payment summary updates to show breakdown
5. **Payment**: Stripe checkout uses final calculated price

### Error Messages

| Error | Message |
|-------|---------|
| Empty code | "Please enter a coupon code" |
| Invalid code | "Invalid coupon code" |
| Already applied | "Coupon already applied" |
| General error | "Something went wrong. Please try again" |

### UI Text (All in English)

| Element | Text |
|---------|------|
| Label | "Coupon code" |
| Placeholder | "Enter your coupon" |
| Add button | "Add" |
| Remove button | "Remove coupon" |
| Price label | "Price" |
| Discount label | "Discount" |
| Total label | "Total" |

## 🔒 Security Features

1. **Server-side Validation**: All coupon validation happens on the server
2. **Database Source of Truth**: Team prices fetched from database at payment time
3. **Input Sanitization**: Coupon codes are trimmed and normalized
4. **Amount Validation**: Final amounts are validated before Stripe processing
5. **Metadata Tracking**: Complete audit trail in Stripe metadata

## 🧪 Testing Scenarios

### Valid Coupons
- **FACULTY**: Should apply 15% discount
- **SIBLING**: Should apply 10% discount
- Case variations (faculty, Faculty, FACULTY) should all work

### Invalid Scenarios
- Invalid codes should show error message
- Empty input should show appropriate message
- Multiple coupon attempts should show "already applied" error

### Price Calculations
- Discounts should round to 2 decimal places
- Final price should never be negative
- Stripe should receive amount in cents (finalAmount * 100)

### Integration Testing
- Payment flow should work with and without coupons
- Stripe metadata should contain all coupon information
- Success/cancel URLs should handle coupon scenarios

## 📊 Analytics & Tracking

The system tracks coupon usage through:
- Stripe session metadata
- Server-side logging
- Payment confirmation emails (if needed)

## 🚀 Future Enhancements

Potential improvements:
- Expiration dates for coupons
- Usage limits per coupon
- Dynamic coupon management via admin panel
- Coupon history in user dashboard





