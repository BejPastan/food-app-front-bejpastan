import React, { useState, useCallback, useMemo, Component, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Button from '@/components/Basic/Button';
import { Spacing, BorderRadius, BorderSize, ButtonSizes } from '@/constants/Sizes';
import { textElements } from '@/constants/Typography';
import { getColor } from '@/constants/Colors';
import { Text } from '../Basic/Text';

interface WeekPickerProps {
  initialDate?: Date;
  onWeekChange?: (startDate: Date, endDate: Date) => void;
}

export default function WeekPicker({ 
  initialDate = new Date(), 
  onWeekChange
}: WeekPickerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [weekRange, setWeekRange] = useState<{start: Date, end: Date}>({
    start: getWeekStart(initialDate),
    end: getWeekEnd(initialDate)
  });

  function getWeekStart (date: Date): Date{
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  function getWeekEnd (date: Date): Date 
  {
    const start = getWeekStart(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
  }

  useEffect(() => {
    console.log("Calculating week range for date: ", currentDate);
    const start = getWeekStart(currentDate);
    const end = getWeekEnd(currentDate);
    setWeekRange({ start, end });
    onWeekChange && onWeekChange(start, end);
  }, [currentDate]);

  function formatDate (date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString(undefined, options);
  }

  function goPrevious()
  {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  }

  function goNext()
  {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const weekDisplayText = `${formatDate(weekRange.start)} - ${formatDate(weekRange.end)}`;

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button 
          label="" 
          leadingIcon="chevron-back"
          onPress={goPrevious}
          size='default'
          buttonType="sec"
        />
      </View>
      
      <View style={styles.weekDisplay}>
        <Text content={weekDisplayText}/>
      </View>

      <View style={styles.buttonContainer}>
        <Button 
          endIcon="chevron-forward"
          onPress={goNext}
          size="default"
          buttonType="sec"
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: getColor('primary'),
    maxWidth: 400,
    height: 64,
    width: '100%',
    marginHorizontal: 'auto'
  },
  weekDisplay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },
  weekText: {
    color: getColor('text-prim-prim'),
    textAlign: 'center',
    fontWeight: '600',
  },
  buttonContainer: {
    alignItems: 'center',
    width: ButtonSizes.default.height
  }
});