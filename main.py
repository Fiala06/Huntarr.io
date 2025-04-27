#!/usr/bin/env python3
"""
Main entry point for Huntarr
Starts both the web server and the background processing tasks.
"""

import os
import threading
import sys
import signal
import logging # Use standard logging for initial setup

# Ensure the 'src' directory is in the Python path
# This allows importing modules from 'src.primary' etc.
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

# --- Early Logging Setup (Before importing app components) ---
# Basic logging to capture early errors during import or setup
log_level = logging.DEBUG if os.environ.get('DEBUG', 'false').lower() == 'true' else logging.INFO
logging.basicConfig(level=log_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', datefmt='%Y-%m-%d %H:%M:%S')
root_logger = logging.getLogger("HuntarrRoot") # Specific logger for this entry point
root_logger.info("--- Huntarr Main Process Starting ---")
root_logger.info(f"Python sys.path: {sys.path}")

try:
    # Import the Flask app instance
    from primary.web_server import app
    # Import the background task starter function and shutdown helpers from the renamed file
    from primary.background import start_huntarr, stop_event, shutdown_threads
    # Import the main logger setup from utils (if needed after basicConfig)
    from primary.utils.logger import setup_logger, get_logger
    # Re-setup logger using the application's standard setup if desired
    # logger = setup_logger() # Or get_logger("HuntarrRoot") if setup_logger configures root
    logger = get_logger("HuntarrRoot") # Use the logger configured by the app's setup
    logger.info("Successfully imported application components.")
except ImportError as e:
    root_logger.critical(f"Fatal Error: Failed to import application components: {e}", exc_info=True)
    root_logger.critical("Please ensure the application structure is correct, dependencies are installed (`pip install -r requirements.txt`), and the script is run from the project root.")
    sys.exit(1)
except Exception as e:
    root_logger.critical(f"Fatal Error: An unexpected error occurred during initial imports: {e}", exc_info=True)
    sys.exit(1)


def run_background_tasks():
    """Runs the Huntarr background processing."""
    bg_logger = get_logger("HuntarrBackground") # Use app's logger
    try:
        bg_logger.info("Starting Huntarr background tasks...")
        start_huntarr() # This function contains the main loop and shutdown logic
    except Exception as e:
        bg_logger.exception(f"Critical error in Huntarr background tasks: {e}")
    finally:
        bg_logger.info("Huntarr background tasks stopped.")

def run_web_server():
    """Runs the Flask web server using Waitress in production."""
    web_logger = get_logger("WebServer") # Use app's logger
    debug_mode = os.environ.get('DEBUG', 'false').lower() == 'true'
    host = os.environ.get('FLASK_HOST', '0.0.0.0')
    port = int(os.environ.get('PORT', 9705)) # Use PORT for consistency

    web_logger.info(f"Starting web server on {host}:{port} (Debug: {debug_mode})...")

    if debug_mode:
        # Use Flask's development server for debugging (less efficient, auto-reloads)
        # Note: use_reloader=True can cause issues with threads starting twice.
        web_logger.warning("Running in DEBUG mode with Flask development server.")
        try:
            app.run(host=host, port=port, debug=True, use_reloader=False)
        except Exception as e:
            web_logger.exception(f"Flask development server failed: {e}")
            # Signal background thread to stop if server fails critically
            if not stop_event.is_set():
                stop_event.set()
    else:
        # Use Waitress for production
        try:
            from waitress import serve
            web_logger.info("Running with Waitress production server.")
            # Adjust threads as needed, default is 4
            serve(app, host=host, port=port, threads=8)
        except ImportError:
            web_logger.error("Waitress not found. Falling back to Flask development server (NOT recommended for production).")
            web_logger.error("Install waitress ('pip install waitress') for production use.")
            try:
                app.run(host=host, port=port, debug=False, use_reloader=False)
            except Exception as e:
                web_logger.exception(f"Flask development server (fallback) failed: {e}")
                # Signal background thread to stop if server fails critically
                if not stop_event.is_set():
                    stop_event.set()
        except Exception as e:
            web_logger.exception(f"Waitress server failed: {e}")
            # Signal background thread to stop if server fails critically
            if not stop_event.is_set():
                stop_event.set()

def main_shutdown_handler(signum, frame):
    """Gracefully shut down the application."""
    logger.warning(f"Received signal {signal.Signals(signum).name}. Initiating shutdown...")
    if not stop_event.is_set():
        stop_event.set()
    # The rest of the cleanup happens after run_web_server() returns or in the finally block.

if __name__ == '__main__':
    # Register signal handlers for graceful shutdown in the main process
    signal.signal(signal.SIGINT, main_shutdown_handler)
    signal.signal(signal.SIGTERM, main_shutdown_handler)

    background_thread = None
    try:
        # Start background tasks in a daemon thread
        # Daemon threads exit automatically if the main thread exits unexpectedly,
        # but we'll try to join() them for a graceful shutdown.
        background_thread = threading.Thread(target=run_background_tasks, name="HuntarrBackground", daemon=True)
        background_thread.start()

        # Start the web server in the main thread (blocking)
        # This will run until the server is stopped (e.g., by Ctrl+C)
        run_web_server()

    except KeyboardInterrupt:
        logger.info("KeyboardInterrupt received in main thread. Shutting down...")
        if not stop_event.is_set():
            stop_event.set()
    except Exception as e:
        logger.exception(f"An unexpected error occurred in the main execution block: {e}")
        if not stop_event.is_set():
            stop_event.set() # Ensure shutdown is triggered on unexpected errors
    finally:
        # --- Cleanup ---
        logger.info("Web server has stopped. Initiating final shutdown sequence...")

        # Ensure the stop event is set (might already be set by signal handler or error)
        if not stop_event.is_set():
             logger.warning("Stop event was not set before final cleanup. Setting now.")
             stop_event.set()

        # Wait for the background thread to finish cleanly
        if background_thread and background_thread.is_alive():
            logger.info("Waiting for background tasks to complete...")
            background_thread.join(timeout=30) # Wait up to 30 seconds

            if background_thread.is_alive():
                logger.warning("Background thread did not stop gracefully within the timeout.")
        elif background_thread:
             logger.info("Background thread already stopped.")
        else:
             logger.info("Background thread was not started.")

        # Call the shutdown_threads function from primary.main (if it does more than just join)
        # This might be redundant if start_huntarr handles its own cleanup via stop_event
        # logger.info("Calling shutdown_threads()...")
        # shutdown_threads() # Uncomment if primary.main.shutdown_threads() does more cleanup

        logger.info("--- Huntarr Main Process Exiting ---")
        # Use os._exit(0) for a more forceful exit if necessary, but sys.exit(0) is generally preferred
        sys.exit(0)

from flask import Flask, render_template

app = Flask(__name__)

def get_version():
    try:
        with open('version.txt', 'r') as f:
            return f.read().strip()
    except FileNotFoundError:
        return "Unknown"

@app.context_processor
def inject_version():
    return dict(version=get_version())

