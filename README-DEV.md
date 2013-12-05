# Discontinuity Whiteboard Dev Instructions
====================

## A Guide to Going from Zero to Server in Just a Bit of Time

Start by cloning the git repository:

```
$ git clone https://github.com/hci-au-dk/discontinuityboard.git
$ cd discontinuityboard
```

Next, get your virtual environment up and running:

```
$ sudo easy_install virtualenv # if you don't have virtualenv yet

$ virtualenv venv --distribute # creates a new virtual environment named "venv"
$ source venv/bin/activate #activates the current environment

$ deactivate #when you are done with your virtual environment - Don't do this yet!
```

Next, install the required components. This requires both installing the things in `requirements.txt` and installing some other dependencies.

```
$ pip install -r requirements.txt # to install everything in the requirements
```

If you start getting errors about libraries not being available:

```
$brew install python cairo pango gdk-pixbuf libxml2 libxslt libffi # or whatever package manager you most enjoy
```

Once you have successfully installed all the requirements, you need to get your database set up:

```
$ python db_create.py
$ python db_migrate.py # should output text telling you that you did your first migration
```

Now, you are ready to run your server. If you want it to run for a long time in a place, I would recommend using `screen`.

```
$ screen -S name_of_your_session # the name can be whatever you like
$ python discontinuityboard.py # you should be able to connect to this server now!
```

To leave your `screen` session and keep your server running, `Ctrl-a d`. You can reattach with the command `screen -r` to see the processes you left running. To see all your screen sessions `screen -ls`.

You'll want to have your pi server running also for full functionality. See the instructions in `README-DEV.md` in [whiteboard-camera](https://github.com/hci-au-dk/whiteboard-camera).


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

### flask-weasyprint (for pdf-output)

If you are getting errors about libraries not being available, you need to go install all of the right ones:

```
$ brew install python cairo pango gdk-pixbuf libxml2 libxslt libffi
```

If that isn't working, you may need to do a `brew update`


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
