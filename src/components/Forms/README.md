# Forms Components

Form wrappers, form fields, and form-specific components.

## Files

```
Forms/
├── Form.vue              # Form container wrapper with layout styles
├── Form.css              # CSS styles for Form component
├── NewPasswordForm.vue   # Password reset form with token validation
├── foodForm.tsx          # Food form (React Native, not yet ported)
├── mealForm.vue          # Meal form (Vue 3 SFC)
├── recipeForm.vue        # Recipe form - simplified: name, time, meals (Vue 3 SFC)
├── unitForm.tsx          # Unit form (React Native, not yet ported)
└── RecipeElements.tsx    # Recipe form elements (React Native, not yet ported)
```

## Element Types

| Component | Type | Status |
|---|---|---|
| Form | Layout | Vue 3 SFC — Form container with CSS classes for sections, inputs, buttons |
| NewPasswordForm | Form | Vue 3 SFC — Password reset with token, validation, and success state |
| foodForm | Form | React Native — Food CRUD form |
| mealForm | Form | Vue 3 SFC — Meal CRUD form |
| recipeForm | Form | Vue 3 SFC — Recipe form (simplified: name, time, meals) |
| unitForm | Form | React Native — Unit CRUD form |
| RecipeElements | Form | React Native — Recipe form sub-elements |