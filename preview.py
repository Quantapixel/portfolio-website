"""Local static preview with the same page routes as vercel.json."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(Path(__file__).parent), **kwargs)

    def do_GET(self):
        route = urlsplit(self.path).path
        if route == '/about':
            self.path = '/about.html'
        elif route == '/projects':
            self.path = '/index.html'
        super().do_GET()

if __name__ == '__main__':
    print('Preview: http://127.0.0.1:4181', flush=True)
    ThreadingHTTPServer(('127.0.0.1', 4181), Handler).serve_forever()
