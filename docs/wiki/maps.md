# Maps Integration

## Overview

Interactive maps powered by Leaflet.js display sample collection locations on Sample detail pages.

## Technology

- **Library**: Leaflet.js (~40KB minified)
- **React Integration**: react-leaflet
- **Map Tiles**: OpenStreetMap (free, no API key required)
- **SSR Compatibility**: Dynamic import with `ssr: false`

## Implementation

### Component Location
- `frontend/src/components/domain/sample-map.tsx`

### Usage
```tsx
<SampleMap 
  lat={sample.lat} 
  lng={sample.lng} 
  siteName={sample.siteName}
  className="h-64"
/>
```

### Features
- **Marker Display**: Automatically places marker at specified coordinates
- **Popup**: Shows site name and coordinates when marker is clicked
- **Responsive**: Adapts to container size
- **Loading State**: Shows spinner while map initializes
- **Conditional Rendering**: Gracefully handles missing coordinates

## Data Model

Coordinates stored in `Sample` model:
```prisma
model Sample {
  lat  Float?
  lng  Float?
  siteName String
  // ... other fields
}
```

## Integration Points

### Sample Detail Page
Located at `/samples/[id]` - displays map in "Collection Site" card section.

### Dynamic Import
SSR-safe implementation prevents hydration errors:
```tsx
const SampleMap = dynamic(
  () => import('@/components/domain/sample-map').then(mod => mod.SampleMap),
  { ssr: false, loading: () => <LoadingSpinner /> }
)
```

## Performance

- Library size: ~40KB gzipped
- No external API calls required
- Tiles cached by browser
- Fast initial render (~100-200ms)

## Future Enhancements

- [ ] Click-to-edit coordinates on map
- [ ] Sample clustering on list view
- [ ] Custom markers by sample type
- [ ] Multi-sample overview map
- [ ] Offline tile caching
