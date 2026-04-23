# 🍽️ SmartCanteen — Demo Script (5 minutes)

## 📍 Demo Setup
- **PC/Laptop:** Projector or screen share ready
- **Phone (optional):** Show mobile responsiveness
- **Internet:** API calls to Claude AI live (or fallback mock)
- **Demo data:** Pre-loaded with 25 orders, 3-day streak, high crowd

---

## 🎯 Demo Narrative

### Opening (30 seconds)
```
"Good afternoon! Every single one of you has lost 20-40 minutes of your 
lunch break standing in the college canteen queue. That's 5+ hours per 
month of wasted time, plus we're throwing away ~30% of prepped food daily.

SmartCanteen solves this with three words: Skip. Order. Smart.

Let me show you how."
```

---

## ✨ Demo Flow

### 1️⃣ Landing Page (30 seconds)

**Action:**
- Land on homepage
- Scroll down briefly to show features carousel
- Highlight: "Real-Time Crowd Tracking", "AI Recommendations", "Skip Queues"

**Talk:**
```
"Here's the homepage. You can see the main features — AI-powered 
recommendations, live crowd tracking, and gamified rewards. 

But let's get to the good part — let me show you the app in action."
```

**Click:** "🎮 Try Demo" button
- Toast: "✅ Demo data loaded!"

---

### 2️⃣ Student Login + Dashboard (45 seconds)

**Auto-filled credentials:**
- Username: `demo_student`
- Password: `demo123`

**Action:**
- Click Login
- Dashboard loads with fade-in animation
- Show populated dashboard with:
  - **Crowd Widget** (top): "HIGH CROWD • 12:30 PM • Slot 4: 35 orders"
  - **Notice Board**: Canteen notice dismissible
  - **Stats Grid**: "Your Streak: 3 days 🔥 | 67/100 Mess Points"
  - **Quick Links**: Menu, Orders, Leaderboard

**Talk:**
```
"Welcome to the student dashboard. See that crowd widget?
It updates every 30 seconds and shows real-time congestion 
across all 6 pickup slots.

Right now it's peak time — 12:30 PM, Slot 4 is packed with 35 orders.

Below that, you see your streak — 3 consecutive order days, earning you 
5 bonus points each. And your mess points progress: 67 out of 100 toward 
a free meal.

Let's order something."
```

**Hover over:** "Best time to visit: 12:45–1:00 PM (Slot 6)"

---

### 3️⃣ Menu + AI Search Toggle (60 seconds)

**Action:**
- Click "🍽️ Menu" → MenuPage loads
- Show menu grid: 6-8 items visible with images, prices, categories

**Talk:**
```
"Here's the menu. You can browse by category — Meals, Snacks, Beverages, 
Desserts. But here's where AI comes in..."
```

**Action:**
- Toggle "🤖 AI Search" button
- Search box changes placeholder to: "e.g., 'spicy filling under ₹70'..."
- Type: `something filling under 70`
- Click 🔍 Search button → Loading spinner appears

**Talk (while loading):**
```
"I'm asking Claude AI: 'Give me something filling under 70 rupees.'

Not just keyword matching — actual natural language understanding."
```

**Results appear:**
- 2-3 items: "Veg Thali ₹60" and "Paneer Tikka ₹70" 
- Badge: "🤖 AI Pick" on cards
- Orange banner below search: "AI Pick: These items offer great value and 
  nutrition. AI recommendation for your budget."

**Talk:**
```
"Boom — Claude analyzed the menu and picked the best-value filling items
under 70 rupees. Notice the 🤖 AI Pick badge.

This is real AI thinking, not just regex pattern matching."
```

**Action:**
- Add both items to cart: "Veg Thali + Masala Chai"
- Cart badge shows "2"

---

### 4️⃣ Checkout + AI Slot Recommender (60 seconds)

**Action:**
- Click cart icon → CartDrawer opens briefly
- Click "Proceed to Checkout"
- CheckoutPage loads

**Talk:**
```
"Now we're at checkout. Before you pay, watch what happens..."
```

**Action:**
- Page shows 6 pickup slots with orders count
- "🤖 AI Recommends" card appears with loading skeleton
- After 2-3 seconds, Claude response loads

**AI Recommendation Card shows:**
```
🤖 AI Recommends: Slot 2 (12:15-12:30 PM)
Reason: Currently has 6 orders (lowest), shortest wait
Wait Time: ~3-5 minutes
Tip: Order now to grab during low-traffic window
```

**Recommended slot is pre-selected with aqua ring-2 border**

**Talk:**
```
"This is AI Slot Recommender. It analyzed:
  • Your cart items (Veg Thali + Tea)
  • Current crowd per slot
  • Historical wait times
  
And it recommends Slot 2 — only 6 orders, about 3-5 minutes wait.

The slot is already selected. No need to change it, but you could.

Now payment..."
```

**Action:**
- Scroll to payment method: "UPI" selected
- Click "Pay ₹80 via UPI"
- Loading animation (2 seconds) → Success page

---

### 5️⃣ Order Success + QR Coupon (30 seconds)

**OrderSuccessPage loads with:**
- Confetti animation (20 particles falling)
- Animated points badge: "+8 Mess Points 🎉"
- Large QR code in center
- Message: "Order #SC1001 placed! Show this QR at pickup."
- Buttons: "View Orders | Back to Menu | 👑 Check Rankings"

