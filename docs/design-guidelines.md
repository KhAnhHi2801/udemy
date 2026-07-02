# Design Guidelines

## UI Framework Stack

| Library | Role |
|---------|------|
| Ant Design 6 | Primary component library (navigation, dropdowns, avatars, buttons) |
| Bootstrap 5 | Layout utilities (grid, spacing, form controls) |
| Custom CSS | `public/css/styles.css` for overrides |

## Layout

### Page Structure
```
┌──────────────────────────────────────┐
│  TopNav (Ant Design Menu + Avatar)   │
├──────────────────────────────────────┤
│                                      │
│  Page content (Bootstrap container)  │
│                                      │
└──────────────────────────────────────┘
```

### TopNav
- Horizontal `Menu` from Ant Design
- Items: App, Login, Register, Logout (right-aligned)
- Locale switcher (flag + code) as a `Dropdown` with `round` button shape
- `AccountDropdown` on the far right: user avatar (picture or initial letter)

### Forms
- Centered, max-width `col-md-4 offset-md-4`
- Bootstrap `form-control mb-4 p-4` for inputs
- `btn btn-primary btn-block` for submit
- Error messages: `alert alert-danger` above the form
- Loading state: replace button text with `<SyncOutlined spin />`

## Ant Design Usage

- **Theme**: `cssVar: {}` enabled via `ConfigProvider` — use CSS variables for theming
- **Icons**: Only import from `@ant-design/icons` what is used (tree-shaking)
- **Avoid mixing** Bootstrap buttons with Antd buttons in the same section — pick one

## i18n & Copy

- All visible text must use translation keys via `useTranslation`
- Keys use kebab-case: `"enter-email"`, `"already-registered"`, `"login"`
- Error keys use UPPER_SNAKE: `"FIELD_TOO_SHORT"`, `"INVALID_EMAIL"`, `"SOMETHING_WENT_WRONG"`
- Translation files: `public/locales/{en,vi}/{common,errors}.json`

## Colors & Branding

Current usage is default Ant Design + Bootstrap primary blue. No custom brand colors defined yet.

When establishing brand:
- Define tokens in `ConfigProvider.theme.token`
- Mirror as CSS variables in `styles.css` for Bootstrap overrides

## Responsive Design

- Use Bootstrap grid for responsive layouts (`col-md-4 offset-md-4`)
- Ant Design components are responsive by default
- Test at: mobile (375px), tablet (768px), desktop (1280px)

## Avatar / User Identity

- Display user's `picture` if set, otherwise fall back to first letter of `name` (uppercase)
- Default picture path: `/avatar.png`
