import asyncio
import logging
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

from livekit.agents import AgentSession, JobContext, WorkerOptions, cli
from livekit.plugins import openai, silero, cartesia
from agent import QBeatVoiceAgent
from logger import setup_logger

# Setup logger for the main application
logger = setup_logger('qbeatai_main', 'logs/main.log')

async def entrypoint(ctx: JobContext):
    """LiveKit agent entry point"""
    logger.info("Starting QBeatAI voice agent entry point")
    
    try:
        # Create AgentSession with STT/LLM/TTS/VAD configuration
        logger.info("Creating AgentSession with OpenAI STT/LLM, Cartesia TTS, and Silero VAD")
        session = AgentSession(
            stt=openai.STT(model="whisper-1"),
            llm=openai.LLM(model="gpt-4o-mini"),  # Faster, cheaper model
            tts=cartesia.TTS(
                voice="79a125e8-cd45-4c13-8a67-188112f4dd22",  # British Lady voice
                # model="sonic-english",  # Fastest model
                sample_rate=24000,
            ),
            vad=silero.VAD.load()
        )
        
        # Initialize QBeatVoiceAgent
        logger.info("Initializing QBeatVoiceAgent")
        agent = QBeatVoiceAgent()
        
        # Add event handlers for transcript logging
        @session.on("user_input_transcribed")
        def on_user_speech(event):
            logger.info(f"USER SPEECH: {event.transcript}")
            agent._add_to_transcript("CUSTOMER", event.transcript)

        @session.on("agent_state_changed")
        def on_agent_state_change(event):
            logger.info(f"AGENT STATE: {event.old_state} → {event.new_state}")
            if event.new_state == "speaking":
                agent._log_conversation_state("agent_speaking")
            elif event.new_state == "listening":
                agent._log_conversation_state("agent_listening")

        @session.on("speech_created")
        def on_speech_created(event):
            logger.info("AGENT: Starting to speak")

        # Start the session with the agent
        logger.info("Starting AgentSession in LiveKit room")
        await session.start(
            room=ctx.room,
            agent=agent
        )
        
        # Send initial greeting
        logger.info("Sending initial greeting to customer")
        greeting = await session.generate_reply(
            instructions="Greet the customer warmly and ask if they're interested in breakfast, lunch, or the kids menu."
        )
        agent._add_to_transcript("AGENT", "Session started - greeting sent")
        
        logger.info("Voice assistant successfully initialized and greeting sent")
        
    except Exception as e:
        logger.error(f"Error in entrypoint: {e}", exc_info=True)
        raise

if __name__ == "__main__":
    cli.run_app(WorkerOptions(entrypoint_fnc=entrypoint))
