import {useState,useEffect,useRef,useCallback} from 'react';
import {notifications} from '@mantine/notifications';
import {gameService} from '../../services/api';
import useAuthStore from '../../store/authStore';
import ShareResult from '../ShareResult';

const TIMES=[15,30,45,60,75,90,105,120];
export default function TypingTest(){
  const user=useAuthStore((state)=>state.user);
  const [mode,setMode]=useState("time");
  const [difficulty,setDifficulty]=useState("all");
  const [timeLimit,setTimeLimit]=useState(60);
  const [wordCount,setWordCount]=useState(25);
  const [words,setWords]=useState([]);
  const [typed,setTyped]=useState("");
  const [currentWordIndex,setCurrentWordIndex]=useState(0);
  const [charStatuses,setCharStatuses]=useState([]);
  const [wordStatuses,setWordStatuses]=useState([]);
  const [started,setStarted]=useState(false);
  const [finished,setFinished]=useState(false);
  const [timeLeft,setTimeLeft]=useState(60);
  const [startTime,setStartTime]=useState(null);
  const [endTime,setEndTime]=useState(null);
  const [wpm,setWpm]=useState(0);
  const [rawWpm,setRawWpm]=useState(0);
  const [accuracy,setAccuracy]=useState(100);
  const [correctChars,setCorrectChars]=useState(0);
  const [incorrectChars,setIncorrectChars]=useState(0);
  const [wpmHistory,setWpmHistory]=useState([]);
  const [showShareModal,setShowShareModal]=useState(false);
  const [finalStats,setFinalStats]=useState(null);
  const [currentTextId,setCurrentTextId]=useState(null);
  const inputRef=useRef(null);
  const wordsRef=useRef(null);
  const timerRef=useRef(null);
  const wpmHistoryRef=useRef([]);
  const correctCharsRef=useRef(0);
  const totalCharsRef=useRef(0);

  const fetchTextFromAPI=useCallback(async()=>{
    try{
      const diffParam=difficulty==='all'?null:difficulty;
      const response=await gameService.getText(diffParam);
      const textContent=response.data.content;
      const textWords=textContent.split(' ');
      setWords(textWords);
      setCurrentTextId(response.data.id);
      setTyped("");
      setCurrentWordIndex(0);
      setCharStatuses(textWords.map(w=>Array(w.length).fill("pending")));
      setWordStatuses(textWords.map(()=>"pending"));
      return true;
    } catch(error){
      console.error('Error fetching text:',error);
      notifications.show({
        title:'Error',
        message:'Failed to load text. Using fallback.',
        color:'red',});
      return false;
    }
  },[difficulty]);
  const initTest=useCallback(async()=>{
    const success=await fetchTextFromAPI();
    if(!success){
      const fallbackText="The quick brown fox jumps over the lazy dog. Practice typing to improve your speed and accuracy.";
      const fallbackWords=fallbackText.split(' ');
      setWords(fallbackWords);
      setCharStatuses(fallbackWords.map(w=>Array(w.length).fill("pending")));
      setWordStatuses(fallbackWords.map(()=>"pending"));
    }
    setStarted(false);
    setFinished(false);
    setTimeLeft(timeLimit);
    setStartTime(null);
    setEndTime(null);
    setWpm(0);
    setRawWpm(0);
    setAccuracy(100);
    setCorrectChars(0);
    setIncorrectChars(0);
    setWpmHistory([]);
    setFinalStats(null);
    setShowShareModal(false);
    setTyped("");
    setCurrentWordIndex(0);
    wpmHistoryRef.current=[];
    correctCharsRef.current=0;
    totalCharsRef.current=0;
    clearInterval(timerRef.current);
    setTimeout(()=>{
      if(inputRef.current)inputRef.current.focus();
    },50);
  },[fetchTextFromAPI,timeLimit]);
  useEffect(()=>{initTest();},[initTest,difficulty,mode,wordCount,timeLimit]);
  useEffect(()=>{
    if(!started || finished) return;
    if(mode==="time") {
      timerRef.current=setInterval(()=>{
        setTimeLeft(t=>{
          if(t<=1){
            clearInterval(timerRef.current);
            finishTest();
            return 0;
          }
          const elapsed=(Date.now()-startTime)/1000;
          const minutesElapsed=elapsed/60;
          if(minutesElapsed>0){
            const current = Math.round(correctCharsRef.current / 5 / minutesElapsed);
            wpmHistoryRef.current.push(current);
            setWpmHistory([...wpmHistoryRef.current]);
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [started, finished, mode, startTime]);

  const finishTest = useCallback(() => {
    const now = Date.now();
    setEndTime(now);
    setFinished(true);
    clearInterval(timerRef.current);
    
    const elapsed = ((now - startTime) / 1000) / 60;
    const finalWpm = elapsed > 0 ? Math.round(correctCharsRef.current / 5 / elapsed) : 0;
    const finalAccuracy = totalCharsRef.current > 0 
      ? Math.round((correctCharsRef.current / totalCharsRef.current) * 100) 
      : 100;
    
    const statsData = {
      wpm: finalWpm,
      accuracy: finalAccuracy,
      correctCount: correctCharsRef.current,
      typedCount: totalCharsRef.current
    };
    setFinalStats(statsData);
    
    notifications.show({
      title: '🎉 Test Complete! 🎉',
      message: `WPM: ${finalWpm}  |  Accuracy: ${finalAccuracy}%`,
      color: finalWpm > 60 ? 'green' : finalWpm > 30 ? 'yellow' : 'blue',
      autoClose: 8000,
    });
    
    if (user && currentTextId) {
      gameService.saveResult({
        wpm: finalWpm,
        accuracy: finalAccuracy,
        duration: mode === "time" ? timeLimit : Math.round(elapsed * 60),
        text_id: currentTextId,
        text_preview: words.slice(0, 5).join(" ") + "..."
      }).catch(err => console.error("Error saving result:", err));
    }
  }, [startTime, user, words, mode, timeLimit, currentTextId]);

  useEffect(() => {
    if (!finished || !startTime) return;
    const elapsed = ((endTime || Date.now()) - startTime) / 1000 / 60;
    const correctW = Math.round(correctCharsRef.current / 5 / elapsed);
    const rawW = Math.round(totalCharsRef.current / 5 / elapsed);
    const acc = totalCharsRef.current > 0
      ? Math.round((correctCharsRef.current / totalCharsRef.current) * 100)
      : 100;
    setWpm(correctW);
    setRawWpm(rawW);
    setAccuracy(acc);
  }, [finished, startTime, endTime]);
  useEffect(() => {
    if (!wordsRef.current) return;
    const activeEl = wordsRef.current.querySelector(".word-active");
    if (activeEl) {
      const containerTop = wordsRef.current.scrollTop;
      const containerBottom = containerTop + wordsRef.current.clientHeight;
      const elTop = activeEl.offsetTop - wordsRef.current.offsetTop;
      const elBottom = elTop + activeEl.clientHeight;
      if (elBottom > containerBottom - 40) {
        wordsRef.current.scrollTop = elTop - wordsRef.current.clientHeight / 2;
      }
    }
  }, [currentWordIndex]);
  const handleInput = useCallback((e) => {
    if (finished) return;
    const val = e.target.value;

    if (!started && val.length > 0) {
      setStarted(true);
      setStartTime(Date.now());
      notifications.show({
        title: '🚀 Go!',
        message: 'Start typing. Press TAB to restart.',
        color: 'blue',
        autoClose: 2000,
      });
    }

    if (val.endsWith(" ")) {
      const typedWord = val.trim();
      const correctWord = words[currentWordIndex];
      const newCharStatuses = [...charStatuses];
      const newWordStatuses = [...wordStatuses];
      const statuses = [];
      const maxLen = Math.max(typedWord.length, correctWord.length);
      let wordCorrect = 0;
      let wordTotal = typedWord.length;
      for (let i = 0; i < maxLen; i++) {
        if (i < typedWord.length && i < correctWord.length) {
          if (typedWord[i].toLowerCase() === correctWord[i].toLowerCase()) {
            statuses.push("correct");
            wordCorrect++;
          } else {
            statuses.push("incorrect");
          }
        } else if (i >= correctWord.length) {
          statuses.push("extra");
        } else {
          statuses.push("missed");
          wordTotal++;
        }
      }
      correctCharsRef.current += wordCorrect;
      totalCharsRef.current += wordTotal;
      setCorrectChars(correctCharsRef.current);
      newCharStatuses[currentWordIndex] = statuses;
      newWordStatuses[currentWordIndex] = typedWord.toLowerCase() === correctWord.toLowerCase() ? "correct" : "incorrect";
      setCharStatuses(newCharStatuses);
      setWordStatuses(newWordStatuses);
      const nextIndex = currentWordIndex + 1;
      if (mode === "words" && nextIndex >= wordCount) {
        setCurrentWordIndex(nextIndex);
        setTyped("");
        inputRef.current.value = "";
        finishTest();
        return;
      }
      if (nextIndex >= words.length) {
        finishTest();
        return;
      }
      setCurrentWordIndex(nextIndex);
      setTyped("");
      inputRef.current.value = "";
      return;
    }
    setTyped(val);
    const correctWord = words[currentWordIndex];
    const newCharStatuses = [...charStatuses];
    const statuses = Array(correctWord.length).fill("pending");
    for (let i = 0; i < val.length; i++) {
      if (i < correctWord.length) {
        statuses[i] = val[i].toLowerCase() === correctWord[i].toLowerCase() ? "correct" : "incorrect";
      }
    }
    newCharStatuses[currentWordIndex] = statuses;
    setCharStatuses(newCharStatuses);
  }, [finished, started, words, currentWordIndex, charStatuses, wordStatuses, mode, wordCount, finishTest]);
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      initTest();
    }
    if (e.key === "Backspace" && typed === "" && currentWordIndex > 0) {
      e.preventDefault();
      const prevIndex = currentWordIndex - 1;
      const newWordStatuses = [...wordStatuses];
      newWordStatuses[prevIndex] = "pending";
      const newCharStatuses = [...charStatuses];
      newCharStatuses[prevIndex] = Array(words[prevIndex].length).fill("pending");
      setWordStatuses(newWordStatuses);
      setCharStatuses(newCharStatuses);
      setCurrentWordIndex(prevIndex);
      const prevTyped = words[prevIndex];
      setTyped(prevTyped);
      inputRef.current.value = prevTyped;
      const lost = words[prevIndex].length;
      correctCharsRef.current = Math.max(0, correctCharsRef.current - lost);
      totalCharsRef.current = Math.max(0, totalCharsRef.current - lost);
    }
  }, [typed, currentWordIndex, wordStatuses, charStatuses, words, initTest]);
  const elapsedTime = startTime && endTime
    ? ((endTime - startTime) / 1000).toFixed(1)
    : startTime ? ((Date.now() - startTime) / 1000).toFixed(1) : 0;
  const miniGraphMax = Math.max(...wpmHistory, 1);
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0e0e0f",
      color: "#d1cfc7",
      fontFamily: "'JetBrains Mono', 'Fira Mono', 'Courier New', monospace",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "0 24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }

        .word { display: inline-flex; flex-wrap: wrap; margin: 4px 6px; }
        .char { font-size: 22px; line-height: 1.6; letter-spacing: 0.5px; color: #555; transition: color 0.05s; position: relative; }
        .char.correct { color: #e2b714; }
        .char.incorrect { color: #ca4754; text-decoration: underline; text-decoration-color: #ca4754; }
        .char.pending { color: #555; }
        .char.extra { color: #ca4754; opacity: 0.7; }
        .char.missed { color: #ca4754; opacity: 0.5; }
        .char.active-cursor::after {
          content: '';
          display: block;
          position: absolute;
          left: 0; top: 3px; bottom: 3px;
          width: 2px;
          background: #e2b714;
          border-radius: 2px;
          animation: blink 1.06s step-start infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }

        .word-active .char:last-child::after {
          content: '';
          display: inline-block;
          width: 2px;
          height: 1.2em;
          background: #e2b714;
          position: absolute;
          right: -3px;
          top: 2px;
          border-radius: 2px;
          animation: blink 1.06s step-start infinite;
        }

        .pill-btn {
          background: transparent;
          border: 1px solid #2a2a2c;
          color: #555;
          padding: 5px 14px;
          border-radius: 6px;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .pill-btn:hover { color: #d1cfc7; border-color: #444; }
        .pill-btn.active { background: #2a2a2c; color: #e2b714; border-color: #e2b714; }

        .reset-btn {
          background: transparent;
          border: none;
          color: #333;
          cursor: pointer;
          padding: 8px 16px;
          font-family: inherit;
          font-size: 13px;
          letter-spacing: 0.05em;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .reset-btn:hover { color: #e2b714; }

        .stat-label { font-size: 11px; color: #444; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 4px; }
        .stat-value { font-size: 52px; font-weight: 700; color: #e2b714; letter-spacing: -1px; line-height: 1; }
        .stat-unit { font-size: 14px; color: #555; margin-top: 2px; }
        .stat-sub { font-size: 22px; color: #888; font-weight: 400; }

        .mini-bar {
          width: 4px;
          background: #e2b714;
          border-radius: 2px;
          align-self: flex-end;
          min-height: 2px;
          opacity: 0.7;
        }
      `}</style>
      <div style={{ width: "100%", maxWidth: 860, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "28px 0 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, background: "#e2b714", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 14, color: "#0e0e0f", fontWeight: 700 }}>⌨</span>
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#e2b714", letterSpacing: "0.04em" }}>swifttype</span>
          {user && <span style={{ fontSize: 11, color: "#333", marginLeft: 8 }}>👤 {user.username}</span>}
        </div>
        <div style={{ fontSize: 12, color: "#333", letterSpacing: "0.1em" }}>tab → restart</div>
      </div>
      {!finished ? (
        <>
          <div style={{ width: "100%", maxWidth: 860, display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, alignItems: "center" }}>
            <div style={{ display: "flex", gap: 6, background: "#161617", borderRadius: 8, padding: "4px 6px", border: "1px solid #1e1e20" }}>
              <button className={`pill-btn${mode === "time" ? " active" : ""}`} onClick={() => setMode("time")}>time</button>
              <button className={`pill-btn${mode === "words" ? " active" : ""}`} onClick={() => setMode("words")}>words</button>
            </div>
            <div style={{ width: 1, height: 28, background: "#222", margin: "0 4px" }} />
            {mode === "time" ? (
              <div style={{ display: "flex", gap: 4 }}>
                {TIMES.map(t => (
                  <button key={t} className={`pill-btn${timeLimit === t ? " active" : ""}`} onClick={() => setTimeLimit(t)}>{t}s</button>
                ))}
              </div>
            ) : (
              <div style={{ display: "flex", gap: 4 }}>
                {[10, 25, 50, 100].map(c => (
                  <button key={c} className={`pill-btn${wordCount === c ? " active" : ""}`} onClick={() => setWordCount(c)}>{c}</button>
                ))}
              </div>
            )}
            <div style={{ width: 1, height: 28, background: "#222", margin: "0 4px" }} />
            <div style={{ display: "flex", gap: 4 }}>
              {["all", "easy", "medium", "hard"].map(d => (
                <button key={d} className={`pill-btn${difficulty === d ? " active" : ""}`} onClick={() => setDifficulty(d)}>{d === "all" ? "all" : d}</button>
              ))}
            </div>
            <div style={{ marginLeft: "auto" }}>
              {mode === "time" && (
                <div style={{ fontSize: 28, fontWeight: 700, color: started ? "#e2b714" : "#333", minWidth: 56, textAlign: "right", transition: "color 0.3s" }}>
                  {timeLeft}
                </div>
              )}
              {mode === "words" && started && (
                <div style={{ fontSize: 14, color: "#444" }}>
                  {currentWordIndex}/{wordCount}
                </div>
              )}
            </div>
          </div>
          <div onClick={() => inputRef.current?.focus()} style={{ width: "100%", maxWidth: 860, cursor: "text", userSelect: "none" }}>
            <div
              ref={wordsRef}
              style={{
                height: 160,
                overflow: "hidden",
                position: "relative",
                maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 85%, transparent 100%)",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", padding: "8px 0" }}>
                {words.map((word, wi) => {
                  const isActive = wi === currentWordIndex;
                  const statuses = charStatuses[wi] || Array(word.length).fill("pending");
                  const extraChars = isActive && typed.length > word.length
                    ? typed.slice(word.length).split("")
                    : [];

                  return (
                    <div key={wi} className={`word${isActive ? " word-active" : ""}`}>
                      {word.split("").map((ch, ci) => (
                        <span key={ci} className={`char ${isActive ? statuses[ci] || "pending" : (charStatuses[wi]?.[ci] || "pending")}`}>
                          {ch}
                        </span>
                      ))}
                      {extraChars.map((ch, i) => (
                        <span key={"ex" + i} className="char extra">{ch}</span>
                      ))}
                      {isActive && typed.length >= word.length && extraChars.length === 0 && (
                        <span className="char active-cursor" style={{ width: 2 }} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <input
            ref={inputRef}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            style={{
              position: "fixed",
              opacity: 0,
              top: 0,
              left: 0,
              width: 1,
              height: 1,
              pointerEvents: "none",
            }}
          />
          <div style={{ marginTop: 24, display: "flex", gap: 20, alignItems: "center" }}>
            <button className="reset-btn" onClick={initTest}>
              <span>↺</span> restart
            </button>
          </div>
          {started && wpmHistory.length > 1 && (
            <div style={{ marginTop: 20, width: "100%", maxWidth: 860 }}>
              <div style={{ fontSize: 11, color: "#333", letterSpacing: "0.1em", marginBottom: 6 }}>WPM</div>
              <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 32 }}>
                {wpmHistory.map((v, i) => (
                  <div key={i} className="mini-bar" style={{ height: `${Math.max(4, (v / miniGraphMax) * 32)}px` }} />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div style={{ width: "100%", maxWidth: 860, marginTop: 20 }}>
          <div style={{ marginBottom: 32, fontSize: 11, color: "#333", letterSpacing: "0.15em", textTransform: "uppercase" }}>results</div>

          <div style={{ display: "flex", gap: 48, flexWrap: "wrap", marginBottom: 48 }}>
            <div>
              <div className="stat-label">wpm</div>
              <div className="stat-value">{wpm}</div>
            </div>
            <div>
              <div className="stat-label">accuracy</div>
              <div className="stat-value">{accuracy}<span style={{ fontSize: 22, color: "#888" }}>%</span></div>
            </div>
            <div>
              <div className="stat-label">raw</div>
              <div className="stat-value" style={{ fontSize: 36, color: "#888" }}>{rawWpm}</div>
            </div>
            <div>
              <div className="stat-label">time</div>
              <div className="stat-value" style={{ fontSize: 36, color: "#888" }}>{elapsedTime}<span style={{ fontSize: 16, color: "#555" }}>s</span></div>
            </div>
            <div>
              <div className="stat-label">chars</div>
              <div style={{ marginTop: 4, fontSize: 18, color: "#888" }}>
                <span style={{ color: "#e2b714" }}>{correctChars}</span>
                <span style={{ color: "#333" }}>/</span>
                <span style={{ color: "#ca4754" }}>{totalCharsRef.current - correctChars}</span>
              </div>
            </div>
          </div>

          {wpmHistory.length > 1 && (
            <div style={{ marginBottom: 40 }}>
              <div style={{ fontSize: 11, color: "#333", letterSpacing: "0.1em", marginBottom: 10 }}>wpm over time</div>
              <div style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 64, background: "#111", borderRadius: 8, padding: "8px", overflow: "hidden" }}>
                {wpmHistory.map((v, i) => (
                  <div key={i} style={{
                    flex: 1,
                    background: "#e2b714",
                    borderRadius: "2px 2px 0 0",
                    minHeight: 2,
                    height: `${Math.max(4, (v / miniGraphMax) * 100)}%`,
                    opacity: 0.6 + (i / wpmHistory.length) * 0.4,
                  }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 11, color: "#333" }}>
                <span>0s</span>
                <span>{mode === "time" ? `${timeLimit}s` : `${wordCount} words`}</span>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
            <button className="reset-btn" style={{ background: "#1a1a1b", border: "1px solid #2a2a2c", borderRadius: 8, color: "#e2b714", padding: "10px 24px" }} onClick={initTest}>
              ↺ again
            </button>
            <button className="reset-btn" style={{ background: "transparent", border: "1px solid #222", borderRadius: 8, color: "#555", padding: "10px 24px" }} onClick={() => { setMode("time"); setDifficulty("all"); setTimeLimit(60); initTest(); }}>
              new test
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              style={{
                background: "linear-gradient(135deg, #6366f1, #06b6d4)",
                border: "none",
                padding: "10px 24px",
                borderRadius: 40,
                color: "white",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              📤 Share Result
            </button>
          </div>
        </div>
      )}
      {showShareModal && finalStats && (
        <ShareResult
          wpm={finalStats.wpm}
          accuracy={finalStats.accuracy}
          duration={mode === "time" ? timeLimit : wordCount}
          correctChars={finalStats.correctCount}
          totalChars={finalStats.typedCount}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}