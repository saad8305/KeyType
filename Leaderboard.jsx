import {useState,useEffect} from 'react';
import {leaderboardService} from '../services/api';
import {notifications} from '@mantine/notifications';

export default function Leaderboard(){
  const [leaderboard,setLeaderboard]=useState([]);
  const [recentScores,setRecentScores]=useState([]);
  const [loading,setLoading]=useState(true);
  const [period,setPeriod]=useState('all');
  const [activeTab,setActiveTab]=useState('top');
  useEffect(()=>{
    fetchLeaderboard();
    fetchRecentScores();
  },[period]);
  const fetchLeaderboard=async()=>{
    try{
      const response=await leaderboardService.getLeaderboard(period);
      setLeaderboard(response.data.leaderboard);
    }catch(error){
      notifications.show({
        title: 'Error',
        message: 'Failed to load leaderboard',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  const fetchRecentScores=async()=>{
    try{
      const response=await leaderboardService.getRecentScores();
      setRecentScores(response.data.recent_scores);
    }catch(error){
      console.error('Error fetching recent scores:', error);
    }
  };
  const getMedalIcon=(rank)=>{
    if(rank===1) return '🥇';
    if(rank===2) return '🥈';
    if(rank===3) return '🥉';
    return `${rank}`;
  };
  const getMedalColor=(rank)=>{
    if(rank===1) return '#e2b714';
    if(rank===2) return '#a0a0a0';
    if(rank===3) return '#cd7f32';
    return '#e2b714';
  };
  const formatTimeAgo=(dateStr)=>{
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs/60000);
    const diffHours = Math.floor(diffMs/3600000);
    const diffDays = Math.floor(diffMs/86400000);
    if (diffMins<1) return 'just now';
    if (diffMins<60) return `${diffMins}m ago`;
    if (diffHours<24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };
  return(
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{
        fontSize: '2rem',
        textAlign: 'center',
        color: '#e2b714',
        marginBottom: '0.5rem',
        letterSpacing: '-0.5px'
      }}>
        🏆Leaderboard
      </h1>
      <p style={{ textAlign: 'center', color: '#666', fontSize: '0.8rem', marginBottom: '2rem' }}>
        Top typists ranked by best WPM
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('top')}
          style={{
            background: activeTab === 'top' ? '#e2b714' : 'transparent',
            border: activeTab === 'top' ? 'none' : '1px solid #333',
            padding: '8px 24px',
            borderRadius: '40px',
            color: activeTab === 'top' ? '#1a1a2e' : '#888',
            cursor: 'pointer',
            fontWeight: activeTab === 'top' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Top Players
        </button>
        <button
          onClick={() => setActiveTab('recent')}
          style={{
            background: activeTab === 'recent' ? '#e2b714' : 'transparent',
            border: activeTab === 'recent' ? 'none' : '1px solid #333',
            padding: '8px 24px',
            borderRadius: '40px',
            color: activeTab === 'recent' ? '#1a1a2e' : '#888',
            cursor: 'pointer',
            fontWeight: activeTab === 'recent' ? 'bold' : 'normal',
            transition: 'all 0.2s'
          }}
        >
          Recent Scores
        </button>
      </div>
      {activeTab === 'top' && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { value: 'day', label: 'Today' },
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'all', label: 'All Time' }
          ].map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              style={{
                background: period === p.value ? '#2a2a2c' : 'transparent',
                border: '1px solid #333',
                padding: '6px 16px',
                borderRadius: '20px',
                color: period === p.value ? '#e2b714' : '#888',
                cursor: 'pointer',
                fontSize: '0.75rem',
                transition: 'all 0.2s'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
      
      {loading && activeTab === 'top' ? (
        <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>Loading...</div>
      ) : (
        <>
          {activeTab === 'top' && (
            <div style={{
              background: 'rgba(20,20,30,0.4)',
              borderRadius: '20px',
              overflow: 'hidden'
            }}>
              {leaderboard.length > 0 ? (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 120px 100px',
                    padding: '1rem 1.5rem',
                    background: '#1a1a2e',
                    color: '#e2b714',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #333'
                  }}>
                    <div>RANK</div>
                    <div>PLAYER</div>
                    <div style={{ textAlign: 'right' }}>BEST WPM</div>
                    <div style={{ textAlign: 'right' }}>GAMES</div>
                  </div>
                  {leaderboard.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '80px 1fr 120px 100px',
                        alignItems: 'center',
                        padding: '0.8rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(226,183,20,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <span style={{
                          display: 'inline-block',
                          width: '36px',
                          height: '36px',
                          background: item.rank <= 3 ? `rgba(${item.rank === 1 ? '226,183,20' : item.rank === 2 ? '160,160,160' : '205,127,50'}, 0.15)` : '#1a1a2e',
                          borderRadius: '50%',
                          textAlign: 'center',
                          lineHeight: '36px',
                          fontWeight: 'bold',
                          color: getMedalColor(item.rank),
                          fontSize: item.rank <= 3 ? '1.2rem' : '0.9rem'
                        }}>
                          {getMedalIcon(item.rank)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={item.avatar}
                          alt={item.username}
                          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                        />
                        <span style={{ fontWeight: '500' }}>{item.username}</span>
                      </div>
                      <div style={{ textAlign: 'right', fontSize: '1.2rem', fontWeight: 'bold', color: '#e2b714' }}>
                        {item.best_wpm}
                      </div>
                      <div style={{ textAlign: 'right', color: '#666', fontSize: '0.85rem' }}>
                        {item.total_games}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                  No players found for this period.
                </div>
              )}
            </div>
          )}
          {activeTab === 'recent' && (
            <div style={{
              background: 'rgba(20,20,30,0.4)',
              borderRadius: '20px',
              overflow: 'hidden'
            }}>
              {recentScores.length > 0 ? (
                <div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 100px 100px 100px',
                    padding: '1rem 1.5rem',
                    background: '#1a1a2e',
                    color: '#e2b714',
                    fontSize: '0.75rem',
                    letterSpacing: '0.5px',
                    borderBottom: '1px solid #333'
                  }}>
                    <div>PLAYER</div>
                    <div style={{ textAlign: 'right' }}>WPM</div>
                    <div style={{ textAlign: 'right' }}>ACCURACY</div>
                    <div style={{ textAlign: 'right' }}>TIME</div>
                  </div>
                  
                  {recentScores.map((score, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 100px 100px 100px',
                        alignItems: 'center',
                        padding: '0.8rem 1.5rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img
                          src={`https://ui-avatars.com/api/?name=${score.username}&background=e2b714&color=1a1a2e&bold=true`}
                          alt={score.username}
                          style={{ width: '28px', height: '28px', borderRadius: '50%' }}
                        />
                        <span>{score.username}</span>
                      </div>
                      <div style={{ textAlign: 'right', fontWeight: 'bold', color: '#e2b714' }}>
                        {score.wpm}
                      </div>
                      <div style={{ textAlign: 'right', color: '#10b981', fontSize: '0.85rem' }}>
                        {score.accuracy}%
                      </div>
                      <div style={{ textAlign: 'right', color: '#666', fontSize: '0.75rem' }}>
                        {formatTimeAgo(score.created_at)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
                  No recent scores yet.
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}