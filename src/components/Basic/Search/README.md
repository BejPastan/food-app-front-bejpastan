# Search Components

Search and selection UI components for forms.

## Files

```
Search/
├── GenericTile.ts             # Type definition for generic tile components
├── SearchableDropdown.vue     # Dropdown with search, debounce, and modal overlay
├── SearchableList.vue         # Searchable list with tile rendering and loading
└── SearchableMultiSelect.vue  # Multi-select with searchable dropdown
```

## Element Types

| Component | Type | Description |
|---|---|---|
| GenericTile | Layout | Type definition for tile components used in SearchableList |
| SearchableDropdown | Form | Searchable dropdown with debounced search and modal overlay |
| SearchableList | Form | List with search input, loading indicator, and tile rendering |
| SearchableMultiSelect | Form | Multi-select with removable selected items and searchable dropdown |