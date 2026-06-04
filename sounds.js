class SoundManager {
  constructor() {
    this.enabled = true;
    this.vibrationEnabled = true;
  }
  
  playCorrect() {
    if (!this.enabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 880;
      gainNode.gain.value = 0.1;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
      oscillator.stop(audioContext.currentTime + 0.3);
      audioContext.resume().catch(() => {});
    } catch (e) {}
  }
  
  playWrong() {
    if (!this.enabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 440;
      gainNode.gain.value = 0.1;
      oscillator.start();
      gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.4);
      oscillator.stop(audioContext.currentTime + 0.4);
      audioContext.resume().catch(() => {});
    } catch (e) {}
  }
  
  vibrate() {
    if (!this.vibrationEnabled) return;
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50);
    }
  }
  
  playGameComplete() {
    if (!this.enabled) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const frequencies = [523.25, 659.25, 783.99];
      const audioContext = new AudioContext();
      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          oscillator.frequency.value = freq;
          gainNode.gain.value = 0.08;
          oscillator.start();
          gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.3);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, i * 200);
      });
      audioContext.resume().catch(() => {});
    } catch (e) {}
  }
}

export const sounds = new SoundManager();