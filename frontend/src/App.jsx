// housekeeping
import { Canvas, useFrame } from '@react-three/fiber'
/* Canvas - for projecting stuff on the screen
useFrame - for updating things every frame (1/60 of a second) */

import { OrbitControls, Stars, Html } from '@react-three/drei'
/* OrbitControls - for moving camera with mouse
Stars - for stars background 
Html - to put standard text in a 3D object */

import {EffectComposer, Bloom} from '@react-three/postprocessing'
/* for bloom visual effects */

import { useRef, useState, useEffect } from 'react'
/* useRef - hook for object selection
useState - for memory and updating variables based off of current state
useEffect - for running a function once */

function SpinningStar({position, text, color}) {
  /* for the spinning star animation, can be included inside the App function,
  but then the whole simulation basically would have to be restarted every
  60th of a second. instead, by making this component independent, and using
  useRef() as a hook to the object, can manage each star's properties on its own,
  which is directly showed on the screen through <SpinningStar /> inside <Canvas> */

  const meshRef = useRef() // hook for object so it can be referred to

  const [hovered, setHovered] = useState(false) // default being false

  useFrame((state, delta) => { 
    /* state - current state
    delta - time since last refresh, so basically 1/60 of a second
    
    syntax for these arrows being (arguments) => {function with those arguments}
    basically like lambda functions, and useFrame in this context being useFrame(function)
    and run that function 60 times a second
    
    */
    meshRef.current.rotation.x += delta * 0.5 // rotating the object's current state 
    meshRef.current.rotation.y += delta * 0.2
  })
  return (

    /* return in js is basically like what u want projected on the screen, and so
    in this case the fucntion is inside <Canvas> which is what is projected on the
    screen, and so the object iself is being returned as information of what should
    be projected on the screen */

    <mesh 
      ref={meshRef} 
      position = {position} 
      onPointerOver = {() => setHovered(true)} // changing hover state based off of this
      onPointerOut = {() => setHovered(false)}
    >
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial 
        color={hovered ? "orange": (color || "#ff007f")}
        // if hovered, then orange - keeping pink as a backup just in case color is not there
        emissive= {hovered ? "orange" : (color || "#ff007f")}
        emissiveIntensity={1.5} 
        roughness={0.2} />
      
      {hovered && ( // if hovered
        <Html distanceFactor={10}>
          <div style={{ 
            background: "rgba(0,0,0,0.8)", 
            color: "white", 
            padding: "10px", 
            borderRadius: "5px",
            width: "150px",
            pointerEvents: "none" // letting clicks pass through
          }}>
            {text} {/* showing stars.text feeded in this function */}
          </div>
        </Html>
      )}
    </mesh> /* just closing line for <mesh> */
  )
}

