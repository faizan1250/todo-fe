import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import { BlurView } from 'expo-blur';
import { RootStackParamList } from '../navigation/types';

const { height } = Dimensions.get('window');

export default function NavHome() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const open = useSharedValue(0);

  const [labelIndex, setLabelIndex] = useState(-1);
  const [showBlur, setShowBlur] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const mainLottieRef = useRef<LottieView>(null);
  const optionRefs = useRef<LottieView[]>([]);

  const playAll = () => {
    mainLottieRef.current?.play();
    optionRefs.current.forEach((ref) => ref?.play());
  };

  const resetAll = () => {
    mainLottieRef.current?.reset();
    optionRefs.current.forEach((ref) => ref?.reset());
  };

  useAnimatedReaction(
    () => open.value,
    (value) => {
      runOnJS(setShowBlur)(value === 1);
      runOnJS(setIsOpen)(value === 1);

      if (value === 1) {
        runOnJS(playAll)();
      } else {
        runOnJS(resetAll)();
      }
    }
  );

  const toggle = () => {
    open.value = open.value ? withTiming(0) : withTiming(1);
  };

  const longPressGesture = (index: number) =>
    Gesture.LongPress()
      .minDuration(200)
      .onStart(() => runOnJS(setLabelIndex)(index))
      .onEnd(() => runOnJS(setLabelIndex)(-1));

  const options = [
    {
      icon: require('../assets/lottie/home.json'), // You'll need a home icon Lottie file
      label: 'Home',
      onPress: () => {
        toggle();
        navigation.navigate('MainDrawer');
      },
    },
   
  ];

  const animatedStyles = (i: number) =>
    useAnimatedStyle(() => {
      const spacing = 70 * (i + 1);
      const translateY = interpolate(open.value, [0, 1], [0, -spacing]);
      return {
        transform: [{ translateY }],
        opacity: open.value,
      };
    });

  return (
    <>
      {showBlur && (
        <BlurView tint="dark" intensity={80} style={StyleSheet.absoluteFill} />
      )}

      <View style={styles.fabContainer}>
        {options.map((opt, i) => (
          <Animated.View key={i} style={[styles.optionWrapper, animatedStyles(i)]}>
            <GestureDetector gesture={longPressGesture(i)}>
              <Pressable onPress={opt.onPress} style={styles.optionBtn}>
                <LottieView
                  ref={(ref) => {
                    optionRefs.current[i] = ref!;
                  }}
                  source={opt.icon}
                  autoPlay={false}
                  loop
                  style={{ width: 40, height: 40 }}
                />
              </Pressable>
            </GestureDetector>
            {labelIndex === i && (
              <View style={styles.labelBox}>
                <Text style={styles.labelText}>{opt.label}</Text>
              </View>
            )}
          </Animated.View>
        ))}

        <Pressable onPress={toggle} style={styles.fabMain}>
          <LottieView
            ref={mainLottieRef}
            source={
              isOpen
                ? require('../assets/lottie/close.json')
                : require('../assets/lottie/home.json') // Different icon for menu
            }
            autoPlay={false}
            loop
            style={{ width: 48, height: 48 }}
          />
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabMain: {
    backgroundColor: '#26dbc3', // You can change the color
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
  },
  optionWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  optionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#26dbc3', // You can change the color
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  labelBox: {
    marginTop: 4,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    elevation: 4,
  },
  labelText: {
    fontSize: 12,
    color: '#000',
    fontWeight: '600',
  },
});