# Bolt Chauffeur Nameboard — QA Test Matrix

Use this checklist before each release. Each row should be tested on the
devices/browsers listed in the **Device Matrix** below.

---

## Device Matrix

Test on **at least one device from each row**:

| Category | Example Devices | Browsers |
|---|---|---|
| iPhone (small) | iPhone SE, iPhone 13 mini | Safari, Chrome |
| iPhone (large) | iPhone 14 Pro Max, 15 Plus | Safari |
| iPad | iPad 10th gen, iPad Air, iPad Pro 12.9" | Safari |
| Android phone | Samsung Galaxy S23, Pixel 7 | Chrome, Samsung Internet |
| Android tablet | Samsung Galaxy Tab S9, Pixel Tablet | Chrome |
| Desktop | Any laptop/desktop | Chrome, Firefox, Safari, Edge |

---

## 1. Core Functionality

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| 1.1 | Enter name | Open app → type "Ana Rodriguez" → tap "Display Name" | Nameboard shows "Hello", "Ana Rodriguez" in script font, "Bolt Chauffeur" at bottom |
| 1.2 | Empty submit | Tap "Display Name" without entering a name | Nothing happens, stays on input screen |
| 1.3 | Whitespace-only submit | Enter "   " → tap "Display Name" | Nothing happens, stays on input screen |
| 1.4 | Edit name | From display → tap pencil icon | Returns to input screen with name pre-filled |
| 1.5 | Change name | Edit existing name → submit again | Display updates to new name |
| 1.6 | URL sharing | Copy link → paste in new tab/device | Nameboard loads with correct name displayed |
| 1.7 | QR code | Tap QR icon on toolbar | Overlay shows scannable QR code |
| 1.8 | QR close | Tap outside QR overlay | Overlay closes |
| 1.9 | Copy link | Tap link icon on toolbar | Toast confirms "Link copied!" |
| 1.10 | Toolbar auto-hide | Wait 3 seconds on display screen | Toolbar fades out |
| 1.11 | Toolbar reappear | Tap anywhere on nameboard | Toolbar fades back in |

## 2. International Names

| # | Test Case | Name to Enter | Expected Result |
|---|---|---|---|
| 2.1 | Arabic | محمد بن سلمان | Displays correctly, right-to-left |
| 2.2 | Chinese | 张伟 | Displays correctly |
| 2.3 | Japanese | 田中太郎 | Displays correctly |
| 2.4 | Korean | 김민수 | Displays correctly |
| 2.5 | Cyrillic | Борис Петров | Displays correctly |
| 2.6 | Accented Latin | José García Müller | Displays with accents intact |
| 2.7 | Turkish dotted I | İbrahim Öztürk | Displays with Turkish characters |
| 2.8 | Hindi | राजेश कुमार | Displays correctly |
| 2.9 | Very long name | Dr. Muhammad Abdul-Rahman Al-Rashid III | Text auto-sizes to fit screen |

## 3. Orientation & Responsive Layout

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| 3.1 | Phone portrait – input | Open app in portrait on phone | Form centered, scrollable if needed |
| 3.2 | Phone landscape – input | Rotate phone to landscape on input screen | All form elements accessible via scrolling |
| 3.3 | Phone portrait – display | Submit name in portrait | Name fills available space, readable |
| 3.4 | Phone landscape – display | Rotate to landscape on display | Name re-fits to new dimensions, "Bolt Chauffeur" visible |
| 3.5 | Tablet portrait – input | Open app in portrait on tablet | Form centered, well-proportioned |
| 3.6 | Tablet landscape – input | Rotate tablet to landscape on input | Form accessible, no overflow issues |
| 3.7 | Tablet portrait – display | Submit name in portrait on tablet | Name fills space proportionally |
| 3.8 | Tablet landscape – display | Rotate to landscape on tablet | Name re-fits, all elements visible |
| 3.9 | Rotate during display | Rotate device while name is showing | Text re-sizes smoothly, no flash of wrong size |
| 3.10 | Small phone landscape | Test on a small phone (SE) in landscape | Input screen fully scrollable, submit button reachable |

## 4. Download Feature

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| 4.1 | Download menu | Tap download icon on toolbar | Menu shows: "Save for Phone", "Save for Tablet", "Save as PDF" |
| 4.2 | Save for Phone | Tap "Save for Phone" | PNG downloads, 2532×1170px, name clearly visible |
| 4.3 | Save for Tablet | Tap "Save for Tablet" | PNG downloads, 2732×2048px, name clearly visible |
| 4.4 | Save as PDF | Tap "Save as PDF" | PDF downloads, correct landscape orientation |
| 4.5 | Phone image quality | Open downloaded phone PNG | Decorative arcs visible, "Hello" at top, name centered, "Bolt Chauffeur" at bottom |
| 4.6 | Tablet image quality | Open downloaded tablet PNG | Same as above, higher resolution |
| 4.7 | PDF quality | Open downloaded PDF | Full-bleed nameboard, no margins, correct colors |
| 4.8 | Long name download | Enter long name → download | Name wraps nicely in downloaded image |
| 4.9 | Download filename | Download any format | File named `nameboard-<name>.png` or `.pdf` |
| 4.10 | Download menu close | Tap outside download menu | Menu closes |

