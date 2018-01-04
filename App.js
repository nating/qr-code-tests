import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import CustomQRCode from './src/CustomQRCode';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <CustomQRCode logoSize={100} logo={require('./skel.png')} codeStyle='dot'/>
        <View height={30}></View>
        <CustomQRCode codeStyle='square'/>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
