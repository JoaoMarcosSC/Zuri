import re,glob,os
def svg(path, size=None, h=None):
    s=open(path).read()
    if h: s=s.replace('<svg ', f'<svg height="{h}" ',1)
    if size: s=s.replace('<svg ', f'<svg width="{size}" height="{size}" ',1)
    return s
props=[('a-broto-z','A · Z com broto'),('b-folha-z','B · Z de duas folhas'),('c-z-sprout','C · Z que brota')]
cards=''
for k,t in props:
    panels=''
    for theme in ('light','dark'):
        panels+=f'''<div class="panel" data-theme="{theme}">
  <div class="row horiz">{svg(f"proposals/{k}.svg",h=64)}</div>
  <div class="row sizes">
    <figure>{svg(f"proposals/{k}.symbol.svg",size=16)}<figcaption>16px</figcaption></figure>
    <figure>{svg(f"proposals/{k}.symbol.svg",size=32)}<figcaption>32px</figcaption></figure>
    <figure>{svg(f"proposals/{k}.symbol.svg",size=128)}<figcaption>128px</figcaption></figure>
    <figure>{svg(f"proposals/{k}.svg",h=16)}<figcaption>horiz. 16px</figcaption></figure>
    <figure>{svg(f"proposals/{k}.svg",h=32)}<figcaption>horiz. 32px</figcaption></figure>
  </div>
</div>'''
    cards+=f'<section><h2>{t}</h2><div class="pair">{panels}</div></section>'
html=f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Zuri — propostas de logo</title>
<style>
body{{margin:0;padding:32px;font-family:'Nunito Sans',system-ui,sans-serif;background:#eef2f0;color:#15271f}}
h1{{margin:0 0 24px}} h2{{margin:32px 0 12px}}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:16px}}
@media(max-width:900px){{.pair{{grid-template-columns:1fr}}}}
.panel{{border-radius:20px;padding:24px;border:1px solid var(--zur-hairline)}}
.panel[data-theme=light]{{--zur-primary:#35d49b;--zur-primary-active:#23ad7b;--zur-ink:#15271f;--zur-hairline:#dde8e2;background:#f6faf8;color:#15271f}}
.panel[data-theme=dark]{{--zur-primary:#3ee6a8;--zur-primary-active:#2bd398;--zur-ink:#f3f5f4;--zur-hairline:#23382f;background:#151a17;color:#c3cac7}}
.row{{display:flex;align-items:flex-end;gap:28px;flex-wrap:wrap}}
.horiz{{margin-bottom:24px}}
figure{{margin:0;display:flex;flex-direction:column;align-items:flex-start;gap:6px}}
figcaption{{font-size:12px;opacity:.7}}
</style></head><body><h1>Zuri — propostas de logo</h1>{cards}</body></html>'''
open('preview.html','w').write(html)
