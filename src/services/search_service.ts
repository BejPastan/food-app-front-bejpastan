import { mealService } from "@/models/Meal"
import { recipeService } from "@/models/Recipe"

export const SearchingItems = (search: string, selectedObjectType: string): Promise<any[]> => {
  switch(selectedObjectType) {
    case 'Recipes':
      var params:any = {
        name: search,
        page: 1,
        perPage: 10
      }
      return recipeService.getAll(params)
    case 'Meals':
      var params: any = {
        name: search,
        page: 1,
        perPage: 10
      }
      return mealService.getAll(params)
    default:
      return Promise.resolve([])
  }
}