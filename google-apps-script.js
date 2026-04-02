// ╔══════════════════════════════════════════════════════════════════╗
// ║       VINDU FOOD APP — Google Apps Script Backend               ║
// ║  Deploy this as a Web App to connect your app to Google Sheets  ║
// ╚══════════════════════════════════════════════════════════════════╝
//
// SETUP INSTRUCTIONS:
// 1. Go to https://sheets.google.com → Create a NEW spreadsheet
// 2. Name it "Vindu Food App Data"
// 3. In the spreadsheet menu → Extensions → Apps Script
// 4. DELETE all existing code and PASTE this entire file
// 5. Click "Save" (💾 icon)
// 6. Click "Deploy" → "New Deployment"
// 7. Select type: "Web App"
//    - Description: "Vindu App Backend"
//    - Execute as: "Me"
//    - Who has access: "Anyone"
// 8. Click "Deploy" → Copy the Web App URL
// 9. Paste that URL into the Vindu HTML app where it says:
//    const SHEETS_URL = "PASTE_YOUR_WEB_APP_URL_HERE";
// 10. DONE! Orders and data will now save to your spreadsheet.

// ── CONFIGURATION ──
const SPREADSHEET_ID = SpreadsheetApp.getActiveSpreadsheet().getId();

// ── MAIN WEB APP ENTRY POINT ──
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    let result;

    if (action === "saveOrder") {
      result = saveOrder(data.payload);
    } else if (action === "saveCustomer") {
      result = saveCustomer(data.payload);
    } else if (action === "initSheets") {
      result = initializeSheets();
    } else {
      result = { success: false, message: "Unknown action" };
    }

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  // Initialize sheets on first GET (useful for testing)
  const result = initializeSheets();
  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── INITIALIZE ALL SHEETS ──
function initializeSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  setupOrdersSheet(ss);
  setupCustomersSheet(ss);
  setupRestaurantsSheet(ss);
  setupMenuSheet(ss);

  return { success: true, message: "All sheets initialized successfully!" };
}

// ── ORDERS SHEET ──
function setupOrdersSheet(ss) {
  let sheet = ss.getSheetByName("Orders");
  if (!sheet) {
    sheet = ss.insertSheet("Orders");
    const headers = [
      "Order ID", "Timestamp", "Customer Name", "Phone", "Address",
      "Items Ordered", "Item Count", "Subtotal (₹)", "Delivery (₹)",
      "Tax (₹)", "Grand Total (₹)", "Payment Mode", "Status"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeaderRow(sheet, headers.length, "#C0392B");
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, headers.length, 150);
    sheet.setColumnWidth(6, 300); // Items column wider
  }
}

function saveOrder(order) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Orders");
  if (!sheet) {
    setupOrdersSheet(ss);
    sheet = ss.getSheetByName("Orders");
  }

  const row = [
    order.orderId,
    new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
    order.customerName,
    order.phone,
    order.address,
    order.items,       // e.g. "Nellore Fish Curry x2, Biryani x1"
    order.itemCount,
    order.subtotal,
    order.delivery,
    order.tax,
    order.grandTotal,
    order.paymentMode || "Cash on Delivery",
    "Confirmed"
  ];

  sheet.appendRow(row);

  // Also save/update customer
  saveCustomer({
    name: order.customerName,
    phone: order.phone,
    address: order.address,
    lastOrder: order.orderId,
    totalSpent: order.grandTotal
  });

  return { success: true, orderId: order.orderId };
}

// ── CUSTOMERS SHEET ──
function setupCustomersSheet(ss) {
  let sheet = ss.getSheetByName("Customers");
  if (!sheet) {
    sheet = ss.insertSheet("Customers");
    const headers = [
      "Phone", "Customer Name", "Address", "First Order Date",
      "Last Order Date", "Last Order ID", "Total Orders", "Total Spent (₹)"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeaderRow(sheet, headers.length, "#3D7A3D");
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, headers.length, 160);
  }
}

