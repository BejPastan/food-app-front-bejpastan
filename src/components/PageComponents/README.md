# Page Components

Page-level layout components (headers, modals).

## Files

```
PageComponents/
├── Header.vue                    # App header with greeting and current kitchen selector
├── KitchenSelector.vue           # Searchable dropdown to pick the current kitchen (only way to switch it)
├── KitchenManagementPanel.vue    # Kitchen name editing and member roles
└── ExpandedModal.vue             # Expanded modal with slide-up animation
```

## Element Types

| Component | Type | Description |
|---|---|---|
| Header | Layout | Top header with user greeting, kitchen selector and kitchen management link |
| KitchenSelector | Form | Searchable dropdown selecting the current kitchen, searches on the server (`GET /api/kitchen?name=`) |
| KitchenManagementPanel | Form | Kitchen name editing and member list with role management |
| ExpandedModal | Layout | Modal overlay for expanded content (Vue 3 SFC) |
