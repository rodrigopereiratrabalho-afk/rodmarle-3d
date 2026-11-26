import json,base64,re,sys
P=json.load(open('products5.json'))
ents=', '.join("%d: '%s'"%(p['id'],base64.b64encode(json.dumps({k:v for k,v in p.items() if k!='id'},ensure_ascii=False).encode()).decode()) for p in P)
s=open('arch_tpl5.xml').read().replace('@@RMC@@','{'+ents+'}').replace('@@IDS@@','('+', '.join(str(p['id']) for p in P)+')')
js=s[s.index('<script>')+8:s.index('</script>',s.index('<script>'))]
assert '&' not in s and '<' not in js, 'bad char'
import xml.dom.minidom; xml.dom.minidom.parseString(s)
open('arch_v5.xml','w').write(s); print(len(s))
