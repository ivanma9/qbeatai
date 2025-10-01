import { useState, useEffect } from 'react'
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useTracks
} from '@livekit/components-react'
import { Track } from 'livekit-client'

function VoiceAssistantUI () {
  const room = useRoomContext()
  const tracks = useTracks([Track.Source.Microphone], { onlySubscribed: false })
  const [status, setStatus] = useState('connecting')
  const [transcript, setTranscript] = useState([])
  const [agentActivity, setAgentActivity] = useState('idle')
  const [orderStatus, setOrderStatus] = useState(null)

  useEffect(() => {
    if (room) {
      room.on('connected', () => setStatus('connected'))
      room.on('disconnected', () => setStatus('disconnected'))

      // Listen for custom events from voice agent
      room.on('dataReceived', (payload, participant) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload))
          if (data.type === 'transcript') {
            setTranscript(prev => [...prev, data])
          } else if (data.type === 'status') {
            setStatus(data.status)
          } else if (data.type === 'agent_activity') {
            setAgentActivity(data.activity)
          } else if (data.type === 'order_completed') {
            setOrderStatus({
              message: data.message,
              total: data.total,
              disconnectIn: data.disconnect_in
            })
          }
        } catch (e) {
          console.log('Non-JSON data received:', e)
        }
      })

      // Listen for audio track events to detect agent speaking
      room.on('trackSubscribed', (track, publication, participant) => {
        if (participant.identity.includes('agent') && track.kind === 'audio') {
          setAgentActivity('speaking')
        }
      })

      room.on('trackUnsubscribed', (track, publication, participant) => {
        if (participant.identity.includes('agent') && track.kind === 'audio') {
          setAgentActivity('idle')
        }
      })

      // Listen for transcription events
      room.on('trackMessage', (message, participant) => {
        try {
          const data = JSON.parse(message)
          if (data.type === 'transcript') {
            setTranscript(prev => [...prev, {
              speaker: data.speaker,
              text: data.text,
              timestamp: data.timestamp
            }])
          }
        } catch (e) {
          // Handle non-JSON messages
        }
      })
    }
  }, [room])

  const getStatusDisplay = () => {
    // Priority: Order status > Agent activity > Connection status
    if (orderStatus) {
      return { text: orderStatus.message, color: 'text-green-600', icon: '✅' }
    }
    
    switch (agentActivity) {
      case 'speaking': return { text: 'Agent Speaking...', color: 'text-orange-600', icon: '🔊' }
      case 'thinking': return { text: 'Agent Thinking...', color: 'text-purple-600', icon: '🧠' }
      case 'listening': return { text: 'Agent Listening...', color: 'text-blue-600', icon: '👂' }
    }
    
    switch (status) {
      case 'connecting': return { text: 'Connecting...', color: 'text-yellow-600', icon: '🔄' }
      case 'connected': return { text: 'Ready to Talk', color: 'text-green-600', icon: '✅' }
      case 'disconnected': return { text: 'Disconnected', color: 'text-red-600', icon: '❌' }
      default: return { text: 'Ready', color: 'text-gray-600', icon: '⭕' }
    }
  }

  const statusInfo = getStatusDisplay()

  // Handle order completion auto-disconnect
  useEffect(() => {
    if (orderStatus && orderStatus.disconnectIn) {
      const timer = setTimeout(() => {
        room?.disconnect()
      }, orderStatus.disconnectIn)
      
      return () => clearTimeout(timer)
    }
  }, [orderStatus, room])

  return (
    <div className="space-y-4">
      {/* Order Completion Banner */}
      {orderStatus && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
          <div className="text-green-800 font-bold text-lg mb-2">
            🎉 Order Confirmed!
          </div>
          <div className="text-green-700">
            Total: ${orderStatus.total?.toFixed(2)}
          </div>
          <div className="text-green-600 text-sm mt-2">
            Call ending automatically...
          </div>
        </div>
      )}

      {/* Status Display */}
      <div className="flex items-center justify-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <span className="text-2xl">{statusInfo.icon}</span>
        <span className={`font-medium ${statusInfo.color}`}>
          {statusInfo.text}
        </span>
        {agentActivity === 'speaking' && (
          <div className="ml-2 flex space-x-1">
            <div className="w-1 h-4 bg-orange-400 rounded animate-pulse"></div>
            <div className="w-1 h-4 bg-orange-400 rounded animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-1 h-4 bg-orange-400 rounded animate-pulse" style={{animationDelay: '0.4s'}}></div>
          </div>
        )}
      </div>

      {/* Audio Visualizer Placeholder */}
      <div className="h-20 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
        <div className="flex space-x-1">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`w-2 bg-blue-400 rounded-full transition-all duration-300 ${
                status === 'listening' || status === 'speaking'
                  ? 'h-8 animate-pulse'
                  : 'h-3'
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Recent Transcript */}
      {transcript.length > 0 && (
        <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 font-medium mb-2">Recent Conversation:</div>
          {transcript.slice(-5).map((entry, idx) => (
            <div key={idx} className="text-sm">
              <div className={`flex items-start space-x-2 ${
                entry.speaker === 'CUSTOMER' ? 'justify-end' : 'justify-start'
              }`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                  entry.speaker === 'CUSTOMER' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white border border-gray-200 text-gray-800'
                }`}>
                  <div className="text-xs opacity-75 mb-1">
                    {entry.speaker === 'CUSTOMER' ? '👤 You' : '🤖 Assistant'}
                  </div>
                  <div>{entry.text}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="text-center space-y-2 text-sm text-gray-600">
        <p>🎤 <strong>Speak naturally</strong> - "I'd like breakfast"</p>
        <p>💬 <strong>Ask questions</strong> - "What's in the Sunrise Croissant?"</p>
        <p>🛒 <strong>Order easily</strong> - "One Croissant with bacon, please"</p>
      </div>
    </div>
  )
}

function VoiceOrderInterface ({ isOpen, onClose, currentCart, onCartUpdate }) {
  const [connectionData, setConnectionData] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen && !connectionData && !connecting) {
      startVoiceSession()
    }
  }, [isOpen, connectionData, connecting])

  const startVoiceSession = async () => {
    setConnecting(true)
    setError(null)

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true })

      // Get LiveKit connection data
      const response = await fetch('/api/voice-session', {
        method: 'POST'
      })

      if (!response.ok) throw new Error('Failed to create voice session')

      const data = await response.json()
      setConnectionData(data)
    } catch (error) {
      console.error('Voice session start failed:', error)
      setError(error.message)
    } finally {
      setConnecting(false)
    }
  }

  const handleClose = () => {
    setConnectionData(null)
    setError(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">🎤 Voice Order</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Connection States */}
        {connecting && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up your voice session...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-700">
              <strong>Connection Error:</strong> {error}
            </p>
            <button
              onClick={startVoiceSession}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {connectionData && (
          <LiveKitRoom
            token={connectionData.token}
            serverUrl={connectionData.url}
            connect={true}
            audio={true}
            video={false}
            onConnected={() => console.log('Connected to voice room')}
            onDisconnected={handleClose}
          >
            <VoiceAssistantUI />
            <RoomAudioRenderer />
          </LiveKitRoom>
        )}

        {/* Quick Actions */}
        <div className="flex space-x-2 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 py-2 px-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Switch to Text
          </button>
        </div>
      </div>
    </div>
  )
}

export default VoiceOrderInterface
