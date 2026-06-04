import {useRef} from 'react';
import html2canvas from 'html2canvas';
import {notifications} from '@mantine/notifications';

export default function ShareResult({ wpm, accuracy, duration, correctChars, totalChars, onClose }) {
  const resultRef=useRef(null);
  const captureResult = async () => {
    if (!resultRef.current) return null;
    try {
      const canvas = await html2canvas(resultRef.current, {
        scale: 2,
        backgroundColor: '#0e0e0f',
        logging: false,
        useCORS: true
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Error capturing result:', error);
      return null;
    }
  };
  
  const shareOnTwitter = async () => {
    const text = `🎯 I scored ${wpm} WPM with ${accuracy}% accuracy on TypeMaster! 🚀\n\nCan you beat my score?`;
    const url = window.location.href;
    const hashtags = ['TypeMaster', 'TypingTest', 'WPM'];  
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=${hashtags.join(',')}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
    notifications.show({
      title: 'Shared to Twitter',
      message: 'Your result has been shared!',
      color: 'blue',
      autoClose: 3000,
    });
    onClose();
  };
  
  const shareOnTelegram = () => {
    const text = `🎯 I scored ${wpm} WPM with ${accuracy}% accuracy on TypeMaster! Can you beat my score?`;
    const url = window.location.href;  
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    window.open(telegramUrl, '_blank', 'width=550,height=420');
    notifications.show({
      title: 'Shared to Telegram',
      message: 'Your result has been shared!',
      color: 'blue',
      autoClose: 3000,
    });
    onClose();
  };

  const shareOnWhatsApp = () => {
    const text = `🎯 I scored ${wpm} WPM with ${accuracy}% accuracy on TypeMaster! 🚀\n\nCan you beat my score?`;
    const url = window.location.href;    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    window.open(whatsappUrl, '_blank', 'width=550,height=420');
    notifications.show({
      title: 'Shared to WhatsApp',
      message: 'Your result has been shared!',
      color: 'green',
      autoClose: 3000,
    });
    onClose();
  };
  const copyResultText = async () => {
    const resultText = `🏆 TypeMaster Result 🏆\n\n📊 WPM: ${wpm}\n🎯 Accuracy: ${accuracy}%\n⏱️ Time: ${duration}s\n✅ Correct: ${correctChars}/${totalChars}\n\n🚀 Can you beat my score? Play at: ${window.location.href}`;
    try {
      await navigator.clipboard.writeText(resultText);
      notifications.show({
        title: 'Copied!',
        message: 'Result copied to clipboard!',
        color: 'green',
        autoClose: 2000,
      });
      onClose();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to copy text',
        color: 'red',
        autoClose: 2000,
      });
    }
  };
  
  const saveAsImage = async () => {
    const imageData = await captureResult();  
    if (imageData) {
      const link = document.createElement('a');
      link.download = `typemaster-result-${Date.now()}.png`;
      link.href = imageData;
      link.click();
      notifications.show({
        title: 'Saved!',
        message: 'Result image saved to your device!',
        color: 'green',
        autoClose: 3000,
      });
    } else {
      notifications.show({
        title: 'Error',
        message: 'Failed to capture image',
        color: 'red',
        autoClose: 2000,
      });
    }
    onClose();
  };
  
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#1a1a2e',
          borderRadius: '24px',
          padding: '2rem',
          maxWidth: '500px',
          width: '90%',
          animation: 'slideUp 0.3s ease'
        }}
      >
        <h2 style={{ color: '#e2b714', textAlign: 'center', marginBottom: '1.5rem' }}>
          Share Your Result
        </h2>
        <div
          ref={resultRef}
          style={{
            background: '#0e0e0f',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center',
            border: '1px solid #2a2a2c'
          }}
        >
          <div style={{ fontSize: '1.3rem', marginBottom: '0.5rem', color: '#e2b714' }}>⌨️ TypeMaster</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e2b714', marginBottom: '0.5rem' }}>
            {wpm} WPM
          </div>
          <div style={{ fontSize: '1rem', color: '#888', marginBottom: '1rem' }}>
            {accuracy}% accuracy • {duration}s
          </div>
          <div style={{ fontSize: '0.8rem', color: '#666' }}>
            Correct: {correctChars}/{totalChars}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          <button
            onClick={shareOnTwitter}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              background: '#1DA1F2',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🐦 Share on Twitter
          </button>
          <button
            onClick={shareOnTelegram}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              background: '#26A5E4',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📱 Share on Telegram
          </button>
          <button
            onClick={shareOnWhatsApp}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              background: '#25D366',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            💬 Share on WhatsApp
          </button>
          <button
            onClick={copyResultText}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              background: '#6366f1',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📋 Copy Result Text
          </button>
          <button
            onClick={saveAsImage}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.8rem',
              background: '#10b981',
              border: 'none',
              padding: '12px',
              borderRadius: '12px',
              color: 'white',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📸 Save as Image
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: '1px solid #333',
              padding: '12px',
              borderRadius: '12px',
              color: '#888',
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}