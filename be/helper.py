#General
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