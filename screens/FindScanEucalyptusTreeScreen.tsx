import * as React from 'react';
import {useState, useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Camera, Image} from 'react-native-pytorch-core';
import {SafeAreaView} from 'react-native-safe-area-context';
import classifyImage from '../components/ImageClassifier';
import Bubble from '../components/Bubble';
import {useFocusEffect} from '@react-navigation/native';

import {RootStackParamList} from '../types';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import globalStyles from '../constants/globalStyles';

export default function FindScanEucalyptusTreeScreen({
  navigation,
}: NativeStackScreenProps<RootStackParamList, 'FindScanEucalyptusTreeScreen'>) {
  const findTreeText =
    'Go find and scan a eucalyptus tree to start the lesson.\n\nEucalyptus leaves are long and thin, with a slight bulge in the middle.';
  const viewTreeText = 'View eucalyptus tree photos';
  const incorrectTreeText =
    'This doesn’t seem like a eucalyptus tree. Take a closer look at the reference photos.';
  const correctTreeText = 'Great job! You have found a eucalyptus tree.';
  const wouldYouLikeToLearnText =
    'Would you like to learn more about the tree?';

  const [scanningStarted, setScanningStarted] = useState(false);
  const [imageClass, setImageClass] = useState<string | null>(null);
  const [cameraKey, setCameraKey] = useState<number>(0);

  // The PTL camera has a bug where it shows a black screen when focus is returned after navigating away.
  // This is a hack to force the camera to unmount and remount when the screen is refocused.
  const bumpCameraKey = useCallback(() => {
    setCameraKey(key => key + 1);
  }, []);
  useFocusEffect(bumpCameraKey);

  // Function to handle images whenever the user presses the capture button
  async function handleImage(image: Image) {
    setScanningStarted(true);
    setImageClass(null);
    try {
      const result = await classifyImage(image);
      console.log('Image classification result:', result);
      setImageClass(result);
      image.release();
    } catch (error) {
      console.log(error);
    }
  }

  const messageElements = [];

  if (!scanningStarted) {
    messageElements.push(
      <Text style={styles.messageText}>{findTreeText}</Text>,
      <TouchableOpacity
        onPress={() => navigation.navigate('SampleEucalyptusTreesScreen')}
      >
        <Text style={styles.linkText}>{viewTreeText}</Text>
      </TouchableOpacity>,
    );
  }

  if (
    scanningStarted &&
    imageClass &&
    imageClass.indexOf('eucalyptus') === -1
  ) {
    messageElements.push(
      <Text style={styles.messageText}>{incorrectTreeText}</Text>,
      <TouchableOpacity
        onPress={() => navigation.navigate('SampleEucalyptusTreesScreen')}
      >
        <Text style={styles.linkText}>{viewTreeText}</Text>
      </TouchableOpacity>,
    );

    messageElements.push(
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('LessonContentScreen');
        }}
      >
        <Text style={styles.linkText}>{'Skip to the lesson'}</Text>
      </TouchableOpacity>,
    );
  }

  if (imageClass && imageClass.indexOf('eucalyptus') === 0) {
    messageElements.push(
      <Text style={styles.messageText}>{correctTreeText}</Text>,
    );

    messageElements.push(
      <Text style={styles.messageText}>{wouldYouLikeToLearnText}</Text>,
    );

    messageElements.push(
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('LessonContentScreen');
        }}
      >
        <Text style={styles.linkText}>{'Go to the lesson'}</Text>
      </TouchableOpacity>,
    );
  }

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[
        StyleSheet.absoluteFill,
        globalStyles.androidExtraSafeAreaPadding,
      ]}
    >
      <Camera
        style={[StyleSheet.absoluteFill]}
        onCapture={handleImage}
        key={cameraKey}
        hideFlipButton={true}
      />
      <View style={styles.mainContainer} pointerEvents="box-none">
        {imageClass && (
          <View style={styles.bubbleContainer}>
            <Bubble text={imageClass} />
          </View>
        )}
        <View style={styles.messageHolder}>
          {messageElements.map((element, index) => (
            <View
              key={index}
              style={
                index !== messageElements.length - 1
                  ? styles.messageParagraphBottomSpacing
                  : null
              }
            >
              {element}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    position: 'relative',
    height: '100%',
  },

  bubbleContainer: {
    marginTop: 10,
    alignItems: 'center',
  },

  messageText: {
    color: 'white',
    fontSize: 16,
  },
  linkText: {
    color: 'background: rgba(70, 140, 247, 1)',
    fontSize: 16,
  },
  messageParagraphBottomSpacing: {
    marginBottom: 24,
  },
  messageHolder: {
    position: 'absolute',
    width: '70%',
    bottom: 150,
    left: 24,
    backgroundColor: '#121212',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
});
