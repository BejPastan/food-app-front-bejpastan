import { ScrollView, StyleSheet, View } from "react-native"
import UserMealTile from "./UserMealTile"
import { Spacing } from "@/constants/Sizes"
import { UserMealWithData } from "@/models/UserMeal"
import { Text } from "../Basic/Text"
import { router } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import LoadingIndicator from "../Basic/LoadingIndicator"

export interface UserMealListProps {
    recipes: UserMealWithData[],
    isLoading: boolean
}

export default function UserMealList({ recipes, isLoading }: UserMealListProps) {

    //const [groupedRecipes, setGroupedRecipes] = useState<{ date: Date, recipes: UserMealWithData[] }[]>([]);

    function formatDate(date: Date): string {
        const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
        return date.toLocaleDateString(undefined, options);
    }

    function compareDates(date1: Date, date2: Date): boolean {
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    const groupedRecipes = useMemo(()=>{
        function groupRecipesByDate(recipes: UserMealWithData[]): { date: Date, recipes: UserMealWithData[] }[] {
            const grouped: { date: Date, recipes: UserMealWithData[] }[] = [];
            recipes.forEach(recipe => {
                const existingGroup = grouped.find(group => compareDates(group.date, recipe.mealDate));
                if (existingGroup) {
                    existingGroup.recipes.push(recipe);
                } else {
                    grouped.push({ date: recipe.mealDate, recipes: [recipe] });
                    
                }
            });
            return grouped;
        }
        // setGroupedRecipes(groupRecipesByDate(recipes));
        return groupRecipesByDate(recipes);
    }, [recipes]);

    const handlePress = (recipeId:string) =>{
        router.push(`/recipe?recipeId=${recipeId}`);
    }

    console.log(groupedRecipes);

    //#region Styles

    return (
        <ScrollView showsVerticalScrollIndicator={false}>
            {recipes.length<=0 ? (
                <View style={style.container}>
                    {isLoading? (<LoadingIndicator/>):(<Text content={"No meal find for this week"} type="caption" variant="prim-sec"/>)}
                </View>):
                (
                <View style={style.container}>
                {groupedRecipes.map((recipe, idx) => {
                    return (
                        <View key={"group_"+idx}>
                            <Text content={formatDate(recipe.date)} type="subtitle" variant="prim-prim"/>
                            <View style={style.dayContainer} key={"_container_"+idx}>
                                {recipe.recipes.map((r,id) => {
                                    return (<UserMealTile data={r} onPress={handlePress} key={`mealTile_${idx}_${id}`}/>);
                                })}
                            </View>
                        </View>)
                    })
                }
                </View>)
            }
        </ScrollView>
    )
}

const style = StyleSheet.create({
    container: {
        gap: Spacing.md,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.lg,
    },
    dayContainer:{
        gap: Spacing.sm,
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    }
});