function saveCustomer(customer) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Customers");
  if (!sheet) {
    setupCustomersSheet(ss);
    sheet = ss.getSheetByName("Customers");
  }

  const data = sheet.getDataRange().getValues();
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  // Check if customer with same phone already exists
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(customer.phone)) {
      // Update existing customer
      const totalOrders = (data[i][6] || 0) + 1;
      const totalSpent = (data[i][7] || 0) + (customer.totalSpent || 0);
      sheet.getRange(i + 1, 4).setValue(data[i][3] || now); // keep first order date
      sheet.getRange(i + 1, 5).setValue(now);
      sheet.getRange(i + 1, 6).setValue(customer.lastOrder);
      sheet.getRange(i + 1, 7).setValue(totalOrders);
      sheet.getRange(i + 1, 8).setValue(totalSpent);
      return { success: true, isNew: false };
    }
  }

  // New customer
  sheet.appendRow([
    customer.phone,
    customer.name,
    customer.address,
    now,   // First order date
    now,   // Last order date
    customer.lastOrder,
    1,
    customer.totalSpent || 0
  ]);

  return { success: true, isNew: true };
}

// ── RESTAURANTS SHEET ──
function setupRestaurantsSheet(ss) {
  let sheet = ss.getSheetByName("Restaurants");
  if (!sheet) {
    sheet = ss.insertSheet("Restaurants");
    const headers = [
      "ID", "Restaurant Name", "Emoji", "Cuisine Type", "Rating",
      "Delivery Time", "Price for Two (₹)", "Is Veg", "Tags", "Description", "Location"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeaderRow(sheet, headers.length, "#1565C0");
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, headers.length, 160);
    sheet.setColumnWidth(10, 300);

    // Pre-populate with Nellore restaurants
    const restaurants = [
      [1, "Nellore Roastery", "🐟", "Seafood, Non-Veg", 4.8, "20-30 min", 450, "No", "Fish Curry, Seafood, Nellore Special", "Legendary Nellore fish curry — fiery, tangy and unforgettable!", "Nellore"],
      [2, "Sri Venkateswara Mess", "🍛", "South Indian, Veg & Non-Veg", 4.6, "15-20 min", 200, "Both", "Meals, Tiffin, Andhra Style", "Authentic Andhra meals served on banana leaf daily.", "Nellore"],
      [3, "Hotel Haritha", "👑", "Multi-Cuisine, Premium", 4.7, "30-40 min", 600, "Both", "Biryani, Kebabs, Premium", "The finest dining in Nellore. Signature dum biryani & kebabs.", "Nellore"],
      [4, "Brijwasi Sweets & Snacks", "🍬", "Sweets, Street Food, Veg", 4.5, "10-15 min", 150, "Yes", "Sweets, Snacks, Chaat, Veg", "Best sweets and street snacks in Nellore city center.", "Nellore"],
      [5, "Rayalaseema Ruchulu", "🌶️", "Rayalaseema, Spicy, Non-Veg", 4.6, "25-35 min", 400, "No", "Spicy Curries, Goat, Chicken", "Bold Rayalaseema flavors — for those who love it extra hot!", "Nellore"],
      [6, "Andhra Tiffin House", "🥞", "Tiffin, South Indian, Veg", 4.4, "15-20 min", 120, "Yes", "Tiffin, Dosa, Idli, Budget", "Morning tiffin staples — crispy pesarattu, idli & filter kaapi.", "Nellore"],
    ];
    sheet.getRange(2, 1, restaurants.length, restaurants[0].length).setValues(restaurants);
  }
}

