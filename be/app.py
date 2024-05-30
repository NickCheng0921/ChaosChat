from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'
#app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class Message(db.Model):
	id = db.Column(db.Integer, primary_key=True)
	username = db.Column(db.String(80), nullable=False)
	content = db.Column(db.String(200), nullable=False)
	timestamp = db.Column(db.DateTime, default=datetime.now)

@app.route('/messages', methods=['GET'])
def get_messages():
	messages = Message.query.order_by(Message.timestamp).all()
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
	db.session.add(new_message)
	db.session.commit()
	return jsonify({'id': new_message.id, 'timestamp': new_message.timestamp.isoformat()}), 201

if __name__ == '__main__':
	db.create_all()
	app.run(debug=True)
