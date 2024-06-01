from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from flask_socketio import SocketIO, send
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import create_engine
from sqlalchemy import create_engine, Column, Integer, String, DateTime, func

MAX_ENTRIES = 250

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
db = SQLAlchemy(app)
socketio = SocketIO(app, cors_allowed_origins='*')

# Define the base for declarative models
Base = declarative_base()

# Create an instance of the engine
engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])

# Define the Message model using declarative base
class Message(Base):
	__tablename__ = 'messages'
	id = Column(Integer, primary_key=True)
	username = Column(String(80), nullable=False)
	content = Column(String(200), nullable=False)
	timestamp = Column(DateTime, default=datetime.now)

Base.metadata.create_all(engine)

# Set up the session
Session = sessionmaker(bind=engine)
session = Session()

def count_entries(session):
	return session.query(func.count(Message.id)).scalar()

def delete_half_entries(session):
	half_count = count_entries(session) // 2
	subquery = session.query(Message.id).order_by(Message.timestamp).limit(half_count).subquery()
	session.query(Message).filter(Message.id.in_(subquery)).delete(synchronize_session=False)
	session.commit()

@app.route('/messages', methods=['GET'])
def get_messages():
	messages = session.query(Message).order_by(Message.timestamp).all()
	return jsonify([
		{
			'id': msg.id,
			'username': msg.username,
			'content': msg.content,
			'timestamp': msg.timestamp.isoformat()
		} for msg in messages
	])

@app.route('/messages', methods=['POST'])
def add_message():
	data = request.get_json()
	new_message = Message(username=data['username'], content=data['content'])
	session.add(new_message)
	session.commit()

	return jsonify({'id': new_message.id, 'timestamp': new_message.timestamp.isoformat()}), 201

@socketio.on('connect')
def handle_connect():
	print('Client connected')

@socketio.on('message')
def handle_message(msg):
	if 'username' in msg and 'content' in msg:
		new_message = Message(username=msg['username'], content=msg['content'])
		session.add(new_message)
		session.commit()

		if count_entries(session) > MAX_ENTRIES:
			delete_half_entries(session)

		send({
			'id': new_message.id,
			'timestamp': new_message.timestamp.isoformat(),
			'username': msg['username'],
			'content': msg['content']
		}, broadcast=True)

if __name__ == '__main__':
	socketio.run(app, debug=True)