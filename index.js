/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { RachaWidget } from './src/widgets/RachaWidget';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.registerComponent('RachaWidget', () => RachaWidget);
