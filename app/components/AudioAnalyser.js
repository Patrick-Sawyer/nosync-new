import React, { Component } from "react";
import { View, StyleSheet, Text, Platform } from "react-native";
import {WebView} from 'react-native-webview';
// import { withWebViewBridge } from 'react-native-webview-bridge-seamless';
var RNFS = require('react-native-fs');
// import { WebView } from 'react-native-webview';
// import { renderToString } from 'react-dom/server'
// var ab2str = require('arraybuffer-to-string')
// export const WebViewWithBridge = withWebViewBridge(WebView);
// import WaveSurferScript from "../wavesurfer";
// import Waveform from "./Waveform";

const runFirst = `
  window.isNativeApp = true;
  true;
`;

const injectedJavaScript = `

     window.AudioContext = window.AudioContext || window.webkitAudioContext;
     const audioContext = new AudioContext();
     const getBuffer = url => {
       fetch(url)
         .then(response => response.arrayBuffer())
         .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
         .then(audioBuffer => filterData(audioBuffer))
         .catch(error => window.ReactNativeWebView.postMessage(error))
     };
     
     const createCanvas = (value) => {
         let canvas = document.createElement("canvas");
         canvas.width = 1;
         canvas.height = Math.abs(value) * 500;
         let ctx = canvas.getContext("2d");
         ctx.fillStyle = "violet";
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         return canvas;
       }

     const filterData = audioBuffer => {
       console.log("filterData called");
       const rawData = audioBuffer.getChannelData(0);
       const samples = 10000; 
       const blockSize = Math.floor(rawData.length / samples);
       let filterData = [];
       for (let i = 0; i < samples; i++) {
        let segment = blockSize * i;
        let value = rawData[segment];
        filterData.push(value);
        document.getElementById("waveform").appendChild(createCanvas(value))
       }
       window.ReactNativeWebView.postMessage(JSON.stringify(filterData).substring(0,100));
     }

     getBuffer("file:///storage/emulated/0/Music/Hijacked%20(Audiojack%20Remix).mp3")

     `;
///file:///storage/emulated/0/Music/Hijacked (Audiojack Remix).mp3
//http://ia902606.us.archive.org/35/items/shortpoetry_047_librivox/song_cjrg_teasdale_64kb.mp3

class AudioAnalyser extends Component {
  state = { 
    uri: this.props.uri,
    buffer: null
  }

  componentDidUpdate = (prevProps) => {
    if (this.props.uri !== prevProps.uri) {
        this.setState({
          uri: this.props.uri
        })
        console.log(this.state.uri)
    }
  }

  onMessage = (message) => {
    console.log("FROM WEBVIEW: " + message.nativeEvent.data)
  }

  waveform = () => {
    return (
        <WebView
          originWhitelist={'["*"]'}
          ref={webview => {this.webview = webview; }}
          injectedJavaScriptBeforeContentLoaded={runFirst}
          javaScriptEnabled = {true}
          domStorageEnabled={true}
          scalesPageToFit={false}
          scrollEnabled={false}
          originWhitelist={['*']}
          injectedJavaScript={injectedJavaScript}
          allowUniversalAccessFromFileURLs={true}
          allowFileAccessFromFileURLs={true}
          allowFileAccess={true}
          allowingReadAccessToURL
          allowsInlineMediaPlayback 
          useWebKit={true}
          reactNativeApi={{
            getToken: this.getToken
          }} 
          onMessage={this.onMessage}            
          //source={{ uri: "http://www.disco-computer.com/test.html" }} 
          source={{html: `
          <html>
            <style>
              html, body, div {
                  margin: 0px;
                  padding: 0px;
              };
              canvas {
                  margin: auto;
              }
              #waveform {
                 display: flex;
                justify-content: center;
                align-items: center;
              }
            </style>
            <body style="background-color: #2a282b;" >
              <div id="waveform" style="width: 10000px;"></div>
            </body>
          </html>
          `}}
        />
     )
  }
  
  render = () => { 
    return ( 
      <View style={styles.container}>
        {this.waveform()}
      </View>
     );
  }
}
 
export default AudioAnalyser;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#322f33",
    borderRadius: 5,
  }
})





