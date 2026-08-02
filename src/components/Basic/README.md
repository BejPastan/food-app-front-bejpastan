# Basic Components

Core UI building blocks for the food app.

## Files

```
Basic/
├── Text.vue              # Text component with variants (prim/sec/paper/warning) and types (title/body/caption)
├── Text.css              # Typography classes for Text component
├── ErrorMessage.vue      # Error message display with visibility toggle
├── LoadingIndicator.vue  # Animated 3-dot loading indicator
├── CenteredLoadingIndicator.vue  # Centered spinner + message
├── Input/                # Input subcomponents
└── Search/               # Search subcomponents
```

## Element Types

| Component | Type | Description |
|---|---|---|
| Text | Display | Styled text with color variants and typography modes |
| ErrorMessage | Feedback | Error message with warning styling |
| LoadingIndicator | Feedback | Animated 3-dot bouncing loader |
| CenteredLoadingIndicator | Feedback | Centered spinner + loading message |
| Input | Form | Text input with password toggle and confirm button |
| Button | Action | Pressable button with 3D press effect |
| ClickableText | Action | Clickable text link |
| Switch | Action | Toggle switch with smooth animation |
| SearchableDropdown | Form | Dropdown with search and debounce |
| SearchableList | Form | Searchable list with tile rendering |
| SearchableMultiSelect | Form | Multi-select with searchable dropdown |
| GenericTile | Layout | Type definition for generic tile components |

## Status: Vue 3 SFCs
</arg_value>
</write_to_file>