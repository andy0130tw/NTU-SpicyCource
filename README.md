# NTU-SpicyCource
NTU Spicy Course.

# Installing
  1. `pip3 install -r requirements.txt`
  2. We spawns a browser to fetch data.
    * PhantomJS is used as default.
    * If you are a FF lover or have a Firefox that is happy with Selenium, you can still use it. Just symbolic link the binary to `data/firefox-bin`. If you are using the lastest version, you may need to download a legacy Firefox. **THIS IS IMPORTANT SINCE YOU REALLY NEED A COMPATIBLE FIREFOX!!**
  3. Change the port (`5566` default) in `server.py`.

# Running
Run `python3 server.py`, the server will start listening the request after a browser instance is initialized. You don't have to take care of the browser; they will close automatically when the server is killed.

# Contributors
  * [Ping Chen](https://github.com/artistic709), the holly PM with core algorithms in mind.
  * [Andy Pan](https://github.com/andy0130tw) for server-side code, fixing JavaScript occasionally.
  * [Katrina Zhan](https://github.com/katrina76) for frond end and visualization.
  * [Inndy Lin](https://github.com/Inndy) as a code reviewer.