## 5. PWA / Offline

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| 5.1 | Install on iOS | Safari → Share → "Add to Home Screen" | App icon appears on home screen |
| 5.2 | Install on Android | Chrome → ⋮ Menu → "Install app" | App icon appears on home screen |
| 5.3 | Installed app opens | Tap installed app icon | Opens in standalone mode (no browser chrome) |
| 5.4 | Offline – cached page | Enable airplane mode → open app | App loads from cache |
| 5.5 | Offline – display name | In airplane mode, enter a name | Nameboard displays correctly |
| 5.6 | Offline – shared link | Open a previously cached link while offline | Name loads from URL hash |
| 5.7 | Wake lock | Display name → leave device idle | Screen stays on (device does not sleep) |

## 6. Fullscreen

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| 6.1 | Enter fullscreen | Tap fullscreen icon on toolbar | App goes fullscreen, icon changes to exit icon |
| 6.2 | Exit fullscreen | Tap exit fullscreen icon | Returns to normal, icon changes back |
| 6.3 | Edit from fullscreen | In fullscreen → tap edit icon | Exits fullscreen and shows input screen |
| 6.4 | Fullscreen on iPad | Test fullscreen on iPad Safari | Works or gracefully degrades |

## 7. Visual / Branding

| # | Test Case | Expected Result |
|---|---|---|
| 7.1 | Background color | Nameboard background is warm brown (#C4976B) |
| 7.2 | Decorative arcs | Cream/beige curved lines visible in top-right and bottom-left corners |
| 7.3 | "Hello" text | Black, bold, Inter font, centered at top |
| 7.4 | Name text | Black, bold, Caveat (script) font, auto-sized to fill space |
| 7.5 | "Bolt Chauffeur" | Black text at bottom: "Bolt" bold, "Chauffeur" medium weight |
| 7.6 | Input screen theme | Dark background (#111), white text |
| 7.7 | Logo on input | "Bolt Chauffeur" in white text (not old green C logo) |
| 7.8 | Font loading | Fonts load without flash of unstyled text (or minimal) |

## 8. Accessibility

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| 8.1 | Screen reader – input | Enable VoiceOver/TalkBack on input screen | Logo, label, input, button all announced |
| 8.2 | Screen reader – display | Enable on display screen | Name announced as heading level 1 |
| 8.3 | Keyboard nav | Tab through input screen | Focus moves logically: input → button |
| 8.4 | Enter key submit | Focus input → type name → press Enter | Form submits |
| 8.5 | Touch targets | Tap all buttons on a phone | All buttons respond to tap (no misses) |
| 8.6 | Text contrast | Visually inspect nameboard in sunlight | Name readable on brown background |

## 9. Edge Cases & Stress

| # | Test Case | Steps | Expected Result |
|---|---|---|---|
| 9.1 | Single letter name | Enter "A" | Displays as a large single letter |
| 9.2 | 200+ char name | Paste a very long name | Text wraps and sizes down to fit |
| 9.3 | Name with numbers | Enter "Gate 42 - Smith" | Displays correctly |
| 9.4 | Rapid submissions | Quickly submit 5 different names | Last name displays, no crash |
| 9.5 | Back button | Submit name → press browser back | Navigates back (hash changes), no crash |
| 9.6 | Multiple tabs | Open same URL in multiple tabs | Both show the name correctly |
| 9.7 | Deep link | Share link with name → open on new device | Name loads immediately on display |
| 9.8 | Page refresh | Refresh while on display screen | Name persists (from URL hash) |
| 9.9 | Clear cache | Clear browser cache → reload | App reloads fresh, fonts load |

---

## Bug Report Template

When reporting issues found during manual QA:

```
**Device**: [e.g. Samsung Galaxy S23, Android 14]
**Browser**: [e.g. Chrome 120]
**Orientation**: [Portrait / Landscape]
**Test Case**: [e.g. 3.4 – Phone landscape display]
**Steps to Reproduce**:
1. ...
2. ...
**Expected**: ...
**Actual**: ...
**Screenshot**: [attach]
```

---

## Automated Test Coverage

The automated suite (`npm test`) covers **203 tests** across 7 files:

| File | Tests | Coverage Area |
|---|---|---|
| `nameboard.test.jsx` | 44 | Baseline: hash, themes, manifest, SW, components, clipboard |
| `hash-edge-cases.test.js` | 48 | XSS vectors, unicode (13 languages), URL-unsafe chars, boundaries |
| `download.test.js` | 14 | SIZE_PRESETS validation, layout overlap detection, export checks |
| `integration.test.jsx` | 26 | Full user flow, form validation, international names via UI |
| `accessibility.test.jsx` | 18 | WCAG contrast, ARIA, semantic HTML, keyboard nav, touch targets |
| `pwa-extended.test.js` | 32 | Manifest completeness, SW lifecycle, theme consistency, meta tags |
| `edge-cases.test.jsx` | 21 | Theme resilience, extreme names, rapid interactions, layout guards |

Run with: `npm test`