// ── MENU SHEET ──
function setupMenuSheet(ss) {
  let sheet = ss.getSheetByName("Menu Items");
  if (!sheet) {
    sheet = ss.insertSheet("Menu Items");
    const headers = [
      "Item ID", "Restaurant ID", "Restaurant Name", "Category",
      "Item Name", "Emoji", "Description", "Price (₹)", "Spice Level (1-5)", "Is Veg", "Available"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    styleHeaderRow(sheet, headers.length, "#6A1B9A");
    sheet.setFrozenRows(1);
    sheet.setColumnWidths(1, headers.length, 150);
    sheet.setColumnWidth(7, 280);

    // Pre-populate Nellore menus
    const menu = [
      // Nellore Roastery (id:1)
      ["nr1","1","Nellore Roastery","🐟 Signature Fish","Nellore Chepala Pulusu","🐟","Sour tamarind fish curry — the pride of Nellore",280,4,"No","Yes"],
      ["nr2","1","Nellore Roastery","🐟 Signature Fish","Royyala Curry (Prawn)","🦐","Spicy prawn curry with coastal spices",320,4,"No","Yes"],
      ["nr3","1","Nellore Roastery","🐟 Signature Fish","Fish Fry (Pomfret)","🍤","Marinated whole pomfret, pan-fried crispy",240,3,"No","Yes"],
      ["nr4","1","Nellore Roastery","🍗 Non-Veg","Chicken Vepudu","🍗","Dry-roasted Andhra chicken with curry leaves",260,4,"No","Yes"],
      ["nr5","1","Nellore Roastery","🍚 Rice","Natukodi Biryani","🍛","Country chicken dum biryani — rustic & aromatic",320,3,"No","Yes"],
      ["nr6","1","Nellore Roastery","🥥 Sides","Curd Rice","🍚","Cooling curd rice with pickle",80,1,"Yes","Yes"],

      // Sri Venkateswara Mess (id:2)
      ["sv1","2","Sri Venkateswara Mess","🍛 Meals","Andhra Full Meals","🍱","Rice, sambar, rasam, 2 curries, pappad & pickle",180,3,"Yes","Yes"],
      ["sv2","2","Sri Venkateswara Mess","🍛 Meals","Non-Veg Meals","🍱","Full meals + chicken/mutton curry",240,3,"No","Yes"],
      ["sv3","2","Sri Venkateswara Mess","🥞 Tiffin","Pesarattu","🥞","Green moong dosa with ginger chutney — Nellore special",80,2,"Yes","Yes"],
      ["sv4","2","Sri Venkateswara Mess","🥞 Tiffin","Punugulu","🟡","Rice batter fritters with spicy chutney",70,2,"Yes","Yes"],
      ["sv5","2","Sri Venkateswara Mess","☕ Drinks","Filter Kaapi","☕","Strong Andhra-style filter coffee",40,0,"Yes","Yes"],

      // Hotel Haritha (id:3)
      ["hh1","3","Hotel Haritha","🍛 Biryani","Special Dum Biryani (Chicken)","🍗","Slow-cooked with whole spices & fried onions",380,3,"No","Yes"],
      ["hh2","3","Hotel Haritha","🍛 Biryani","Mutton Dum Biryani","🐑","Tender mutton, long-grain basmati, saffron",450,3,"No","Yes"],
      ["hh3","3","Hotel Haritha","🍛 Biryani","Veg Biryani","🥕","Fragrant vegetables in basmati rice",280,2,"Yes","Yes"],
      ["hh4","3","Hotel Haritha","🍢 Starters","Chicken 65","🌶️","Spicy, crispy Andhra-style chicken fry",220,4,"No","Yes"],
      ["hh5","3","Hotel Haritha","🍢 Starters","Paneer Tikka","🧀","Tandoori paneer with mint chutney",240,2,"Yes","Yes"],
      ["hh6","3","Hotel Haritha","🍮 Desserts","Gulab Jamun","🟤","Soft milk-solid balls in rose syrup",90,0,"Yes","Yes"],
      ["hh7","3","Hotel Haritha","🍮 Desserts","Bobbatlu (Poli)","🫓","Sweet lentil-stuffed flatbread — Andhra classic",80,0,"Yes","Yes"],

      // Brijwasi (id:4)
      ["br1","4","Brijwasi Sweets & Snacks","🌮 Chaat","Pani Puri","🫙","Tangy tamarind water in crispy puris",70,3,"Yes","Yes"],
      ["br2","4","Brijwasi Sweets & Snacks","🌮 Chaat","Aloo Tikki Chaat","🥔","Crispy potato patties with chutneys & yogurt",80,2,"Yes","Yes"],
      ["br3","4","Brijwasi Sweets & Snacks","🌮 Chaat","Samosa (2 pcs)","🔺","Flaky pastry with spiced potato filling",40,2,"Yes","Yes"],
      ["br4","4","Brijwasi Sweets & Snacks","🍬 Sweets","Kaju Katli","💎","Pure cashew fudge with silver foil (100g)",120,0,"Yes","Yes"],
      ["br5","4","Brijwasi Sweets & Snacks","🍬 Sweets","Laddu","🟡","Besan laddu with ghee & dry fruits",60,0,"Yes","Yes"],
      ["br6","4","Brijwasi Sweets & Snacks","🍬 Sweets","Jalebi (fresh)","🍩","Crispy spirals in saffron syrup — served hot",50,0,"Yes","Yes"],

      // Rayalaseema Ruchulu (id:5)
      ["rr1","5","Rayalaseema Ruchulu","🌶️ Curries","Ulavacharu (Horse Gram)","🍲","Thick horse-gram broth curry — bold & earthy",180,4,"Yes","Yes"],
      ["rr2","5","Rayalaseema Ruchulu","🌶️ Curries","Natu Kodi Curry","🐓","Rustic country chicken in spicy masala",280,5,"No","Yes"],
      ["rr3","5","Rayalaseema Ruchulu","🌶️ Curries","Mutton Curry (Rayalaseema)","🐑","Slow-cooked goat in fiery Rayalaseema spices",320,5,"No","Yes"],
      ["rr4","5","Rayalaseema Ruchulu","🍚 Rice","Jolada Roti","🫓","Jowar flatbread — rustic & nutritious",60,1,"Yes","Yes"],

      // Andhra Tiffin House (id:6)
      ["at1","6","Andhra Tiffin House","🥞 Tiffin","Pesarattu + Upma","🥞","Crispy green dosa with upma filling",90,2,"Yes","Yes"],
      ["at2","6","Andhra Tiffin House","🥞 Tiffin","Idli (4 pcs)","🫓","Soft steamed rice cakes with sambar & chutney",70,1,"Yes","Yes"],
      ["at3","6","Andhra Tiffin House","🥞 Tiffin","Vada (2 pcs)","🍩","Crispy lentil donuts with coconut chutney",60,1,"Yes","Yes"],
      ["at4","6","Andhra Tiffin House","🥞 Tiffin","Upma","🍚","Semolina cooked with veggies, mustard & curry leaves",60,2,"Yes","Yes"],
      ["at5","6","Andhra Tiffin House","☕ Drinks","Ginger Tea","🍵","Fresh ginger-cardamom tea",30,1,"Yes","Yes"],
      ["at6","6","Andhra Tiffin House","☕ Drinks","Filter Coffee","☕","Andhra-style strong filter coffee with chicory",40,0,"Yes","Yes"],
    ];
    sheet.getRange(2, 1, menu.length, menu[0].length).setValues(menu);
  }
}

// ── STYLE HELPER ──
function styleHeaderRow(sheet, colCount, bgColor) {
  const headerRange = sheet.getRange(1, 1, 1, colCount);
  headerRange.setBackground(bgColor);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontSize(11);
}

// ── AUTO-RUN ON OPEN ──
function onOpen() {
  initializeSheets();
  SpreadsheetApp.getUi().alert(
    "✅ Vindu Food App\n\nAll sheets are ready:\n• Orders\n• Customers\n• Restaurants\n• Menu Items\n\nDeploy as Web App to connect your food app!"
  );
}
