---
phase: 3
title: "Translation Files"
status: pending
priority: P1
effort: "30m"
dependencies: [2]
---

# Phase 3: Translation Files

## Overview
Create EN and VI translation JSON files covering: UI labels/placeholders (`common.json`), API error codes (`errors.json`). Zod validation patterns with params handled via interpolation.

## Requirements
- Functional: All hardcoded UI strings in register/login pages covered
- Functional: All error codes from Phase 1 have translations in both EN and VI
- Functional: Zod error patterns (`FIELD_TOO_SHORT:3`) handled with param interpolation

## Architecture
```
client/public/locales/
├── en/
│   ├── common.json   ← UI text
│   └── errors.json   ← API error codes + Zod patterns
└── vi/
    ├── common.json
    └── errors.json
```

Zod error key pattern: frontend splits `"FIELD_TOO_SHORT:3"` → key=`FIELD_TOO_SHORT`, param=`3`
Translation: `"FIELD_TOO_SHORT": "Must be at least {{min}} characters"` → interpolate `{{min}}`

## Related Code Files
- Create: `client/public/locales/en/common.json`
- Create: `client/public/locales/en/errors.json`
- Create: `client/public/locales/vi/common.json`
- Create: `client/public/locales/vi/errors.json`

## Implementation Steps

1. **Create `client/public/locales/en/common.json`**
   ```json
   {
     "nav": {
       "register": "Register",
       "login": "Login",
       "language": "Language"
     },
     "register": {
       "title": "Register",
       "name_placeholder": "Enter name",
       "email_placeholder": "Enter email",
       "password_placeholder": "Enter password",
       "submit": "Submit",
       "success": "User registered successfully"
     },
     "login": {
       "title": "Login",
       "subtitle": "Login to your account"
     }
   }
   ```

2. **Create `client/public/locales/en/errors.json`**
   ```json
   {
     "EMAIL_ALREADY_EXISTS": "Email already registered",
     "NAME_ALREADY_EXISTS": "Name already taken",
     "DATA_ALREADY_EXISTS": "Data already exists",
     "RECORD_NOT_FOUND": "Record not found",
     "DATABASE_ERROR": "Database error. Please try again",
     "SOMETHING_WENT_WRONG": "Something went wrong. Please try again",
     "INVALID_EMAIL": "Invalid email address",
     "FIELD_TOO_SHORT": "Must be at least {{min}} characters",
     "FIELD_TOO_LONG": "Must be at most {{max}} characters"
   }
   ```

3. **Create `client/public/locales/vi/common.json`**
   ```json
   {
     "nav": {
       "register": "Đăng ký",
       "login": "Đăng nhập",
       "language": "Ngôn ngữ"
     },
     "register": {
       "title": "Đăng ký",
       "name_placeholder": "Nhập tên",
       "email_placeholder": "Nhập email",
       "password_placeholder": "Nhập mật khẩu",
       "submit": "Đăng ký",
       "success": "Đăng ký tài khoản thành công"
     },
     "login": {
       "title": "Đăng nhập",
       "subtitle": "Đăng nhập vào tài khoản của bạn"
     }
   }
   ```

4. **Create `client/public/locales/vi/errors.json`**
   ```json
   {
     "EMAIL_ALREADY_EXISTS": "Email đã được đăng ký",
     "NAME_ALREADY_EXISTS": "Tên đã tồn tại",
     "DATA_ALREADY_EXISTS": "Dữ liệu đã tồn tại",
     "RECORD_NOT_FOUND": "Không tìm thấy dữ liệu",
     "DATABASE_ERROR": "Lỗi cơ sở dữ liệu. Vui lòng thử lại",
     "SOMETHING_WENT_WRONG": "Đã có lỗi xảy ra. Vui lòng thử lại",
     "INVALID_EMAIL": "Địa chỉ email không hợp lệ",
     "FIELD_TOO_SHORT": "Phải có ít nhất {{min}} ký tự",
     "FIELD_TOO_LONG": "Không được vượt quá {{max}} ký tự"
   }
   ```

## Success Criteria
- [ ] 4 JSON files created under `client/public/locales/`
- [ ] All keys in `en/` exactly match keys in `vi/` (no missing translations)
- [ ] Error codes from Phase 1 (`EMAIL_ALREADY_EXISTS`, `NAME_ALREADY_EXISTS`, `RECORD_NOT_FOUND`, `SOMETHING_WENT_WRONG`, `DATABASE_ERROR`, `DATA_ALREADY_EXISTS`) all present in `errors.json`
- [ ] Zod patterns (`FIELD_TOO_SHORT`, `FIELD_TOO_LONG`, `INVALID_EMAIL`) all present
- [ ] Valid JSON (no trailing commas, no syntax errors)

## Risk Assessment
- Missing translation key → `next-i18next` falls back to the key string (visible to user) — catch during testing
