from app import app, db
import sys

if __name__ == '__main__': 
    host = sys.argv[1]
    debug = host != '0.0.0.0'

    if debug is not True:
        import logging
        from logging.handlers import RotatingFileHandler
        app.logger.setLevel(logging.INFO) # use the native logger of flask

        handler = logging.handlers.RotatingFileHandler(
            app.config['LOG_FILENAME'],
            maxBytes=1024 * 1024 * 100,
            backupCount=20
            )

        app.logger.addHandler(handler)

    app.run(host=host, debug=debug, port=80)


