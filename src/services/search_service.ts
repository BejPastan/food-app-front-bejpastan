import { mealService } from "@/models/Meal"
import { foodService } from "@/models/Food"
import { recipeService } from "@/models/Recipe"
import { unitService } from "@/models/Unit"

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
    case 'Foods':
      var params: any = {
        name: search,
        page: 1,
        perPage: 10
      }
      return foodService.getAll(params)
    case 'Units':
      var params: any = {
        search: search,
        page: 1,
        perPage: 10
      }
      return unitService.getAll(params)
    default:
      return Promise.resolve([])
  }
}