function VoiceOrderButton ({ onClick, isActive }) {
  return (
    <button
      onClick={onClick}
      className={`fixed bottom-6 left-6 w-16 h-16 rounded-full shadow-xl transition-all duration-300 flex items-center justify-center text-2xl z-40 ${
        isActive
          ? 'bg-red-500 hover:bg-red-600 animate-pulse'
          : 'bg-blue-500 hover:bg-blue-600 hover:scale-110'
      }`}
      title={isActive ? 'End Voice Order' : 'Start Voice Order'}
    >
      {isActive ? '🔴' : '🎤'}
    </button>
  )
}

export default VoiceOrderButton
