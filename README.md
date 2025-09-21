# 🏡 Oswal Community Directory & Marketplace App

A React + Firebase-based web application for managing community family records and enabling buy/sell listings among members.

---

## 🚀 Features

### 👨‍👩‍👧‍👦 Family Directory
- Register via mobile + PIN
- Role-based access: guest / member / committee / admin
- Family linking with invite flow
- Offline caching with LocalForage

### 🛍️ Buy & Sell Marketplace
- Members can post ads (title, price, image, description)
- Public ads listing for all users
- Contact via WhatsApp or Call
- Weekly ad sync system (only updates every Friday)
- Ad edit/delete by owner

### 🔒 Auth & Roles
- Firebase Authentication (Google / Email+Password)
- Phone and PIN-based role upgrade
- Protected routes per role

### 🧠 Optimized for Mobile
- Tailwind UI with mobile-first layout
- Image crop and compression before upload
- Works offline using LocalForage

---

## 🗂️ Tech Stack

| Tech        | Usage                         |
|-------------|-------------------------------|
| React (Vite)| Frontend framework            |
| Firebase    | Auth + Realtime Database      |
| LocalForage | Offline caching               |
| TailwindCSS | UI styling                    |
| Lucide Icons| UI icons                      |
| React Router| Routing system                |

---

## 📁 Folder Structure (simplified)

| Role      | Can View        | Can Post | Admin Panel   |
| --------- | --------------- | -------- | ------------- |
| Guest     | ✅ Ads, families | ❌        | ❌             |
| Member    | ✅               | ✅        | ❌             |
| Committee | ✅               | ✅        | Partial       |
| Admin     | ✅               | ✅        | ✅ Full access |
📅 Weekly Sync Logic
Ads are fetched from Firebase only every Friday

Cached ads shown during the week

Improves performance and reduces database reads
✅ To-Do / Planned Features
 Ad category filters

 PWA support (Install as App)

 Multi-image upload in Ads

 Member analytics for admins

 Export family data as CSV

📄 License
This project is for educational/community use only. Contact maintainer for deployment rights.
🧑‍💻 Maintainer