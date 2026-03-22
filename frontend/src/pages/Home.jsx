import { useState } from 'react'
import Camera from '../components/camera'
import MoodDisplay from '../components/mooddisplay'
import FloatingChat from '../components/FloatingChat'

function Home() {
  const [mood, setMood] = useState(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 p-8"
      style={{ backgroundColor: '#1a1a2e' }}>

      <h1 className="text-3xl font-bold text-amber-400">
        How are you feeling today, Arjuna?
      </h1>

      <Camera onMoodDetected={setMood} />
      <MoodDisplay mood={mood} />
      <FloatingChat mood={mood} />
    </div>
  )
}

export default Home