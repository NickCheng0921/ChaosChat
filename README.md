# Web Chat

Web Chat written in React + Flask.

## Design Overview

### Frameworks

<a href="https://flask.palletsprojects.com/en/3.0.x/">
	<img src="./readme/flask.png" alt="flask" width="150" height="100">
</a>
<a href="https://gunicorn.org/" style="display: inline-block;">
	<img src="./readme/gunicorn.jpeg" alt="gunicorn" width="250" height="100">
</a>
<a href="https://gunicorn.org/" style="display: inline-block;">
	<img src="./readme/heroku.png" alt="heroku" width="100" height="100">
</a>
<a href="https://nodejs.org/en" style="display: inline-block;">
	<img src="./readme/node.png" alt="node" width="100" height="100">
</a>
<a href="https://www.postgresql.org/" style="display: inline-block;">
	<img src="./readme/postgres.png" alt="postgres" width="100" height="100">
</a>
<a href="https://react.dev/" style="display: inline-block;">
	<img src="./readme/react.png" alt="react" width="100" height="100">
</a>
<a href="https://redis.io/" style="display: inline-block;">
	<img src="./readme/redis.jpeg" alt="redis" width="100" height="100">
</a>

### Description

Frontend written with React + Typescript and backend written with Flask + websockets. Hosting was done using heroku with separate instances for frontend and backend.

Frontend hosting uses a node buildpack, while backend hosting uses Gunicorn for speed and scalability, along with Redis to allow for worker communications. Redis is necessary as When a client connects to the chat, their websocket belongs to a single Gunicorn worker. If we want to broadcast an update to all connected users that a message has been sent, then we need a method for a single Gunicorn worker to communicate with all workers, which can be done with Redis.

DB for messages is an Essential 0 Postgres attached to the backend instance.

## Current features

Status indicator of whether connection is online

Ability to clear chat for all users

Unlockable autoscroll

Ability to rearrange chat messages

## Demo

<img src="./readme/chatDemo.gif" height="500px"><img src="./readme/dragDemo.gif" height="500px">