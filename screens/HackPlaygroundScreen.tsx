import * as React from 'react';
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

export default function HackPlaygroundScreen({}: NativeStackScreenProps<
  RootStackParamList,
  'HackPlaygroundScreen'
>) {
  return (
    <SafeAreaView
      style={[styles.mainContainer, globalStyles.androidExtraSafeAreaPadding]}
    >
      <View style={styles.headingSection}>
        <Text style={styles.headingText}>Hack Playground Screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