**Talk:**
```
"Success! Your order is confirmed. See that QR code? 
That's your digital proof of purchase — no receipt needed.

8 mess points earned. You're now at 75/100 toward a free meal.

And notice the confetti? We celebrate every order because ordering 
early = less crowd peak."
```

**Action (optional):**
- Right-click QR → "Download QR" 
- Show it can be printed/screenshotted

---

### 6️⃣ Admin Portal (60 seconds)

**Action:**
- Open new tab or click "Switch to Admin" (if button exists) / manually go to /login
- Demo login: `admin` / `12345678`

**Talk:**
```
"Now let's look at the other side — admin controls."
```

**AdminDashboardPage loads:**

**Show Dashboard Stats:**
- "📊 Today's Orders: 147 | 💰 Revenue: ₹11,760 | 👥 Active Users: 312"
- Crowd heatmap: 6 bars showing Slot 4 peak at 35 orders (red)

**Talk:**
```
"This is the admin dashboard. Real-time data:
- 147 orders today
- ₹11,760 revenue  
- Live crowd heatmap showing Slot 4 is bottlenecked

Admins see exactly where congestion is happening and can adjust staffing."
```

**Action:**
- Click "📈 Analytics" tab
- AdminAnalyticsPage loads

**Analytics Page:**
- Button: "🤖 Generate AI Forecast" (not clicked yet)

**Talk:**
```
"Here's the next game-changer — AI demand forecasting.

Let me ask Claude to predict tomorrow's ingredient needs..."
```

**Action:**
- Click "🤖 Generate AI Forecast" button
- Button text changes to "⏳ Generating AI Forecast..."
- 3-4 skeleton cards appear
- After ~2 seconds, real forecast appears:

**Forecast Results:**
```
Tomorrow's Predicted Demand (Saturday):

🍛 Biryani: 38 orders ↑ (Confidence: 92%)
   Suggested prep: 40 portions
   
🥙 Veg Thali: 52 orders ↑↑ (Confidence: 88%)
   Suggested prep: 55 portions
   
🍵 Chai: 67 orders → (Confidence: 95%)
   Suggested prep: 70 cups

Overall Insight: Weekend demand up 15%. Focus on quantity items.
Recommended Focus: Biryani & Veg Thali
Last Generated: 12:45 PM
```

**Talk (while loading):**
```
"Claude is analyzing:
- Today's order patterns
- Historical weekend data
- Customer preferences  
- Seasonal trends
  
To predict what we should prep tomorrow...

And here's the forecast. Veg Thali leads with 52 predicted orders. 
Confidence is 88%. Based on this, admins can:
- Buy exact ingredients (no waste)
- Staff appropriately (no bottlenecks)
- Prep optimal quantities (just-in-time)"
```

---

### 7️⃣ Leaderboard (30 seconds) — OPTIONAL if time permits

**Action:**
- Go to /student/leaderboard
- Show podium with top 3:
  - 🥇 #1: "Rahul (245 pts)" — Centered, largest, gold border
  - 🥈 #2: "Priya (198 pts)" — Left, smaller, silver  
  - 🥉 #3: "Arjun (167 pts)" — Right, smaller, bronze

**Talk:**
```
"And to fuel friendly competition, we have leaderboards.

Top students get recognition for supporting the canteen early 
and earning them back rewards. Casual gamification keeps engagement high."
```

---

## 🎭 Closing Narrative (15 seconds)

```
"That's SmartCanteen.

No more queues.
No more wasted food.
No more guesswork.

Students skip lunch lines. Admins optimize inventory.
Claude AI powers intelligent recommendations.

Everyone wins. The canteen wins. The college saves money.
The environment wins.

Questions?"
```

---

## 🎥 Demo Tips

✅ **DO:**
- Use live demo mode with pre-loaded data (smooth)
- Speak slowly; let visuals sink in
- Pause between sections for Q&A
- Show mobile responsiveness if available (swipe through menu)
- Highlight animations/microinteractions (confetti, page transitions)
- Wear a clip mic for clear audio

❌ **DON'T:**
- Don't refresh mid-demo (data resets)
- Don't click random links (get lost)
- Don't skip the AI features (they're the hook)
- Don't rush; give each section ~60 seconds

---

## 🔧 Pre-Demo Checklist

- [ ] Client dev server running (`npm run dev`)
- [ ] Backend server running (`npm start`) — for health check
- [ ] Browser cache cleared (localStorage reset to demo state)
- [ ] Network connection stable
- [ ] Volume up; test audio
- [ ] Screen resolution set to 1920x1080+ (readable text)
- [ ] DevTools hidden
- [ ] Phone brightness max (if showing mobile version)
- [ ] Timer set to 5 minutes

---

## 📊 Expected Reactions

- **Crowd Widget:** "Wow, it's actually live?"
- **AI Search:** "It understood 'filling under 70' perfectly!"
- **AI Slot Recommender:** "It predicted which slot would be fastest!"
- **QR Coupon:** "No more torn receipts!"
- **AI Forecast:** "Admins can actually plan inventory now?"
- **Leaderboard:** "I'd definitely order early for #1 spot!"

---

## 🎯 Key Messages to Reinforce

1. **Time Saved:** 20-40 min/day → 5+ hours/month per person
2. **Food Waste Reduced:** ~30% → ~5% with AI forecasting
3. **Revenue Improved:** Better cash flow, predictable demand
4. **Student Experience:** Gamified, rewarding, social (leaderboard)
5. **Admin Control:** Real-time insights, zero guesswork

---

**Good luck with your demo! 🚀**
