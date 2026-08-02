import Button from '@/components/Basic/Button'
import Input from '@/components/Basic/Input'
import { Text } from '@/components/Basic/Text'
import { Messages } from '@/constants/Messages'
import { Spacing } from '@/constants/Sizes'
import { ValidationMessage } from '@/models/UtilityModels'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { CreateFood, Food, foodService, UpdateFood } from '../../../models/Food'
import { FoodType, foodTypeService } from '../../../models/FoodType'
import ErrorMessage from '../../Basic/ErrorMessage'
import LoadingIndicator from '../../Basic/LoadingIndicator'
import SearchableDropdown, { DropdownItem } from '../../Basic/SearchableDropdown'
import { Form, FormContentProps, formStyle } from './form'
import { getColor } from '@/constants/Colors'

type fieldTypes = "name" | "foodTypeId" | "foodType"

export interface FoodFormProps extends FormContentProps {
    id?: string;
}

export default function FoodForm(params: FoodFormProps) {
    const foodId:string = params.id || 0;
    const [currentFood, setCurrentFood] = useState<Food>({} as Food);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [validationMessages, setValidationMessages] = useState<ValidationMessage<fieldTypes>[]>([]);
    const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
    const [isFoodTypesLoading, setIsFoodTypesLoading] = useState<boolean>(false);
    const [foodTypeSearchError, setTypeSearchError]= useState<string>("");

    async function fetchFood() {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        const foodIdNum = Number(foodId)
        if (foodIdNum > 0) {
            const food = await foodService.getById(foodIdNum)
            setCurrentFood(food)
        } else {
            const food: Food = {
                id: 0,
                name: "",
                foodTypeId: 0,
                foodType: {} as FoodType
            }
            setCurrentFood(food)
        }
        setIsLoading(false)
    }

    async function searchFoodTypes(query: string) {
        if (isFoodTypesLoading) {
            return
        }
        setIsFoodTypesLoading(true)
        try {
            const response = await foodTypeService.getAll({
                name: query,
                page: 1,
                perPage: 10
            });
            setFoodTypes(response);
        } catch (error) {
            setTypeSearchError(`${Messages.errorMessage} searching food types`)
        }
        setIsFoodTypesLoading(false)
    }

    useEffect(()=>{
        fetchFood();
    }, [foodId])

    const onValueChange = (key: fieldTypes, value: any) => {
        setCurrentFood(prev => ({ ...prev, [key]: value }))
    }

    const handleFoodTypeSelect = (item: DropdownItem<FoodType>) => {
        onValueChange('foodTypeId', item.value.id)
        onValueChange('foodType', item.value)
    }

    const handleAddType = async (typeName: string) => {
        console.log("Adding new food type:", typeName)
        try {
            const newType = await foodTypeService.create({ name: typeName })
            onValueChange('foodTypeId', newType.id)
            onValueChange('foodType', newType)
        } catch (error) {
            console.error('Failed to create food type:', error)
            setErrorMessage("Failed to create new food type")
        }
    }

    //#region data validation
    function validateUpdate(data: UpdateFood): boolean {
        const errors: ValidationMessage<fieldTypes>[] = []
        if (!data.name || data.name.trim() === "") {
            errors.push({ key: "name", message: "Food name is required" })
        }
        if (!data.foodTypeId || data.foodTypeId <= 0) {
            errors.push({ key: "foodTypeId", message: "Food type is required" })
        }

        setValidationMessages(errors)
        return errors.length === 0
    }

    function validateCreate(data: CreateFood): boolean {
        const errors: ValidationMessage<fieldTypes>[] = []
        if (!data.name || data.name.trim() === "") {
            errors.push({ key: "name", message: "Food name is required" })
        }
        if (!data.foodTypeId || data.foodTypeId <= 0) {
            errors.push({ key: "foodTypeId", message: "Food type is required" })
        }

        setValidationMessages(errors)
        return errors.length === 0
    }
    //#endregion

    const handleSave = async () => {
        if (isSaving) return
        
        setIsSaving(true)
        setErrorMessage("")

        try {
            if (currentFood.id > 0) {
                const foodUpdateData: UpdateFood = {
                    name: currentFood.name,
                    foodTypeId: currentFood.foodTypeId
                }
                if (validateUpdate(foodUpdateData)) {
                    await foodService.update(currentFood.id, foodUpdateData)
                } else {
                    setErrorMessage("Some required fields are not filled")
                }
            } else {
                const foodCreateData: CreateFood = {
                    name: currentFood.name,
                    foodTypeId: currentFood.foodTypeId
                }
                if (validateCreate(foodCreateData)) {
                    await foodService.create(foodCreateData)
                } else {
                    setErrorMessage("Some required fields are not filled")
                }
            }
        } catch (error) {
            setErrorMessage("Failed to save food item")
            console.error('Save error:', error)
        } finally {
            setIsSaving(false)
            params.onSubmit?.();
        }
    }

    function getValidationMessage(key: fieldTypes) {
        const vm = validationMessages.find(v => v.key === key)
        if (vm == null || vm == undefined) {
            return <></>
        } else {
            return (<Text type='caption' variant='warning' content={vm.message}/>)
        }
    }

    const foodTypeToDropdownItem = (items: FoodType[]): DropdownItem<FoodType>[] => {
        return items?.map(i => ({ value: i, label: i?.name })) || []
    }

    return (
        <>
            {isLoading ? (
                <LoadingIndicator/>
            ) : (
                <Form>
                    <View style={formStyle.sectionContainer}>
                        <Text type='title' variant='prim-prim' content='Food'/>
                                            
                        <Input 
                            value={currentFood.name} 
                            placeholder="Food name" 
                            onChangeText={(newText: string) => onValueChange('name', newText)}
                            variant='paper'
                        />
                        {getValidationMessage("name")}
                        
                        <View style={styles.inputContainer}>
                            <Text type='body' content='Food Type'/>
                            <SearchableDropdown<FoodType>
                                placeholder="Search food types..."
                                items={foodTypeToDropdownItem(foodTypes)}
                                onSearch={searchFoodTypes}
                                onSelect={handleFoodTypeSelect}
                                onConfirm={handleAddType}
                                selectedValue={currentFood.foodType ? foodTypeToDropdownItem([currentFood.foodType])[0] : undefined}
                                isSearching={isFoodTypesLoading}
                                errorMessage={foodTypeSearchError}
                                inputStyle='paper'
                            />
                        </View>
                        {getValidationMessage("foodTypeId")}
                        
                    </View>
                    <View style={formStyle.buttonContainer}>
                        <Button 
                            label={isSaving ? 'Saving...' : 'Save'} 
                            onPress={handleSave}
                            disabled={isSaving}
                        />
                    </View>
                </Form>
            )}
            <ErrorMessage message={errorMessage} visible={errorMessage !== ""}/>
            </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inputContainer: {
        gap: Spacing.sm,
        zIndex: 10
    }
})
