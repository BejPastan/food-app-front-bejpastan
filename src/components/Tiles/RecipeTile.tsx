import { Recipe, RecipeSimplified } from "@/models/Recipe";
import React, { useEffect } from "react";
import { TouchableOpacity, View } from "react-native";
import { Text } from "../Basic/Text";
import { StyleSheet } from 'react-native';
import { getColor } from "@/constants/Colors";
import { Spacing } from "@/constants/Sizes";
import { GenericTile, GenericTileProp } from "../Basic/Search/GenericTile";

export interface RecipeTileProps extends GenericTileProp<RecipeSimplified> {
}

export default function RecipeTile({ data, onPress }: RecipeTileProps) {

    const [rotation , setRotation] = React.useState<number>(0);
    useEffect(() => {
        setRotation(randomRotation());
    }, []);

    function randomRotation(): number {
        const min = -2; // Minimum rotation in degrees
        const max = 2;  // Maximum rotation in degrees
        return Math.random() * (max - min) + min;
    }

//#region Styles
    const style = StyleSheet.create({
        container: {
            transform: [{ rotate: `${rotation}deg` }],
            backgroundColor: getColor('paper'),
            maxWidth: 200,
            gap: 5,
            elevation: 15,
            padding: Spacing.md
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
        }
    });
//#endregion
    return (
        <TouchableOpacity onPress={() => onPress && onPress(data.id)} activeOpacity={0.7} style = {[style.container]}>
                <View style={style.magnetContainer}>
                    <View style={style.magnet}/>
                </View>
                <Text 
                    content={data.name}            
                    type="subtitle"
                    variant="paper-prim"
                    mode="hand"
                />
                <Text 
                    content={`${data.time} min`}            
                    type="caption"
                    variant="paper-sec"
                    mode="hand"
                />
                <Text 
                    content={`Portions: ${data.portion}`}            
                    type="caption"
                    variant="paper-prim"
                    mode="hand"
                />
        </TouchableOpacity>
    )
}