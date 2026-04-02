# 🍛 Vindu — Nellore Food Delivery App

> Authentic Andhra food delivery app for Nellore, powered by AI recommendations and Google Sheets integration.

![Vindu App](https://img.shields.io/badge/Vindu-Food%20App-FF6B00?style=for-the-badge&logo=food&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)

---

## 📱 Features

- 🏠 **Home** — Hero banner, smart search, filter chips (Veg / Seafood / Budget / Rating)
- 🍽️ **Restaurants** — 6 authentic Nellore restaurants with menus, ratings & delivery times
- ✨ **AI Assistant** — Claude-powered food guru that recommends dishes based on diet, spice & budget
- 🛒 **Cart** — Add items, adjust quantities, view bill breakdown
- 📋 **Checkout** — Collects customer Name, Phone, Address & Payment Mode
- 📊 **Google Sheets** — Auto-saves every order & customer detail to your spreadsheet
- ⚙️ **Preferences** — Set dietary needs, spice tolerance & budget

---

## 🍴 Nellore Restaurants Included

| # | Restaurant | Specialty | Type |
|---|-----------|-----------|------|
| 1 | 🐟 Nellore Roastery | Chepala Pulusu, Prawn Curry | Non-Veg / Seafood |
| 2 | 🍛 Sri Venkateswara Mess | Andhra Meals, Pesarattu | Veg & Non-Veg |
| 3 | 👑 Hotel Haritha | Dum Biryani, Chicken 65 | Premium / Non-Veg |
| 4 | 🍬 Brijwasi Sweets | Chaat, Sweets, Snacks | Pure Veg |
| 5 | 🌶️ Rayalaseema Ruchulu | Ulavacharu, Natu Kodi | Spicy / Non-Veg |
| 6 | 🥞 Andhra Tiffin House | Pesarattu, Idli, Vada | Veg / Tiffin |

---

## 🚀 Getting Started

### Option 1: Open Directly (No Setup Needed)
Just download `index.html` and open it in any browser. The app works instantly!

### Option 2: Host on GitHub Pages (Free Website)
1. Fork this repository
2. Go to **Settings → Pages**
3. Set Source to `main` branch → `/ (root)`
4. Your app will be live at `https://YOUR-USERNAME.github.io/vindu-food-app/`

---

## 📊 Google Sheets Integration Setup

This connects the app to your Google Sheet to save all orders and customer data automatically.

### Step 1 — Create the Spreadsheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a **New Spreadsheet** → name it **"Vindu Food App Data"**

### Step 2 — Add the Apps Script
1. In the spreadsheet: **Extensions → Apps Script**
2. Delete all existing code
3. Copy & paste the entire contents of `google-apps-script.js`
4. Click **Save** (💾)

### Step 3 — Deploy as Web App
1. Click **Deploy → New Deployment**
2. Select type: **Web App**
3. Set:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy** → **Authorize** when prompted
5. **Copy the Web App URL**

### Step 4 — Connect to App
1. Open the Vindu app (`index.html`)
2. Paste the Web App URL in the **blue banner** at the top
3. Click **🔗 Connect**
4. Done! All orders now save to your Google Sheet automatically ✅

### 📋 Sheets Created Automatically

| Sheet | What It Saves |
|-------|--------------|
| **Orders** | Order ID, timestamp, items, total, payment mode |
| **Customers** | Name, phone, address, order history, total spent |
| **Restaurants** | All 6 Nellore restaurant details |
| **Menu Items** | Full menu with prices, spice levels, categories |

---

## 🤖 AI Assistant Setup

The AI assistant uses the **Claude API** (by Anthropic). It works out of the box in the Claude.ai environment. If you host this elsewhere:

1. Get an API key from [console.anthropic.com](https://console.anthropic.com)
2. Note: The API key must be handled server-side for production use

---

## 📁 Project Structure

```
vindu-food-app/
│
├── index.html              ← Main app (single-file, works standalone)
├── google-apps-script.js   ← Backend script for Google Sheets
├── README.md               ← This file
└── .gitignore              ← Files excluded from Git
```

---

## 🛠️ Tech Stack

| Technology | Usage |
|-----------|-------|
| HTML5 / CSS3 / Vanilla JS | Frontend — no frameworks needed |
| Google Fonts (Playfair Display + Nunito) | Typography |
| Claude API (claude-sonnet) | AI food recommendations |
| Google Apps Script | Serverless backend for Sheets |
| Google Sheets API | Data storage |

---

## 🌐 Live Demo

> Host on GitHub Pages for a free live URL — see "Option 2" above.

---

## 📄 License

MIT License — free to use, modify and distribute.

---

## 🙏 Credits

Built with ❤️ for Nellore food lovers. Powered by [Claude AI](https://claude.ai) by Anthropic.

> *"Chala Baagundi!"* — Tastes great in Nellore! 🐟
