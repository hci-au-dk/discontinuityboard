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

## Database

There are a few database helper scripts now. Their names should be self-explanatory. If you haven't created your database before, you should do the following:

```
(venv)$ python db_create.py
(venv)$ python db_migrate.py
New migration saved as /Users/golux/Desktop/discontinuitydbtest/discontinuityboard/db_repository/versions/001_migration.py
Current database version: 1
```

Everytime you change the database model (`app/models.py`), you'll want to run a migration. This means that you need to remember to migrate your local db if someone else changes the model as well.

The `db_downgrade.py` and `db_upgrade.py` scripts will downgrade and upgrade one migration, respectively.
