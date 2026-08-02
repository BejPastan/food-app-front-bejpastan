# Navigation Components

Bottom navigation bar and navigation items for the app.

## Files

```
Navigation/
├── BottomNavigation.vue  # Bottom navigation bar with user nav items
├── NavigationItem.vue    # Individual navigation item with active state
└── WeekPicker.vue        # Week picker with previous/next navigation
```

## Element Types

| Component | Type | Description |
|---|---|---|
| BottomNavigation | Layout | Horizontal navigation bar with icons, renders NavigationItem for each route |
| NavigationItem | Action | Icon button for a route with active/inactive state |
| WeekPicker | Form | Week selection picker with previous/next navigation (Vue 3 SFC) |
