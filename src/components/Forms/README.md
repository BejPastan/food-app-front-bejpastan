# Forms Components

Form wrappers, form fields, and form-specific components.

## Files

```
Forms/
├── Form.vue              # Form container wrapper with layout styles
├── Form.css              # CSS styles for Form component
├── NewPasswordForm.vue   # Password reset form with token validation
├── foodForm.vue          # Food form - name, food type (Vue 3 SFC)
├── mealForm.vue          # Meal form (Vue 3 SFC)
├── recipeForm.vue        # Recipe form - simplified: name, time, meals (Vue 3 SFC)
├── unitForm.vue          # Unit form - name, volume equivalent, description (Vue 3 SFC)
└── RecipeElements.tsx    # Recipe form elements (React Native, not yet ported)
```

## Element Types

| Component | Type | Status |
|---|---|---|
| Form | Layout | Vue 3 SFC — Form container with CSS classes for sections, inputs, buttons |
| NewPasswordForm | Form | Vue 3 SFC — Password reset with token, validation, and success state |
| foodForm | Form | Vue 3 SFC — Food CRUD form (name, food type) |
| mealForm | Form | Vue 3 SFC — Meal CRUD form |
| recipeForm | Form | Vue 3 SFC — Recipe form (simplified: name, time, meals) |
| unitForm | Form | Vue 3 SFC — Unit CRUD form (name, volume equivalent, description) |
| RecipeElements | Form | React Native — Recipe form sub-elements |