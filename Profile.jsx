import {useState,useEffect} from 'react';
import {userService} from '../services/api';
import {notifications} from '@mantine/notifications';
import {LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,Legend,ResponsiveContainer,BarChart,Bar} from 'recharts';

export default function Profile(){
  const [stats,setStats]=useState(null);
  const [history,setHistory]=useState([]);
  const [chartData,setChartData]=useState({labels:[],wpm_data:[],accuracy_data:[]});
  const [achievements,setAchievements]=useState([]);
  const [weeklySummary,setWeeklySummary]=useState(null);
  const [loading,setLoading]=useState(true);
  const [activeTab,setActiveTab]=useState('stats');
  useEffect(()=>{
    fetchProfileData();
  },[]);
  const fetchProfileData=async()=>{
    setLoading(true);
    try{
      const [statsRes,historyRes,chartRes,achievementsRes,weeklyRes]=await Promise.all([
        userService.getStats(),
        userService.getHistory(),
        userService.getChartData(),
        userService.getAchievements(),
        userService.getWeeklySummary()
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data.history);
      setChartData(chartRes.data);
      setAchievements(achievementsRes.data.achievements || []);
      setWeeklySummary(weeklyRes.data);
    } catch(error){
      console.error('Error:',error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load profile data',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };
  const getWpmLevel = (wpm) => {
    if (wpm<30) return { label: 'Beginner', color: '#f59e0b' };
    if (wpm<50) return { label: 'Intermediate', color: '#06b6d4' };
    if (wpm<70) return { label: 'Advanced', color: '#6366f1' };
    if (wpm<90) return { label: 'Expert', color: '#10b981' };
    return { label: 'Legendary', color: '#e2b714' };
  };
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
        Loading profile...
      </div>
    );
  }
  const level = getWpmLevel(stats?.max_wpm || 0);
  const lineChartData = chartData.labels.map((label, i) => ({
    date: label,
    wpm: chartData.wpm_data[i],
    accuracy: chartData.accuracy_data[i]
  }));
  const weeklyData = weeklySummary?.has_data ? weeklySummary.days.map((day, i) => ({
    day,
    wpm: weeklySummary.daily_wpm[i]
  })) : [];
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{
        background: 'rgba(20,20,30,0.4)',
        borderRadius: '24px',
        padding: '2rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'linear-gradient(135deg, #6366f1, #e2b714)',
          borderRadius: '50%',
          margin: '0 auto 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem'
        }}>
          🎯
        </div>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#e2b714' }}>
          {stats?.user?.username}
        </h1>
        <p style={{ color: '#888', fontSize: '0.85rem' }}>
          Member since {new Date(stats?.user?.created_at).toLocaleDateString()}
        </p>
        <div style={{
          display: 'inline-block',
          background: `rgba(${parseInt(level.color.slice(1,3), 16)}, ${parseInt(level.color.slice(3,5), 16)}, ${parseInt(level.color.slice(5,7), 16)}, 0.2)`,
          padding: '4px 12px',
          borderRadius: '20px',
          color: level.color,
          fontSize: '0.8rem',
          marginTop: '0.5rem'
        }}>
          {level.label}
        </div>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          background: 'rgba(20,20,30,0.4)',
          borderRadius: '16px',
          padding: '1.2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>BEST WPM</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#e2b714' }}>
            {stats?.max_wpm || 0}
          </div>
        </div>
        <div style={{
          background: 'rgba(20,20,30,0.4)',
          borderRadius: '16px',
          padding: '1.2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>AVG WPM</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#06b6d4' }}>
            {stats?.average_wpm || 0}
          </div>
        </div>
        <div style={{
          background: 'rgba(20,20,30,0.4)',
          borderRadius: '16px',
          padding: '1.2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>AVG ACCURACY</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
            {stats?.average_accuracy || 0}%
          </div>
        </div>
        <div style={{
          background: 'rgba(20,20,30,0.4)',
          borderRadius: '16px',
          padding: '1.2rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.7rem', color: '#888', marginBottom: '0.5rem' }}>TOTAL GAMES</div>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats?.total_games || 0}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid #333' }}>
        {[
          { id: 'stats', label: '📈 Progress' },
          { id: 'achievements', label: '🏆 Achievements' },
          { id: 'weekly', label: '📊 Weekly' },
          { id: 'history', label: '📜 History' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '12px 20px',
              color: activeTab === tab.id ? '#e2b714' : '#888',
              borderBottom: activeTab === tab.id ? '2px solid #e2b714' : 'none',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === 'stats' && (
        <div>
          {lineChartData.length > 0 ? (
            <div style={{
              background: 'rgba(20,20,30,0.4)',
              borderRadius: '20px',
              padding: '1.5rem'
            }}>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#888" fontSize={11} />
                  <YAxis yAxisId="left" stroke="#e2b714" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      background: '#1a1a2e',
                      border: '1px solid #e2b714',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="wpm"
                    stroke="#e2b714"
                    strokeWidth={2}
                    dot={{ fill: '#e2b714', r: 4 }}
                    name="WPM"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Accuracy %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
              Play some games to see your progress chart!
            </div>
          )}
        </div>
      )}
      {activeTab === 'achievements' && (
        <div>
          <div style={{
            background: 'rgba(20,20,30,0.4)',
            borderRadius: '20px',
            padding: '1.5rem',
            marginBottom: '1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', color: '#e2b714' }}>
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>Achievements Unlocked</div>
          </div>  
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}>
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                style={{
                  background: ach.unlocked ? 'rgba(226, 183, 20, 0.1)' : 'rgba(20,20,30,0.3)',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: ach.unlocked ? '1px solid rgba(226, 183, 20, 0.3)' : '1px solid #2a2a2c',
                  opacity: ach.unlocked ? 1 : 0.5
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '2rem' }}>{ach.icon}</span>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem', color: ach.unlocked ? '#e2b714' : '#888' }}>
                      {ach.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{ach.description}</div>
                  </div>
                </div>
                {!ach.unlocked && (
                  <div style={{
                    marginTop: '0.8rem',
                    height: '4px',
                    background: '#2a2a2c',
                    borderRadius: '2px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${ach.progress}%`,
                      height: '100%',
                      background: '#e2b714',
                      borderRadius: '2px'
                    }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {activeTab === 'weekly' && (
        <div>
          {weeklySummary?.has_data ? (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{ background: 'rgba(20,20,30,0.4)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>AVG WPM (7d)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#e2b714' }}>{weeklySummary.avg_wpm}</div>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.4)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>BEST WPM (7d)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#06b6d4' }}>{weeklySummary.best_wpm}</div>
                </div>
                <div style={{ background: 'rgba(20,20,30,0.4)', borderRadius: '16px', padding: '1rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>GAMES (7d)</div>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#10b981' }}>{weeklySummary.total_games}</div>
                </div>
              </div>      
              <div style={{
                background: 'rgba(20,20,30,0.4)',
                borderRadius: '20px',
                padding: '1.5rem'
              }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="day" stroke="#888" />
                    <YAxis stroke="#e2b714" />
                    <Tooltip
                      contentStyle={{
                        background: '#1a1a2e',
                        border: '1px solid #e2b714',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="wpm" fill="#e2b714" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
              No games played this week. Start typing!
            </div>
          )}
        </div>
      )}
      {activeTab === 'history' && (
        <div style={{
          background: 'rgba(20,20,30,0.4)',
          borderRadius: '20px',
          overflow: 'hidden'
        }}>
          {history.length > 0 ? (
            <div>
              {history.map((game, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    flexWrap: 'wrap',
                    gap: '0.8rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                      {new Date(game.created_at).toLocaleDateString()} at {new Date(game.created_at).toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>
                      {game.text_preview}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#e2b714' }}>
                      {game.wpm} WPM
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#10b981' }}>
                      {game.accuracy}% accuracy • {game.duration}s
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '50px', color: '#888' }}>
              No games played yet. Start typing!
            </div>
          )}
        </div>
      )}
    </div>
  );
}