export default function App() {
  /* this is the main code which is ran when the program is opened */

  const [status, setStatus] = useState("Connecting...")
  /* status - variable
  setStatus - thing to change the vartiable 
  "Connecting" within useState is the default status, kind of like default
  arguments for functions if no variable specified, and so when the program is
  starting, the status is first "Connecting.." */

  const [inputText, setInputText] = useState("")
  /* this is for the confession typing, but same logic with inputText being the
  variable and setInputText being the function to change that variable default 
  state is "" to imply that the text must be a string type ran at the start to connect to the back end */

  const [stars, setStars] = useState([])

  useEffect(() => {
    /* fetch のdefault verb is get (just receiving information from whatever place)
    and u can specify verb "Post" if u want to send information as well. in this case,
    its just checking if connection is through to backend so no need to send information
    in the backend, the associated part is @app.get which responds to the get verb */

    fetch("http://127.0.0.1:8000/") /* connecting to backend */
      .then(res => res.json()) /* converting response into readable json */
      .then(data => setStatus(data.message)) // set status to the response
      .catch(err => setStatus("Offline")) // if error, then status = Offline
    
    /* so can either do .then(some function) or do response = fetch and then 
    data = response.json() and things like that, do the latter for more complex
    functions, and do .then() for easy one-liners. fetch().then(res => res.json())
    basically .then() is a continuation, implying that what comes back is assigned
    to res, and then decode that by res.json(), and then whats decoded (lets just
    call that data), and then that unpackaged data is a python dictionary with 
    {"message": "some thing"} and so make the status data.message */

    fetch("http://127.0.0.1:8000/stars")
      .then(res => res.json())
      .then(data => {console.log("Stars loaded:", data)
        setStars(data)})    
    
    /* for ambient space audio */
    const audio = new Audio ("/space_audio.mp3") // connecting audio file
    audio.loop = true
    audio.volume = 0.05

    /* browser blocks auto-play, so play on first click */
    const playAudio = () => {
      audio.play().catch(e => console.log("Audio blocked"))
      window.removeEventListener("click", playAudio) // second click doesnt restart audio
    }
    window.addEventListener("click", playAudio) // website detects click and runs playAudio

    return () => audio.pause() // audio pauses when user leaves
  }, [])

  const handleSubmit = async () => { 
    /* for handling confession submissions, and async used so the website
    runs smoothly while waiting for a response */

    if (!inputText) return; // if no text, then do nothing

    setStatus("Sending transmission...") 
    
    try {
      const response = await fetch("http://127.0.0.1:8000/confess", { // sending to backend
        method: "POST", // giving info
        headers: { "Content-Type": "application/json" }, // characterizing info
        body: JSON.stringify({ text: inputText }) // sending readable json info
        /* originally {text: inputText} is a js object, kinda like a python
        dict, but then JSON.stringify converts that into a JSON string, 
        and on the backend side, the thing retreived is an object (this is because
        pydantic from FastAPI converts it automatically to a class object), 
        which can then be unpackaged by doing confession.text} */
      })
      /* because this function is within app(), can use inputText as a variable 
      because that state is universal within app(), so no need to feed in anything
      as an argument for this handleSubmit function */      

      const data = await response.json() 
      /* response is an envelope of information and so not unpackaged yet,
      unpackaged here by taking the data out by response.json() , await for waiting for unpackaging */
      setStatus(data.message) 
      setInputText("") 

      if (data.star) { // adding new star to the current list of stars
        setStars(prevStars => [...prevStars, data.star])
        playLaunchSound() // playing sound when star appears
      }

      console.log("Success:", data) // showed us on the website console, through inspect
    } catch (error) {
      console.error("Error:", error)
      setStatus("Transmission Failed")
    }
  }

  const playLaunchSound = () => {
    /* for launch sound when adding a star */

    /* initializing web browser's audio engine */
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    /* ensuring audio context is active */
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const oscillator = audioCtx.createOscillator()
    oscillator.type = 'sine';

    const gainNode = audioCtx.createGain();

    /* going from A440 to A880 in 0.1 second */
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);

    /* volume from 0.1 to 0.001 in 0.5 s */
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

    /* connection: oscillator --> gain (volume) --> speakers */
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    /* execution */
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
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
          value={inputText} // text inside matches what is being typed
          onChange={(e) => setInputText(e.target.value)}  // inputText is updated everytime theres a change (e)
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
        {stars.map((star) => (<SpinningStar 
                                key = {star.id} 
                                position = {star.position} 
                                text = {star.text} 
                                color = {star.color}
                                /> ))}
        {/* drawing star for every item in the list */}
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade />
        <OrbitControls autoRotate autoRotateSpeed = {0.5} />

        {/* for bloom effects */}
        <EffectComposer> 
          <Bloom
            luminanceThreshold = {0} // everything glows a little
            luminanceSmoothing = {0.9} // smooth falloff
            height = {300} // resolution
            intensity = {1.5} // how strong the glow is
            />
        </EffectComposer>
      </Canvas>
    </div>
  )
}

/* for states: 

states are to be used when things are changing on screen
useRef for things that are constantly changing, e.g. rotation (60 times a second)
normal variables for internal calculations that dont reflect on the screen*/