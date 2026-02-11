# 🔐 Codexier Login Credentials

This document contains test credentials for accessing the Codexier platform.

---

## 👨‍💼 Admin Account

Use these credentials to access the **Admin Dashboard** with full system privileges:

- **Email**: `admin@codexier.com`
- **Password**: `Admin@123456`

### First-Time Setup:
1. Sign up using the credentials above
2. Run [setup_admin.sql](./setup_admin.sql) in your Supabase SQL Editor
3. Log out and log back in to see the Admin Dashboard

---

## 👤 Test Client Account

Use these credentials to test the **Client Dashboard**:

- **Email**: `client@codexier.com`
- **Password**: `Client@123456`

### Features Available:
- Browse services marketplace
- Submit custom project requests
- Message admin team
- Track project progress
- View invoices and payments

---

## 🔒 Security Notes

> [!WARNING]
> **These are test credentials for development only!**
> - Change passwords in production
> - Use environment-specific accounts
> - Never commit real credentials to Git

---

## 🆕 Creating New Accounts

### Client Account (Standard Signup)
1. Click "Sign Up" in the app
2. Fill in email, password, and full name
3. Account automatically gets `client` role
4. Client profile is auto-created

### Admin Account (Manual Setup)
1. Sign up with any email/password
2. Update the email in `setup_admin.sql`
3. Run the script in Supabase SQL Editor
4. Role will be changed to `admin`

---

## 📧 Password Reset

If you forget the password:
1. Go to Supabase Dashboard → Authentication → Users
2. Find the user by email
3. Click "Reset Password" or "Delete User" and recreate
