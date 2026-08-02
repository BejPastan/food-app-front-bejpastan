import React, { use, useCallback, useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../Basic/Text";
import { StyleSheet } from 'react-native';
import { getColor } from "@/constants/Colors";
import { Spacing } from "@/constants/Sizes";
import { UserMealWithData } from "@/models/UserMeal";
import { GenericTileProp } from "../Basic/Search/GenericTile";

export interface UserMealProp extends GenericTileProp<UserMealWithData> {
}

export default function UserMealTile({ data, onPress }: UserMealProp) {

    const [rotation , setRotation] = React.useState<number>(0);
    useEffect(() => {
        setRotation(randomRotation());
    }, []);

    function randomRotation(): number {
        const min = -2; // Minimum rotation in degrees
        const max = 2;  // Maximum rotation in degrees
        return Math.random() * (max - min) + min;
    }
    
    const handleSelect = useCallback(() => {
        console.log("UserMealTile selected with recipeId:", data.recipeId);
        if(onPress)
        {
            onPress(data.recipeId);
        }
    }, [data.recipeId, onPress]);
    
    const rotationStyle = {
        transform: [{ rotate: `${rotation}deg` }],
    };

    return (
        <View style={[style.container, rotationStyle]}>
            <TouchableOpacity onPress={handleSelect} activeOpacity={0.7} style = {style.touchable}>
                <View style={style.magnetContainer}>
                    <View style={style.magnet}/>
                </View>
                <Text 
                    content={data.name}            
                    type="subtitle"
                    variant="paper-prim"
                    mode="hand"/>
                <Text 
                    content={`${data.time} min`}            
                    type="caption"
                    variant="paper-sec"
                    mode="hand"/>
                <Text 
                    content={`Portions: ${data.portion}`}            
                    type="caption"
                    variant="paper-prim"
                    mode="hand"/>
            </TouchableOpacity>
        </View>
    )
}


//#region Styles
    const style = StyleSheet.create({
        container: {
            backgroundColor: getColor('paper'),
            maxWidth: 200,
            gap: 5,
            elevation: 15,
        },
        magnetContainer: {
            position: 'absolute',
            top: 4,
            left: '55%',
            width: 12,
            height: 12,
            borderRadius: 6,
            zIndex: 1,
            backgroundColor: getColor('magnet-shadow')
        },
        magnet: {
            position: 'relative',
            top: -2,
            width: '100%',
            height: '100%',
            borderRadius: 6,
            zIndex: 1,
            backgroundColor: getColor('magnet')
        },
        touchable: {
            padding: Spacing.md
        }
    });
//#endregion