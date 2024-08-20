//create a hook for tracking

import { useEffect, useRef, useState } from "react"

const postApiTrack = (trackedVessels: number[]) => {
  return fetch("http://localhost:8080/api/track", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(trackedVessels)
  }).then(() => console.log("Tracking Vessels"))
}

export function useTracking() {
  //starts a timer for 2 minutes and after 2 minutes is up, send a post request
  //once post request is sent, start a time for 2 seconds
  //within this timeframe, if all data are retrieved, call the 2min timeout again
  //If not all data are received, start timeout for 1 min
  const [intervalId, setIntervalId] = useState<number>(0)
  const [isTracking, setIsTracking] = useState<boolean>(false)
  // const [vesselDataCount, setVesselDataCount] = useState<number>(numOfVesselsTracked)


  const startTrackVessel = (trackedVessels: number[]) => {
    clearTracking()
    setIsTracking(true)
    const id = setInterval(async() => {
      try {
        await postApiTrack(trackedVessels)
      } catch(err) {
        console.log(err)
      }
      console.log("3 minutes have passed! timeout reached. Restart!")
    }, 3 * 60 * 1000)
    setIntervalId(id)
  }

  const clearTracking = () => {
    clearInterval(intervalId)
    setIntervalId(0)
    setIsTracking(false)
  }

  return {
    startTrackVessel,
    clearTracking,
    isTracking
  }
}

export function useWebSocket<T>(url: string) {
  const [latestData, setLatestData] = useState<T[]>([])
  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    socket.current = new WebSocket(url)
    if (socket.current) {
      socket.current.onopen = () => {
        console.log(`Websocket connection established at : ${url}`)
      }

      socket.current.onmessage = (event: MessageEvent) => {
        const data: T[] = JSON.parse(event.data)
        setLatestData(data)
      }

      socket.current.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }
    
  }, [url])

  return latestData
}