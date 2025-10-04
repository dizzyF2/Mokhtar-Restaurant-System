# Restaurant Point-Of-Sale System

A cross-platform Point-of-Sale (POS) desktop application built with **Tauri**, **Rust**, **React.js**, **TypeScript**, and **SQLite3**.  
This system is designed for small restaurants to manage daily operations such as sales, products, sizes, categories, employees, and reporting.

---

## ✨ Features

- 📦 **Product & Category Management** – Add, edit, and organize menu items with sizes and prices.  
- 👨‍🍳 **Employee Management** – Track sales by employee for accountability.  
- 🛒 **Sales Tracking** – Fast and reliable POS workflow for restaurant orders.  
- 📊 **Reports** – View total sales, transactions, and detailed sales reports (including product sizes and categories).  
- 🔒 **Secure Auth & Access Control** – Ensure safe usage for admins and employees.  
- ⚡ **Cross-Platform** – Lightweight desktop app powered by Tauri.

---

## 📸 Screenshots

<div style="display: flex; overflow-x: auto; gap: 10px;">
  <img src="/public/assets/images/login-page.png" alt="Login" width="400" />
  <img src="/public/assets/images/pos-page.png" alt="POS Screen" width="400" />
  <img src="/public/assets/images/admin-panel.png" alt="Dashboard" width="400" />
  <img src="/public/assets/images/products.png" alt="products" width="400" />
  <img src="/public/assets/images/categories.png" alt="Categories" width="400" />
  <img src="/public/assets/images/sizes.png" alt="Sizes" width="400" />
  <img src="/public/assets/images/employees.png" alt="Employees" width="400" />
  <img src="/public/assets/images/reports.png" alt="Reports" width="400" />
</div>

---

## 🛠️ Technologies Used

- **Tauri** – For building secure and lightweight cross-platform apps.  
- **Rust** – Backend logic and database queries.  
- **React.js + TypeScript** – Frontend for a smooth UI/UX.  
- **SQLite3** – Local database for fast and reliable storage.  

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)  
- [Rust](https://www.rust-lang.org/tools/install) (latest stable)  
- [SQLite3](https://www.sqlite.org/download.html)  

### Installation

```bash
# Clone the repository
git clone https://github.com/dizzyF2/Mokhtar-Restaurant-System.git
cd Mokhtar-Restaurant-System

# Install dependencies
npm install

# Run in development
npm run tauri dev

# Build for production
npm run tauri build
