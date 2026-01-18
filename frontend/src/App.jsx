import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'

function SpinningStar() {
  const meshRef = useRef()
  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta * 0.5
    meshRef.current.rotation.y += delta * 0.2
  })
  return (
    <mesh ref={meshRef}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#ff007f" emissive="#ff007f" emissiveIntensity={1.5} roughness={0.2} />
    </mesh>
  )
}

export default function App() {
  const [status, setStatus] = useState("Connecting...")
  const [inputText, setInputText] = useState("")

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then(res => res.json())
      .then(data => setStatus(data.message))
      .catch(err => setStatus("Offline"))
  }, [])

  const handleSubmit = async () => {
    if (!inputText) return;

    setStatus("Sending transmission...")
    
    try {
      const response = await fetch("http://127.0.0.1:8000/confess", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText }) 
      })
      
      const data = await response.json()
      setStatus(data.message) 
      setInputText("") 
      console.log("Success:", data)
    } catch (error) {
      console.error("Error:", error)
      setStatus("Transmission Failed")
    }
  }

  return (
    <div style={{ width: "100vw", height: "100vh", background: "#050505" }}>
      
      <div style={{ position: "absolute", zIndex: 10, padding: "20px", color: "white", width: "100%", pointerEvents: "none" }}>
        <h1 style={{ margin: 0, fontSize: "2rem" }}>ほのわ</h1>
        <p style={{ opacity: 0.6, fontSize: "0.8rem" }}>STATUS: {status}</p>
      </div>

      <div style={{ 
        position: "absolute", bottom: "50px", left: "50%", transform: "translateX(-50%)", 
        zIndex: 20, display: "flex", gap: "10px", width: "90%", maxWidth: "500px" 
      }}>
        <textarea 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Cast your thought into the void..."
          style={{ 
            flex: 1, padding: "15px", borderRadius: "10px", border: "none", 
            background: "rgba(255,255,255,0.1)", color: "white", backdropFilter: "blur(5px)",
            resize: "none", height: "50px", outline: "none"
          }}
        />
        <button 
          onClick={handleSubmit}
          style={{ 
            padding: "0 25px", borderRadius: "10px", border: "none", 
            background: "#ff007f", color: "white", fontWeight: "bold", cursor: "pointer" 
          }}
        >
          SEND
        </button>
      </div>

      <Canvas camera={{ position: [0, 0, 6] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <SpinningStar />
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <OrbitControls />
      </Canvas>
    </div>
  )
}