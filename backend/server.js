import express from 'express'
import { WebSocketServer } from 'ws'
import WebSocket from 'ws';
import cors from 'cors'




const testData = [
  {
    "imo": 9741413,
    "lat": 1.272643,
    "lng": 103.773867,
    "destination": "PILOT EAST BOARD GRD P"
  },
  {
    "imo": 9466984,
    "lat": 2.22222,
    "lng": 104.332231,
    "destination": "PILOT EAST BOUND GRD T"
  },
]

const app = express()
app.use(express.json());
const wss = new WebSocketServer({port: 443})

app.use(
  cors({
    origin: "http://localhost:5173"
  })
)

let wsConnection;

wss.on('connection', (ws) => {
  console.log("Backend Web Socket Connected")

  wsConnection = ws

  ws.on('close', () => {
    console.log('Client disconnected');
    wsConnection = null;
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
})


app.post('/api/updated-vessel-information', (_, res) => {
  if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
    wsConnection.send(JSON.stringify(testData))
    res.send("Message sent!")
  } else {
    res.status(400).send("Error as there is no active Websocket connection")
  }
})

app.post('/api/track', (req, res) => {
  res.send()
})




const PORT = 8080;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

