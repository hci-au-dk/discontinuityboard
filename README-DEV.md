# Discontinuity Whiteboard Dev Instructions
====================

## Running the server

To run the server locally, simply type:

```
(venv)$ python discontinuityboard.py
```

## Requirements

To get an up-to-date version of the requirements in your virtual environment, run the following:

```
(venv)$ pip install -r requirements.txt
```

If you have not gotten the tests to pass previously, it is likely that you will encounter errors with `pillow`. See the below note.

If you have updated the requirements, remember to `pip freeze > requirements.txt` so that these changes get pushed to the repo!

### Pillow errors

If you start getting an error when running:

```
(venv)$ nosetests
```

that is complaining about missing decoders, you need to install `jpeg`. If you are running Mac OS X, the easiest way to do this is either to use homebrew (`brew install jpeg`) or macports (`port install jpeg`). You'll then need to run the following commands:

```
(venv)$ pip uninstall pillow
(venv)$ pip install pillow
```
