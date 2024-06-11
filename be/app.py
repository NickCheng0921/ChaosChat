from flask import Flask, request, jsonify, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
from flask_socketio import SocketIO, send
import os
import psycopg2
from psycopg2 import sql
import redis

from datetime import datetime
from dateutil.relativedelta import relativedelta
import time
import yfinance as yf

SLEEP_DELAY = .05 #For getting rate limited by yfinance
DEFAULT_YEARS_AGO = 1
DEFAULT_MONTHS_AGO = 0
TRIES = 3

def get_data_recent(ticker, years_ago = DEFAULT_YEARS_AGO, months_ago = DEFAULT_MONTHS_AGO):
    start = (datetime.today() - relativedelta(years=int(years_ago), months=int(months_ago))).strftime('%Y-%m-%d')
    today = datetime.today().strftime('%Y-%m-%d')

    repeats = 0
    while(repeats < TRIES):
        try:
            prices = yf.download(ticker, start=start, end=today)[['Open','Adj Close']]
            if prices.empty:
                ticker += " - NO DATA"
            break
        except:
            repeats += 1
            time.sleep(SLEEP_DELAY)
        if repeats == TRIES:
            return {'name' : ticker + " - TIMEOUT", 'dates':[], 'adj_close':[], 'open':[]}
            

    tD = {
        'name' : ticker,
        'dates' : prices.index.astype(str).tolist(),
        'adj_close' : prices['Adj Close'].tolist(),
        #'open' : prices['Open'].tolist()
    }
    
    return tD

MAX_ENTRIES = 500
app = Flask(__name__)
CORS(app, origins='*')

# Set up Redis connection
redis_url = os.getenv('STACKHERO_REDIS_URL_TLS', 'redis://localhost:6379/0')
print("REDIS_URL", redis_url)
redis_client = redis.StrictRedis.from_url(redis_url)

# Configure Flask-SocketIO to use Redis as the message queue
socketio = SocketIO(app, cors_allowed_origins='*', message_queue=redis_url)

# Database connection
DATABASE_URL = os.environ['DATABASE_URL']
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

usrs = []

# Define the Message model
class Message:
    def __init__(self, username, content):
        self.username = username
        self.content = content
        self.timestamp = datetime.now()
        
        cur.execute('SELECT MAX("order") FROM messages')
        max_order = cur.fetchone()[0]
        self.order = max_order + 1 if max_order is not None else 1

    def save(self):
        cur.execute(
            sql.SQL('INSERT INTO messages (username, content, timestamp, "order") VALUES (%s, %s, %s, %s)'),
            [self.username, self.content, self.timestamp, self.order]
        )
        conn.commit()

# Creating the messages table if it doesn't exist
cur.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    username VARCHAR(30) NOT NULL,
    content VARCHAR(200) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER NOT NULL
)
""")
conn.commit()

def count_entries():
    cur.execute("SELECT COUNT(id) FROM messages")
    return cur.fetchone()[0]

# Define the function to delete half of the entries
def delete_half_entries():
    half_count = count_entries() // 2
    cur.execute("""
        DELETE FROM messages
        WHERE id IN (
            SELECT id FROM messages
            ORDER BY timestamp
            LIMIT %s
        )
    """, [half_count])
    conn.commit()

def swap_message_order(pos1, pos2):
    print('got p1, p2', pos1, pos2)
    return
    message1 = session.query(Message).filter_by(order=pos1).first()
    message2 = session.query(Message).filter_by(order=pos2).first()

    if not message1 or not message2:
        print(f"ERROR: One or both positions are out of range for {pos1} {pos2}")
        return
    
    message1.order, message2.order = message2.order, message1.order
    session.commit()

@app.route('/', methods=['GET'])
def index():
    return render_template('index.html')

@app.route('/messages', methods=['GET'])
def get_messages():
    cur.execute('SELECT id, username, content, timestamp, "order" FROM messages ORDER BY \"order\"')
    messages = cur.fetchall()
    messages_list = []
    for message in messages:
        messages_list.append({
            'id': message[0],
            'username': message[1],
            'content': message[2],
            'timestamp': message[3].isoformat(),
            'order': message[4]
        })
    return jsonify(messages_list)

@app.route('/messages', methods=['POST'])
def add_message():
    data = request.get_json()
    new_message = Message(username=data['username'], content=data['content'])
    new_message.save()
    
    return jsonify({'id': new_message.id, 'timestamp': new_message.timestamp.isoformat()}), 201

@app.route('/ticker/', methods=['POST'])
def ticker():
    response = hp.get_data_recent(request.form['ticker'], request.form['years_ago'], request.form['months_ago'])
    return response

def clearChat():
    cur.execute("DELETE FROM messages")
    conn.commit()

@socketio.on('connect')
def handle_connect():
    send({'type': 'handshake'})
    usrs.append(request.sid)

@socketio.on('disconnect')
def handle_disconnect():
    usrs.remove(request.sid)

@socketio.on('message')
def handle_message(msg):
    if 'username' in msg and 'content' in msg:
        new_message = Message(username=msg['username'], content=msg['content'])
        new_message.save()

        if count_entries() > MAX_ENTRIES:
            delete_half_entries()

        send({
            'type': 'chat',
            'id': new_message.order,
            'timestamp': new_message.timestamp.isoformat(),
            'username': msg['username'],
            'content': msg['content']
        }, broadcast=True)
    
    if 'pos1' in msg and 'pos2' in msg:
        swap_message_order(msg['pos1'], msg['pos2'])
    
    if 'clearChat' in msg:
        clearChat()
        send({'type': 'clearChat'}, broadcast=True);

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=int(os.getenv('PORT', 5000)), debug=True)
