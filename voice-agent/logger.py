import logging
import sys
from logging.handlers import RotatingFileHandler
from pathlib import Path

def setup_logger(
    name: str = 'app',
    log_file: str = 'logs/app.log',
    level: int = logging.INFO,
    max_bytes: int = 5 * 1024 * 1024,  # 5 MB
    backup_count: int = 3
) -> logging.Logger:
    """
    Set up a logger with rotating file and console output.
    """
    # Ensure log directory exists
    Path(log_file).parent.mkdir(parents=True, exist_ok=True)

    # Create logger
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.propagate = False  # Avoid duplicate logs if root logger is used

    # Formatter
    formatter = logging.Formatter(
        '[%(asctime)s] [%(levelname)s] %(name)s: %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )

    # File handler with rotation
    file_handler = RotatingFileHandler(log_file, maxBytes=max_bytes, backupCount=backup_count)
    file_handler.setFormatter(formatter)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)

    # Avoid adding multiple handlers if already set
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger
