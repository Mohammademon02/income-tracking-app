# Withdrawal Details & Timeline Features

## Overview
আপনার withdrawal গুলোতে এখন click করলে একটি detailed modal দেখাবে যেখানে timeline এবং সব details থাকবে। **USA business days** অনুযায়ী calculation করা হয় (weekends এবং US holidays বাদ দিয়ে)।

## New Features

### 1. Clickable Withdrawal Rows
- Withdrawals table এর যেকোনো row এ click করলে details modal খুলবে
- Pending withdrawals modal এর items গুলোতেও click করা যাবে
- Visual indication দেওয়া আছে যে rows clickable

### 2. Detailed Timeline View
- প্রতিটি withdrawal এর জন্য visual timeline
- Processing stages দেখানো হয়:
  - Request Submitted
  - Initial Review  
  - Verification (First withdrawal: 7 business days, Others: 3 business days)
  - Processing (First withdrawal: 15 business days, Others: 7 business days)
  - Completion

### 3. Smart Timeline Logic (USA Business Days)
- **First Withdrawal**: 25-30 business days expected
- **Subsequent Withdrawals**: 12-15 business days expected
- **Business Days Calculation**: Excludes weekends (Saturday, Sunday) and US federal holidays
- Color-coded progress:
  - 🔵 Blue: On track
  - 🟠 Orange: Normal processing
  - 🔴 Red: Delayed

### 4. US Federal Holidays Excluded (Complete List)
- **New Year's Day** - January 1
- **Martin Luther King Jr. Day** - 3rd Monday in January
- **Presidents' Day** - 3rd Monday in February
- **Memorial Day** - Last Monday in May
- **Juneteenth** - June 19 (federal holiday since 2021)
- **Independence Day** - July 4
- **Labor Day** - 1st Monday in September
- **Columbus Day** - 2nd Monday in October
- **Veterans Day** - November 11
- **Thanksgiving** - 4th Thursday in November
- **Christmas Day** - December 25

### 5. Enhanced Visual Design
- Beautiful gradient backgrounds
- Progress bars showing completion percentage
- Status indicators with appropriate colors
- Responsive design for mobile and desktop

## How to Use

### From Withdrawals Table:
1. Go to `/withdrawals` page
2. Click on any withdrawal row
3. Details modal will open with timeline

### From Pending Withdrawals Card:
1. Click on the pending withdrawals card (dashboard)
2. In the modal, click on any withdrawal item
3. Details modal will open

### Timeline Information:
- Green checkmarks: Completed stages
- Blue dots: Current/active stages  
- Gray dots: Future stages
- Progress bar shows overall completion
- **All calculations in business days only**

## Technical Implementation

### Components Added:
- `WithdrawalDetailsModal`: Main details modal with timeline
- Enhanced `WithdrawalsTable`: Added click handlers
- Enhanced `PendingWithdrawalsModal`: Added click handlers

### Features:
- Automatic first withdrawal detection
- Dynamic timeline calculation with business days
- US holidays exclusion
- Responsive design
- TypeScript support
- Proper error handling

## Business Days Calculation Logic

```typescript
// Calculate business days excluding weekends and ALL US federal holidays
const calculateBusinessDays = (startDate: Date, endDate: Date): number => {
  let businessDays = 0
  const current = new Date(startDate)
  
  // Complete US Federal Holidays list
  const getUSHolidays = (year: number) => [
    new Date(year, 0, 1),   // New Year's Day - January 1
    // Martin Luther King Jr. Day - 3rd Monday in January
    new Date(year, 0, (3 - 1) * 7 + 1 + (1 - new Date(year, 0, 1).getDay() + 7) % 7),
    // Presidents' Day - 3rd Monday in February  
    new Date(year, 1, (3 - 1) * 7 + 1 + (1 - new Date(year, 1, 1).getDay() + 7) % 7),
    // Memorial Day - Last Monday in May
    new Date(year, 4, 31 - (new Date(year, 4, 31).getDay() + 6) % 7),
    new Date(year, 5, 19), // Juneteenth - June 19 (federal holiday since 2021)
    new Date(year, 6, 4),   // Independence Day - July 4
    // Labor Day - 1st Monday in September
    new Date(year, 8, 1 + (1 - new Date(year, 8, 1).getDay() + 7) % 7),
    // Columbus Day - 2nd Monday in October
    new Date(year, 9, (2 - 1) * 7 + 1 + (1 - new Date(year, 9, 1).getDay() + 7) % 7),
    new Date(year, 10, 11), // Veterans Day - November 11
    // Thanksgiving - 4th Thursday in November
    new Date(year, 10, (4 - 1) * 7 + 1 + (4 - new Date(year, 10, 1).getDay() + 7) % 7),
    new Date(year, 11, 25), // Christmas Day - December 25
  ]
  
  const holidays = [
    ...getUSHolidays(startDate.getFullYear()),
    ...getUSHolidays(endDate.getFullYear())
  ]
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6 // Sunday = 0, Saturday = 6
    const isHoliday = holidays.some(holiday => 
      holiday.toDateString() === current.toDateString()
    )
    
    if (!isWeekend && !isHoliday) {
      businessDays++
    }
    
    current.setDate(current.getDate() + 1)
  }
  
  return businessDays
}

// First withdrawal detection
const isFirstWithdrawal = (withdrawal) => {
  const accountWithdrawals = withdrawals
    .filter(w => w.accountId === withdrawal.accountId)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  return accountWithdrawals[0]?.id === withdrawal.id
}

// Expected processing time (business days)
const expectedDays = isFirstWithdrawal ? 30 : 15
const minExpectedDays = isFirstWithdrawal ? 25 : 12
```

## Visual Indicators

### Status Colors:
- 🟢 **Green**: Approved/Completed
- 🟠 **Orange**: Pending/Processing  
- 🔴 **Red**: Delayed
- 🔵 **Blue**: On Track

### Timeline Milestones (Business Days):
- Day 0: Request submitted
- Day 1: Initial review
- Day 3/7: Verification (depends on first withdrawal)
- Day 7/15: Processing initiated
- Day 15/30: Expected completion

### Business Days Legend:
- **Recent**: ≤7 business days
- **Waiting**: 8-15 business days  
- **Delayed**: >15 business days

## Benefits

1. **Accurate Timeline**: USA business days calculation for realistic expectations
2. **Holiday Awareness**: Excludes US federal holidays from processing time
3. **Better User Experience**: Users can see exact business days progress
4. **Transparency**: Clear timeline expectations with holiday considerations
5. **Visual Appeal**: Modern, professional design
6. **Mobile Friendly**: Works on all devices
7. **Informative**: Shows processing stages and expected times

## USA Business Days Features

- **Weekend Exclusion**: Saturday and Sunday are not counted
- **Holiday Exclusion**: US federal holidays are automatically excluded
- **Accurate Dates**: Timeline milestones show actual business day dates
- **Real-time Calculation**: Processing time updates based on current business days
- **Holiday-aware Progress**: Progress bars account for holidays and weekends

## Future Enhancements

- **Complete Holiday Coverage**: All 11 US federal holidays are now included
- Email notifications at each timeline stage
- Push notifications for mobile app
- Historical timeline data
- Admin panel for updating processing stages
- Integration with payment processor APIs
- Custom holiday calendar management
- State-specific holidays (if needed)
- International holiday support for global operations