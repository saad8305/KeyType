import TypingBox from '../components/TypingBox/TypingBox'

export default function Home(){
  return(
    <div style={{ 
      width:'100%', 
      maxWidth:'1500px', 
      margin:'0 auto', 
      padding:'0',
      minHeight:'100vh'
    }}>
      <div style={{textAlign:'center',marginBottom:'1rem',paddingTop:'1.5rem'}}>
        <h1 style={{
          fontSize:'clamp(2rem,6vw,3rem)',
          fontWeight:'700',
          background:'linear-gradient(135deg, #6366f1, #06b6d4, #10b981)',
          WebkitBackgroundClip:'text',
          backgroundClip:'text',
          color:'transparent',
          fontFamily:"'Space Grotesk', monospace",
          letterSpacing:'-1px'
        }}>
          KeyType
        </h1>
        <p style={{ color: '#94a3b8', fontFamily: "'Space Grotesk', monospace", fontSize: '0.85rem' }}>
          Make your typing faster than 'Usain Bolt' !
        </p>
      </div>
      <TypingBox/>
    </div>
  );
}