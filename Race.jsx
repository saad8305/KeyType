import {useState,useEffect,useRef,useCallback} from 'react';
import {io} from 'socket.io-client';
import {notifications} from '@mantine/notifications';
import useAuthStore from '../store/authStore';

export default function Race(){
  const user = useAuthStore((state) => state.user);
  const [socket, setSocket] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [players, setPlayers] = useState([]);
  const [raceStarted, setRaceStarted] = useState(false);
  const [text, setText] = useState('');
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [userWords, setUserWords] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [raceFinished, setRaceFinished] = useState(false);
  const [winner, setWinner] = useState(null);
  const [results, setResults] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const isSubmittingRef = useRef(false);
  useEffect(() => {
    const newSocket = io('http://localhost:5001', {
      transports: ['websocket'],
      reconnection: true
    });
    setSocket(newSocket);
    return () => {
      if (newSocket) newSocket.close();
    };
  }, []);
  const createRoom = () => {
    if (!socket) return;
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(newRoomId);
    socket.emit('join_race', {
      room_id: newRoomId,
      username: user?.username,
      user_id: user?.id
    });
    notifications.show({
      title: '🏁 Room Created!',
      message: `Room code: ${newRoomId}. Share this code with friends!`,
      color: 'green',
      autoClose: 5000,
    });
  };
  const joinRoom = () => {
    if (!socket) return;
    const code = prompt('Enter room code:');
    if (code) {
      setRoomId(code.toUpperCase());
      socket.emit('join_race', {
        room_id: code.toUpperCase(),
        username: user?.username,
        user_id: user?.id
      });
    }
  };
  const startRace = () => {
    if (!socket) return;
    if (players.length < 2) {
      notifications.show({
        title: '❌ Need More Players',
        message: 'At least 2 players are required to start!',
        color: 'red',
      });
      return;
    }
    socket.emit('start_race', { room_id: roomId });
  };
  const calculateCurrentWPM = useCallback(() => {
    if (!startTime) return 0;
    const elapsed = (Date.now() - startTime) / 1000 / 60;
    const correctCount = userWords.filter(w => w !== '' && w !== null).length;
    if (elapsed <= 0) return 0;
    return Math.round(correctCount / elapsed);
  }, [startTime, userWords]);
  const submitCurrentWord = useCallback(() => {
    if (!raceStarted || completed || !socket) return;
    if (isSubmittingRef.current) return;
    const trimmedInput = currentInput.trim();
    if (trimmedInput === '') return;
    isSubmittingRef.current = true;
    const newUserWords = [...userWords];
    newUserWords[currentWordIndex] = trimmedInput;
    setUserWords(newUserWords);
    const progress = currentWordIndex + 1;
    const wpm = calculateCurrentWPM();
    socket.emit('typing_progress', {
      room_id: roomId,
      user_id: user?.id,
      progress: progress,
      wpm: wpm
    });
    if (currentWordIndex + 1 < words.length) {
      setCurrentWordIndex(prev => prev + 1);
      setCurrentInput('');
    } else {
      setCompleted(true);
      socket.emit('race_complete', {
        room_id: roomId,
        user_id: user?.id,
        wpm: wpm,
        finish_time: Date.now()
      });
    }
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 100);
  }, [raceStarted, completed, currentInput, currentWordIndex, userWords, words, roomId, user, socket, calculateCurrentWPM]);
  const handleKeyDown = useCallback((e) => {
    if (!raceStarted || completed) return;
    const key = e.key;
    if (key === ' ') {
      e.preventDefault();
      if (currentInput.trim() !== '' && !isSubmittingRef.current) {
        submitCurrentWord();
      }
      return;
    }
    if (key === 'Backspace') {
      if (currentInput.length > 0) {
        setCurrentInput(prev => prev.slice(0, -1));
      }
      return;
    }
    if (key.length === 1 && /[a-zA-Z0-9.,!?;:'"\-]/.test(key)) {
      e.preventDefault();
      setCurrentInput(prev => prev + key);
    }
  }, [raceStarted, completed, currentInput, submitCurrentWord]);
  useEffect(() => {
    if (!socket) return;
    socket.on('race_joined', (data) => {
      setText(data.text);
      const textWords = data.text.split(' ');
      setWords(textWords);
      setUserWords(new Array(textWords.length).fill(''));
      setPlayers(data.players);
      setCurrentWordIndex(0);
      setCurrentInput('');
      setCompleted(false);
    });
    
    socket.on('player_joined', (data) => {
      setPlayers(data.players);
      notifications.show({
        title: '👋 Player Joined',
        message: `${data.players[data.players.length - 1]?.username} joined the race!`,
        color: 'blue',
        autoClose: 3000,
      });
    });
    
    socket.on('race_started', (data) => {
      setRaceStarted(true);
      setStartTime(Date.now());
      setText(data.text);
      const textWords = data.text.split(' ');
      setWords(textWords);
      setCurrentWordIndex(0);
      setCurrentInput('');
      setUserWords(new Array(textWords.length).fill(''));
      setCompleted(false);
      
      notifications.show({
        title: '🏁 RACE STARTED! 🏁',
        message: 'Type as fast as you can! Press SPACE after each word.',
        color: 'green',
        autoClose: 3000,
      });
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);
    });
    
    socket.on('progress_update', (data) => {
      setPlayers(data.players);
    });
    
    socket.on('player_completed', (data) => {
      notifications.show({
        title: '🏆 Player Finished!',
        message: `${data.username} finished with ${data.wpm} WPM!`,
        color: 'yellow',
        autoClose: 3000,
      });
    });
    
    socket.on('race_finished', (data) => {
      setRaceFinished(true);
      setWinner(data.winner);
      setResults(data.results);
      setRaceStarted(false);
      
      notifications.show({
        title: '🎉 RACE FINISHED! 🎉',
        message: `Winner: ${data.winner} 🏆`,
        color: 'green',
        autoClose: 8000,
      });
    });
    
    socket.on('player_left', (data) => {
      setPlayers(data.players);
      notifications.show({
        title: '👋 Player Left',
        message: 'A player has left the race',
        color: 'orange',
        autoClose: 3000,
      });
    });
    
    return () => {
      socket.off('race_joined');
      socket.off('player_joined');
      socket.off('race_started');
      socket.off('progress_update');
      socket.off('player_completed');
      socket.off('race_finished');
      socket.off('player_left');
    };
  }, [socket]);
  
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  useEffect(() => {
    if (raceStarted && !completed && inputRef.current) {
      inputRef.current.focus();
    }
  }, [raceStarted, completed, currentWordIndex]);
  const renderWords = () => {
    if (words.length === 0) {
      return <div style={{ textAlign: 'center', color: '#888', padding: '50px' }}>Loading...</div>;
    }
    
    return words.map((word, idx) => {
      let color = '#6c757d';
      let bgColor = 'transparent';
      const isActive = idx === currentWordIndex && raceStarted && !completed;
      const isCompleted = userWords[idx] && userWords[idx] !== '';
      const isCorrect = isCompleted && userWords[idx] === word;
      
      if (isCompleted) {
        color = isCorrect ? '#28a745' : '#dc3545';
      }
      
      return (
        <span
          key={idx}
          style={{
            display: 'inline-block',
            marginRight: '15px',
            marginBottom: '10px',
            padding: '8px 12px',
            fontSize: 'clamp(18px, 5vw, 28px)',
            fontFamily: "'Courier New', monospace",
            fontWeight: isActive ? 'bold' : 'normal',
            color: color,
            backgroundColor: isActive ? 'rgba(226, 183, 20, 0.15)' : bgColor,
            borderRadius: '10px',
            borderBottom: isActive ? '2px solid #e2b714' : 'none'
          }}
        >
          {word}
          {isCompleted && (
            <span style={{ marginLeft: '6px', fontSize: '14px' }}>
              {isCorrect ? '✓' : '✗'}
            </span>
          )}
        </span>
      );
    });
  };
  
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      {!roomId ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h1 style={{ color: '#e2b714', marginBottom: '2rem' }}>🏁 Multiplayer Race</h1>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={createRoom}
              style={{
                background: '#e2b714',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '40px',
                color: '#1a1a2e',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              🎮 Create Room
            </button>
            <button
              onClick={joinRoom}
              style={{
                background: 'transparent',
                border: '1px solid #e2b714',
                padding: '12px 32px',
                borderRadius: '40px',
                color: '#e2b714',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            >
              🔗 Join Room
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1rem 1.5rem',
            background: 'rgba(0,0,0,0.3)',
            borderRadius: '16px'
          }}>
            <div>
              <span style={{ color: '#888' }}>🏠 Room: </span>
              <span style={{ color: '#e2b714', fontWeight: 'bold', fontSize: '1.2rem' }}>{roomId}</span>
            </div>
            <div>
              <span style={{ color: '#888' }}>👥 Players: </span>
              <span style={{ color: '#e2b714', fontWeight: 'bold' }}>{players.length}</span>
            </div>
            {!raceStarted && !raceFinished && players.length >= 2 && (
              <button
                onClick={startRace}
                style={{
                  background: '#10b981',
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: '40px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                🚀 Start Race
              </button>
            )}
            {!raceStarted && !raceFinished && players.length < 2 && (
              <div style={{ color: '#888', fontSize: '0.8rem' }}>
                Need {2 - players.length} more player(s) to start
              </div>
            )}
          </div>
          
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '2rem'
          }}>
            {players.map((player, idx) => (
              <div
                key={idx}
                style={{
                  background: player.id === user?.id ? 'rgba(226, 183, 20, 0.15)' : 'rgba(20,20,30,0.4)',
                  borderRadius: '12px',
                  padding: '0.8rem 1.5rem',
                  flex: 1,
                  minWidth: '150px',
                  textAlign: 'center',
                  border: player.id === user?.id ? '1px solid rgba(226, 183, 20, 0.3)' : 'none'
                }}
              >
                <div style={{ fontWeight: 'bold', color: player.id === user?.id ? '#e2b714' : '#888' }}>
                  {player.username} {player.id === user?.id && '(You)'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e2b714' }}>
                  {player.wpm || 0} WPM
                </div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>
                  Progress: {player.progress}/{words.length}
                </div>
                {player.completed && <div style={{ color: '#10b981', fontSize: '0.7rem', marginTop: '4px' }}>✓ Finished!</div>}
              </div>
            ))}
          </div>
        
          {raceStarted && !raceFinished && (
            <>
              <div style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '20px',
                padding: '2rem',
                minHeight: '300px',
                maxHeight: '400px',
                overflowY: 'auto'
              }}>
                {renderWords()}
              </div>
              
              <input
                ref={inputRef}
                type="text"
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                disabled={completed}
                placeholder={completed ? "✅ You finished! Waiting for others..." : "⌨️ Type here and press SPACE after each word..."}
                style={{
                  width: '100%',
                  marginTop: '1rem',
                  padding: '1rem',
                  fontSize: '1rem',
                  fontFamily: 'monospace',
                  background: '#1a1a2e',
                  border: completed ? '1px solid #10b981' : '1px solid #e2b714',
                  borderRadius: '12px',
                  color: 'white',
                  outline: 'none',
                  textAlign: 'center'
                }}
              />
              
              <div style={{ textAlign: 'center', marginTop: '1rem', color: '#666', fontSize: '0.8rem' }}>
                💡 Press SPACE after each word to submit
              </div>
            </>
          )}
        
          {raceFinished && (
            <div style={{
              background: 'rgba(0,0,0,0.5)',
              borderRadius: '20px',
              padding: '2rem',
              textAlign: 'center',
              animation: 'fadeIn 0.3s ease'
            }}>
              <h2 style={{ color: '#e2b714', marginBottom: '1rem' }}>🏆 Race Results 🏆</h2>
              <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
                Winner: <span style={{ color: '#e2b714', fontWeight: 'bold' }}>{winner}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '400px', margin: '0 auto' }}>
                {[...results].sort((a,b) => (a.finish_time || Infinity) - (b.finish_time || Infinity)).map((player, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.8rem 1.2rem',
                    background: 'rgba(20,20,30,0.4)',
                    borderRadius: '12px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`} {player.username}
                    </span>
                    <span style={{ color: '#e2b714', fontWeight: 'bold' }}>{player.wpm} WPM</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => {
                  setRoomId(null);
                  setRaceFinished(false);
                  setPlayers([]);
                  setWords([]);
                  setResults([]);
                  setWinner(null);
                }}
                style={{
                  marginTop: '1.5rem',
                  background: '#e2b714',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '40px',
                  color: '#1a1a2e',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
              >
                🎮 New Race
              </button>
            </div>
          )}
        </>
      )}  
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}