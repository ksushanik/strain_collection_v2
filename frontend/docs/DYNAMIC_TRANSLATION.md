# Dynamic Pages Translation System

## Overview
Dynamic menu items and pages come from backend `UiBinding` entries. Each item can provide an optional `translationKey` that points to the `DynamicPages` namespace in `messages/en.json`, `messages/ru.json`, etc. The frontend resolves translations and gracefully falls back when a key is missing.

## How it works

### 1. Backend provides `UiBinding` (with optional `translationKey`)

```typescript
{
  id: 1,
  menuLabel: "My Collection",        // Text from backend
  translationKey: "myCollection",    // Optional translation key (recommended)
  profileKey: "STRAIN",
  icon: "Microscope",
  routeSlug: "my-collection",
  enabledFieldPacks: ["taxonomy"]
}
```

### 2. Frontend resolves the label

`translateDynamic()` tries keys in this order:
- `translationKey` if provided and present in `DynamicPages`
- A camelCase key derived from `menuLabel` (e.g., `"My Collection"` → `myCollection`, `"field-samples"` → `fieldSamples`)
- Fallback to the original `menuLabel`

Usage:

```tsx
import { useTranslations } from "next-intl";
import { translateDynamic } from "@/lib/translate-dynamic";

const tDynamic = useTranslations("DynamicPages");

<h1>{translateDynamic(tDynamic, binding.translationKey, binding.menuLabel)}</h1>
```

### 3. Translation catalogs

`messages/en.json` and `messages/ru.json` contain matching keys:

```json
// en.json
"DynamicPages": {
  "myCollection": "My Collection",
  "storage": "Storage",
  "isolationObjects": "Isolation Objects",
  "fieldSamples": "Field Samples"
}
```

```json
// ru.json
"DynamicPages": {
  "myCollection": "Моя коллекция",
  "storage": "Хранилище",
  "isolationObjects": "Объекты выделения",
  "fieldSamples": "Полевые пробы"
}
```

## Backend integration checklist

1) (Optional) Add `translationKey` column to `UiBinding` in Prisma.  
2) Expose it in the DTO as `translationKey?: string`.  
3) Populate `translationKey` using camelCase:

| menuLabel         | translationKey  |
|-------------------|-----------------|
| My Collection     | `myCollection`  |
| Storage           | `storage`       |
| Isolation Objects | `isolationObjects` |
| Field Samples     | `fieldSamples`  |

## Adding a new dynamic page

1) Pick a camelCase translation key (e.g., `myCustomPage`).  
2) Add it to `messages/en.json` and `messages/ru.json`.  
3) Return `translationKey: "myCustomPage"` from the backend (or ensure `menuLabel` can derive the same key).  
4) The frontend will translate automatically and fall back to `menuLabel` if the key is missing.
