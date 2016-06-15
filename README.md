# NTU-SpicyCource
NTU Spicy Course.

# Installing
  1. `pip3 install -r requirements.txt`
  2. check if you have a Firefox that is happy with Selenium. **THIS IS IMPORTANT SINCE YOU REALLY NEED A COMPATIBLE FIREFOX!!**
  3. if not, (download a legacy Firefox and) link one to `data/firefox-bin`.
  
# Running
Run `python3 server.py`, the server will start listening the request after a browser instance is initialized. You don't have to take care of the browser; they will close automatically when the server is killed. 

