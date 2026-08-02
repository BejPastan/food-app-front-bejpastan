import { mealService, type MealListParams } from "@/models/Meal"
import { recipeService, type RecipeListParams } from "@/models/Recipe"

export const SearchingItems = (search: string, selectedObjectType: string): Promise<any[]> => {
  switch(selectedObjectType) {
    case 'Recipes':
      var params:RecipeListParams = {
        name: search,
        page: 1,
        perPage: 10
      }
      return recipeService.getAll(params)
    case 'Meals':
      var params: MealListParams = {
        name: search,
        page: 1,
        perPage: 10
      }
      return mealService.getAll(params)
    default:
      return Promise.resolve([])
  }
}