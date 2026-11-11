"""Render local slides with an already running, isolated Chrome CDP instance.
No external Python packages required. Does not launch or alter the user's browser.
"""
import base64, json, os, socket, struct, time, urllib.request
from pathlib import Path

class CDP:
    def __init__(self, url):
        from urllib.parse import urlparse
        u=urlparse(url); self.sock=socket.create_connection((u.hostname,u.port),timeout=15); self.seq=0
        key=base64.b64encode(os.urandom(16)).decode()
        self.sock.sendall(('GET '+u.path+' HTTP/1.1\r\nHost: '+u.netloc+'\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: '+key+'\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
        h=b''
        while not h.endswith(b'\r\n\r\n'): h+=self.sock.recv(1)
        assert b'101' in h,h
    def read(self,n):
        b=b''
        while len(b)<n:
            c=self.sock.recv(n-len(b))
            if not c: raise RuntimeError('Chrome closed connection')
            b+=c
        return b
    def call(self, method, params=None):
        self.seq+=1; payload=json.dumps(dict(id=self.seq,method=method,params=params or {})).encode(); mask=os.urandom(4); n=len(payload)
        header=bytes([0x81,0x80|(n if n<126 else 126 if n<65536 else 127)])
        if n>=126: header+=struct.pack('!H' if n<65536 else '!Q',n)
        self.sock.sendall(header+mask+bytes(c^mask[i%4] for i,c in enumerate(payload)))
        while True:
            h=self.read(2); n=h[1]&127
            if n==126:n=struct.unpack('!H',self.read(2))[0]
            if n==127:n=struct.unpack('!Q',self.read(8))[0]
            msg=json.loads(self.read(n))
            if msg.get('id')==self.seq:
                if 'error' in msg:raise RuntimeError(msg['error'])
                return msg.get('result',{})
    def js(self, expression):
        r=self.call('Runtime.evaluate',dict(expression=expression,returnByValue=True,awaitPromise=True))
        if 'exceptionDetails' in r:raise RuntimeError(r['exceptionDetails'])
        return r.get('result',{}).get('value')

if __name__=='__main__':
    import argparse
    parser=argparse.ArgumentParser(description='Verify slides with an isolated, already running Chrome instance.')
    parser.add_argument('--url',default='http://127.0.0.1:8000')
    parser.add_argument('--debug-port',type=int,default=9333)
    parser.add_argument('--output',default='artifacts/slide-review')
    args=parser.parse_args()
    out=Path(args.output);out.mkdir(parents=True,exist_ok=True)
    # Create our own tab; never select an arbitrary existing page.
    req=urllib.request.Request(f'http://127.0.0.1:{args.debug_port}/json/new?about:blank',method='PUT')
    target=json.load(urllib.request.urlopen(req))
    c=CDP(target['webSocketDebuggerUrl'])
    c.call('Page.enable');c.call('Runtime.enable');c.call('Network.enable')
    c.call('Network.setCacheDisabled',dict(cacheDisabled=True))
    c.call('Emulation.setDeviceMetricsOverride',dict(width=2200,height=1400,deviceScaleFactor=1,mobile=False))
    c.call('Page.navigate',dict(url=args.url+'/index.html?qa='+str(time.time_ns())+'#cover'))
    time.sleep(0.3)
    ready=c.js("new Promise(resolve=>{let n=0;const t=setInterval(()=>{if(document.querySelector('.slide-canvas')){clearInterval(t);document.fonts.ready.then(()=>requestAnimationFrame(()=>resolve(true)))}else if(++n>100){clearInterval(t);resolve(false)}},50)})")
    assert ready,'Slides did not initialize'
    ids=c.js('window.PORTFOLIO.slides.map(s=>s.id)');reports=[]
    for i,id in enumerate(ids):
        c.js('location.hash='+json.dumps(id))
        c.js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        report=c.js("""(()=>{const a=document.querySelector('.slide-canvas'),b=a.getBoundingClientRect(),scale=b.width/1920;const rect=e=>{const r=e.getBoundingClientRect();return {x:(r.x-b.x)/scale,y:(r.y-b.y)/scale,w:r.width/scale,h:r.height/scale}};const body=a.querySelector('.slide-body'),br=rect(body);const texts=[...a.querySelectorAll('h1,h2,h3,p,td,th,dt,dd,figcaption,.tag')].filter(e=>e.textContent.trim()&&e.getClientRects().length);const overflow=[];for(const e of texts){const r=rect(e);if(r.x<70||r.x+r.w>1850||r.y<0||r.y+r.h>1080||e.scrollHeight>e.clientHeight+2||e.scrollWidth>e.clientWidth+2)overflow.push({text:e.textContent,rect:r});if(body.contains(e)&&r.y+r.h>br.y+br.h+2)overflow.push({kind:'body',text:e.textContent,rect:r,body:br})}const overlaps=[];for(let i=0;i<texts.length;i++)for(let j=i+1;j<texts.length;j++){const x=texts[i],y=texts[j];if(x.contains(y)||y.contains(x))continue;const u=rect(x),v=rect(y);if(Math.min(u.x+u.w,v.x+v.w)-Math.max(u.x,v.x)>3&&Math.min(u.y+u.h,v.y+v.h)-Math.max(u.y,v.y)>3)overlaps.push([x.textContent,y.textContent])}return {id:a.parentElement.id,canvas:{w:b.width,h:b.height},overflow,overlaps,body:br,images:a.querySelectorAll('img').length,clip:{x:b.x+scrollX,y:b.y+scrollY,width:b.width,height:b.height,scale:1}}})()""")
        shot=c.call('Page.captureScreenshot',dict(format='png',clip=report.pop('clip'),captureBeyondViewport=True))
        (out/f'{i+1:02}-{id}.png').write_bytes(base64.b64decode(shot['data']));reports.append(report)
    modes={}
    modes['readingCount']=c.js("document.querySelector('#mode-toggle').click();document.querySelectorAll('.slide-canvas').length")
    modes['printCount']=c.js("dispatchEvent(new Event('beforeprint'));document.querySelectorAll('.slide-canvas').length")
    modes['afterPrintCount']=c.js("dispatchEvent(new Event('afterprint'));document.querySelectorAll('.slide-canvas').length")
    modes['slideCount']=c.js("document.querySelector('#mode-toggle').click();document.querySelectorAll('.slide-canvas').length")
    c.js("location.hash='cover'");c.js('new Promise(r=>requestAnimationFrame(r))')
    c.call('Input.dispatchKeyEvent',dict(type='keyDown',key='ArrowRight',code='ArrowRight',windowsVirtualKeyCode=39))
    c.js('new Promise(r=>requestAnimationFrame(r))');modes['keyboardNext']=c.js('location.hash')
    c.js("document.querySelector('#toc-open').click()")
    modes['tocOpened']=c.js("document.querySelector('#toc-dialog').open")
    c.js("document.querySelector('#toc-list a[href=\"#purchase-policy\"]').click()")
    c.js('new Promise(r=>requestAnimationFrame(r))')
    modes['tocDestination']=c.js('location.hash')
    modes['tocClosed']=c.js("!document.querySelector('#toc-dialog').open")
    modes['sizes']=[]
    for width,height in [(1366,900),(390,844)]:
        c.call('Emulation.setDeviceMetricsOverride',dict(width=width,height=height,deviceScaleFactor=1,mobile=width<700))
        c.js('new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))')
        modes['sizes'].append(c.js("(()=>{const r=document.querySelector('.slide-canvas').getBoundingClientRect();return {viewport:innerWidth,width:r.width,height:r.height,ratio:r.width/r.height,pageOverflow:document.documentElement.scrollWidth>innerWidth}})()"))
    assert len(reports)==15 and modes['readingCount']==15 and modes['printCount']==15 and modes['afterPrintCount']==15 and modes['slideCount']==1, modes
    assert modes['keyboardNext']=='#about' and modes['tocOpened'] and modes['tocClosed'] and modes['tocDestination']=='#purchase-policy', modes
    assert all(abs(size['ratio']-16/9)<0.001 and not size['pageOverflow'] for size in modes['sizes']), modes
    result=dict(slides=reports,modes=modes)
    (out/'checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
    print(json.dumps(dict(slides=len(reports),overflow=[(r['id'],r['overflow']) for r in reports if r['overflow']],overlaps=[(r['id'],r['overlaps']) for r in reports if r['overlaps']],modes=modes),ensure_ascii=False))
    urllib.request.urlopen(f'http://127.0.0.1:{args.debug_port}/json/close/'+target['id']).close()
    if any(r['overflow'] or r['overlaps'] for r in reports):raise SystemExit(1)
