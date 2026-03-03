/* global jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-camera-kit', () => ({
  Camera: 'Camera',
  CameraType: {
    Back: 'back',
    Front: 'front',
  },
}));

jest.mock('react-native-linear-gradient', () => 'LinearGradient');

jest.mock('react-native-animatable', () => ({
  View: 'AnimatableView',
  Text: 'AnimatableText',
}));

jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => 'Icon');

