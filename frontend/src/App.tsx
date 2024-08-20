import { useEffect, useState } from 'react'
import './App.css'
import { initialVesselData } from './DataInit'
import { useTracking, useWebSocket } from './utils';

type VesselData = {
  id: number;
  name: string;
  imo: number;
  lat: number;
  lng: number;
  destination: string;
}

type VesselDetails = {
  name: string;
  imo: string;
  lat: string;
  lng: string;
  destination: string;
}

type SocketDto = {
  imo: number;
  lat: number;
  lng: number;
  destination: string;
}

const emptyVessel: VesselDetails = {
  name: '',
  imo: '',
  lat: '',
  lng: '',
  destination: ''
}

function App() {
  const tableHeaders = Object.keys(initialVesselData[0])
  const [vesselData, setVesselData] = useState<VesselData[]>(initialVesselData)
  const [trackedVessels, setTrackedVessels] = useState<number[]>([])
  const [newVessel, setNewVessel] = useState<VesselDetails>(emptyVessel)
  const [tempTracker, setTempTracker] = useState<number>(0)
  
  const createVessel = () => {
    setVesselData(prev => [...prev, {
      id: vesselData[vesselData.length - 1].id + 1,
      name: newVessel.name,
      imo: Number(newVessel.imo),
      lat: Number(newVessel.lat),
      lng: Number(newVessel.lng),
      destination: newVessel.destination
    }])
    setNewVessel(emptyVessel)
  }

  const deleteVessel = (id: number) => {
    const filtered = vesselData.filter(vessel => vessel.id !== id)
    const deletedVessel = vesselData.find(vessel => vessel.id === id)
    const filteredTracked = trackedVessels.filter(imo => {
      return imo !== deletedVessel?.imo
    })
    setVesselData(filtered)
    setTrackedVessels(filteredTracked)
  }

  const trackVessel = (imo: number) => {
    const idx = trackedVessels.findIndex(val => val === imo)
    if (idx !== -1) {
      setTrackedVessels(prev => prev.filter(val => val !== imo))
    } else {
      setTrackedVessels(prev => [...prev, imo])
    }
    
  }

  const {startTrackVessel, clearTracking, isTracking} = useTracking()
  const latestData = useWebSocket<SocketDto>("ws://localhost:443")

  useEffect(() => {
    if (isTracking && latestData.length > 0) {
      
      //update the vessel data
      for (let i = 0; i < latestData.length; i++) {
        const newData = latestData[i]
        const index = vesselData.findIndex(vessel => vessel.imo === newData.imo)
        if (index !== -1) {
          const updatedData = {
            ...vesselData[index],
            lat: newData.lat,
            lng: newData.lng,
            destination: newData.destination
          }
          vesselData[index] = updatedData
          setTempTracker(prev => prev + 1)
        }
      }
      setVesselData([...vesselData])
    }
  }, [latestData, isTracking])

  useEffect(() => {
    if (isTracking && trackedVessels.length === 0) {
      console.log("Stop tracking")
      clearTracking()
      setTempTracker(0)
    } else if (isTracking && tempTracker === trackedVessels.length) {
      console.log("RESTART as all tracked vessels data are received")
      startTrackVessel(trackedVessels)
      setTempTracker(0)
    }
    
  }, [tempTracker, trackedVessels, isTracking])


  useEffect(() => {
    if (trackedVessels.length > 0) {
      console.log("RESTART Tracking due to change in tracked vessels")
      startTrackVessel(trackedVessels)
      setTempTracker(0)
    }
  }, [trackedVessels])
  
  return (
    <div className='container'>
      <table>
        <tr>
          {tableHeaders.map(header => (<th>{header}</th>))}
          <th>Actions</th>
        </tr>
        {vesselData.map(vessel => {
          return (
          <tr>
            {Object.values(vessel).map(value => (<td>{value}</td>))}
            <td>
              <button onClick={() => deleteVessel(vessel.id)} style={{marginRight: '0.5rem'}}>DELETE</button>
              <button onClick={() => trackVessel(vessel.imo)}>{trackedVessels.findIndex(vesselIMO => vesselIMO === vessel.imo) !== -1 ? "UNTRACK" : "TRACK"}</button>
            </td>
          </tr>)
        })}
      </table>
      <div className='form-container'>
        <h3>Create Vessel</h3>
        <div className='field'>
          <label>name: </label>
          <input type='text' value={newVessel.name} onChange={eve => setNewVessel(prev => ({...prev, name: eve.target.value}))}></input>
        </div>
        <div className='field'>
          <label>imo: </label>
          <input type='text' value={newVessel.imo} onChange={eve => setNewVessel(prev => ({...prev, imo: eve.target.value}))}></input>
        </div>
        <div className='field'>
          <label>lat: </label>
          <input type='text' value={newVessel.lat} onChange={eve => setNewVessel(prev => ({...prev, lat: eve.target.value}))}></input>
        </div>
        <div className='field'>
          <label>lng: </label>
          <input type='text' value={newVessel.lng} onChange={eve => setNewVessel(prev => ({...prev, lng: eve.target.value}))}></input>
        </div>
        <div className='field'>
          <label>destination: </label>
          <input type='text' value={newVessel.destination} onChange={eve => setNewVessel(prev => ({...prev, destination: eve.target.value}))}></input>
        </div>
        <button onClick={createVessel}>Create</button>
      </div>
    </div>
  )
}

export default App
