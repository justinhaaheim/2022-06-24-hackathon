import * as React from 'react';
import throttle from 'lodash.throttle';
import {
  ImageBackground,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type {RootStackParamList} from '../types';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import globalStyles from '../constants/globalStyles';
import classifyImage from '../components/GeneralImageClassifier';
import {Image as ImagePT, Camera} from 'react-native-pytorch-core';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useCallback, useMemo, useState} from 'react';
import {useFocusEffect} from '@react-navigation/native';

let frameRate: Array<number> = [];

export default function HackPlaygroundScreen({}: NativeStackScreenProps<
  RootStackParamList,
  'HackPlaygroundScreen'
>) {
  // Create a React state to store the top class returned from the
  // classifyImage function
  const [imageClass, setImageClass] = useState('[NO IMAGE CLASS SET]');
  const [cameraKey, setCameraKey] = useState<number>(0);
  const [playerX, setPlayerX] = useState<number>(5);
  const [playerY, setPlayerY] = useState<number>(5);

  const cameraRef = React.useRef<Camera>(null);
  // Safe area insets to compensate for notches and bottom bars
  const insets = useSafeAreaInsets();

  // The PTL camera has a bug where it shows a black screen when focus is returned after navigating away.
  // This is a hack to force the camera to unmount and remount when the screen is refocused.
  const bumpCameraKey = useCallback(() => {
    setCameraKey(key => key + 1);
  }, []);
  useFocusEffect(bumpCameraKey);

  const onFrameThrottled = useMemo(() => {
    const onFrame = async (image: ImagePT | null) => {
      frameRate.push(performance.now());
      frameRate = frameRate.slice(-20);
      if (frameRate.length > 2) {
        console.log(
          'Framerate:',
          (frameRate.length /
            (frameRate[frameRate.length - 1] - frameRate[0])) *
            1000,
        );
      }

      if (image == null) {
        console.warn('Image returned from PTL camera is null');
        return;
      }
      try {
        const result = await classifyImage(image);
        console.log('Image classification result:', result);

        setImageClass(result);
        if (result.indexOf('guitar') !== -1) {
          setPlayerX(prevX => prevX - 20);
        } else if (result.indexOf('mug') !== -1) {
          setPlayerX(prevX => prevX + 20);
        }
        image.release();
      } catch (error) {
        console.error(error);
      } finally {
        image.release();
      }
    };

    return throttle(onFrame, 500);
  }, []);

  // Function to handle images whenever the user presses the capture button
  async function handleImage(image: ImagePT) {
    console.log('onCapture...');
    // Call the classify image function with the camera image
    const result = await classifyImage(image);
    console.log('image classified');
    // Set result as top class label state
    setImageClass(result);
    // Release the image from memory
    image.release();
  }

  return (
    <SafeAreaView
      style={[styles.mainContainer, globalStyles.androidExtraSafeAreaPadding]}
    >
      <View style={{height: '50%'}}>
        {/* Render camara and make it parent filling */}
        <Camera
          ref={cameraRef}
          style={[StyleSheet.absoluteFill, {bottom: insets.bottom}]}
          key={cameraKey}
          // Add handle image callback on the camera component
          // onCapture={handleImage}
          onFrame={onFrameThrottled}
          hideCaptureButton={true}
          // targetResolution={{width: 480, height: 640}}
        />
        {/* Label container with custom render style and a text */}
        <View style={styles.labelContainer}>
          {/* Change the text to render the top class label */}
          <Text>{imageClass}</Text>
        </View>
      </View>
      <View style={styles.gameContainer}>
        <View
          style={{
            backgroundColor: 'red',
            left: playerX,
            bottom: playerY,
            height: 20,
            width: 20,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gameContainer: {backgroundColor: 'green', height: '100%'},
  labelContainer: {
    padding: 20,
    margin: 20,
    marginTop: 40,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  mainContainer: {
    flex: 1,
  },
  headingText: {
    marginTop: 10,
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  normalText: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  headingSection: {
    marginLeft: 24,
    marginRight: 24,
  },
  startButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  button: {
    height: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    marginLeft: 24,
    marginRight: 24,
  },
  buttonPosition: {
    position: 'absolute',
    bottom: 84,
    width: '100%',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  imageSection: {
    backgroundColor: '#ffffff',
    marginTop: 15,
    flex: 1,
  },
  normalTextSection: {
    fontSize: 13,
    color: '#FFFFFF',
    marginTop: 10,
    marginLeft: 24,
    marginRight: 24,
  },
});
