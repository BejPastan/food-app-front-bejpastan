import Button from '@/components/Basic/Button'
import Input from '@/components/Basic/Input'
import { Text } from '@/components/Basic/Text'
import { Spacing } from '@/constants/Sizes'
import { ValidationMessage } from '@/models/UtilityModels'
import { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { CreateUnit, Unit, unitService, UpdateUnit } from '../../../models/Unit'
import ErrorMessage from '../../Basic/ErrorMessage'
import LoadingIndicator from '../../Basic/LoadingIndicator'
import { Form, FormContentProps, formStyle } from './form'

type fieldTypes = "name" | "volumeEquivalent"| "desc";

export interface UnitFormProps extends FormContentProps{
    id?: string;
}

export default function UnitForm(props: UnitFormProps) {
    const unitId = props.id || 0;
    const [currentUnit, setCurrentUnit] = useState<Unit>({} as Unit)
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isSaving, setIsSaving] = useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>("")
    const [validationMessages, setValidationMessages] = useState<ValidationMessage<fieldTypes>[]>([])

    async function fetchUnit() {
        if (isLoading) {
            return
        }
        setIsLoading(true)
        const unitIdNum = Number(unitId)
        if (unitIdNum > 0) {
            const unit = await unitService.getById(unitIdNum)
            setCurrentUnit(unit)
        } else {
            const unit: Unit = {
                id: 0,
                name: "",
                volumeEquivalent: 0,
                desc:""
            }
            setCurrentUnit(unit)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchUnit()
    }, [unitId])

    const onValueChange = (key: fieldTypes, value: any) => {
        setCurrentUnit(prev => ({ ...prev, [key]: value }))
    }

    //#region data validation
    function validateUpdate(data: UpdateUnit): boolean {
        const errors: ValidationMessage<fieldTypes>[] = []
        if (!data.name || data.name.trim() === "") {
            errors.push({ key: "name", message: "Unit name is required" })
        }
        if (!data.volumeEquivalent || data.volumeEquivalent <= 0) {
            errors.push({ key: "volumeEquivalent", message: "Volume equivalent is required and must be greater than 0" })
        }

        setValidationMessages(errors)
        return errors.length === 0
    }

    function validateCreate(data: CreateUnit): boolean {
        const errors: ValidationMessage<fieldTypes>[] = []
        if (!data.name || data.name.trim() === "") {
            errors.push({ key: "name", message: "Unit name is required" })
        }
        if (!data.volumeEquivalent || data.volumeEquivalent <= 0) {
            errors.push({ key: "volumeEquivalent", message: "Volume equivalent is required and must be greater than 0" })
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
            if (currentUnit.id > 0) {
                const unitUpdateData: UpdateUnit = {
                    name: currentUnit.name,
                    volumeEquivalent: currentUnit.volumeEquivalent
                }
                if (validateUpdate(unitUpdateData)) {
                    await unitService.update(currentUnit.id, unitUpdateData)
                } else {
                    setErrorMessage("Some required fields are not filled")
                }
            } else {
                const unitCreateData: CreateUnit = {
                    name: currentUnit.name,
                    volumeEquivalent: currentUnit.volumeEquivalent,
                    desc:currentUnit.desc
                }
                if (validateCreate(unitCreateData)) {
                    await unitService.create(unitCreateData)
                } else {
                    setErrorMessage("Some required fields are not filled")
                }
            }
        } catch (error) {
            setErrorMessage("Failed to save unit")
        } finally {
            setIsSaving(false)
            props.onSubmit?.();
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

    return (
        <>
            {isLoading ? (
                <LoadingIndicator/>
            ) : (
                <Form>
                    <View style={formStyle.sectionContainer}>
                        <Text type='title' variant='prim-prim' content='Unit'/>
                        <Input 
                            value={currentUnit.name} 
                            placeholder="Unit name" 
                            onChangeText={(newText: string) => onValueChange('name', newText)}
                            disabled={isSaving}
                            variant='paper'
                        />
                        {getValidationMessage("name")}

                        <View style={styles.inputContainer}>
                            <Text type='body' content='Volume Equivalent'/>
                            <Input 
                                value={currentUnit.volumeEquivalent?.toString()} 
                                placeholder="Volume equivalent" 
                                onChangeText={(newText: string) => onValueChange('volumeEquivalent', parseFloat(newText) || 0)}
                                inputType='number'
                                disabled={isSaving}
                                variant='paper'
                            />
                            {getValidationMessage("volumeEquivalent")}
                        </View>

                        <View style={styles.inputContainer}>
                            <Text type='body' content='Description'/>
                            <Input 
                                value={currentUnit.desc || ""} 
                                placeholder="Description (optional)" 
                                onChangeText={(newText: string) => onValueChange('desc', newText)}
                                disabled={isSaving}
                                variant='paper'
                                multiline={true}
                            />
                        </View>
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
        padding: Spacing.lg,
    },
    inputContainer: {
        gap: Spacing.sm,
    }
})
