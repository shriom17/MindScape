import React, { useState, useRef, useEffect } from 'react';
import './home.css';
import ChatBot from '../../components/chatbot/Chatbot';
import Navbar from '../../components/Navbar/navbar';
import * as faceapi from 'face-api.js';

const Home = () => {
  const [expressionResult, setExpressionResult] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = 'https://justadudewhohacks.github.io/face-api.js/models';
      await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
      await faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL);
      setModelsLoaded(true);
    };
    loadModels();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleScanFace = async () => {
    if (!modelsLoaded) return;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setCameraActive(true);
        }
        setTimeout(async () => {
          const detection = await faceapi
            .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
            .withFaceExpressions();
          if (detection && detection.expressions) {
            const expressions = detection.expressions;
            const maxValue = Math.max(...Object.values(expressions));
            const expression = Object.keys(expressions).find(
              (item) => expressions[item] === maxValue
            );
            setExpressionResult(expression);
          } else {
            setExpressionResult('No face detected');
          }
        }, 1000);
      } catch (err) {
        console.error('Error accessing camera:', err);
        setExpressionResult('Error accessing camera');
      }
    }
  };

  const handleStopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  return (
    <div className="home">
      <Navbar />
      <div className="home-layout">
        <div className="main-content">
          <div className="prompt-section">
            <h1>Welcome to MindScape</h1>
            <h2>What is going on your mind?</h2>
           <button
                className="scan-btn"
                onClick={handleScanFace}
                disabled={!modelsLoaded || cameraActive}
              >
                {modelsLoaded ? "Scan Here" : "Loading models..."}
              </button>
              {cameraActive && (
                <button
                  className="stop-btn"
                  onClick={handleStopCamera}
                  style={{ marginLeft: '10px' }}
                >
                  Stop Camera
                </button>

            )}
            <video ref={videoRef} width="320" height="240" autoPlay muted style={{ display: 'block', marginTop: '20px' }} />
            {expressionResult && <div>Expression: {expressionResult}</div>}
          </div>
        </div>
        <div className="chat-panel">
          <ChatBot />
        </div>
      </div>
    </div>
  );
};

export default Home;