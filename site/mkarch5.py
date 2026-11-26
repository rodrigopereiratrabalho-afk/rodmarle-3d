# gera arch_v5.xml (vista Odoo) e cfg/<id>.json (configuracao de cada produto, lida do GitHub pela pagina)
import json,os,xml.dom.minidom
P=json.load(open('products5.json')); os.makedirs('cfg',exist_ok=True)
for p in P: json.dump({k:v for k,v in p.items() if k!='id'},open('cfg/%d.json'%p['id'],'w'),ensure_ascii=False,indent=1)
s=open('arch_tpl5.xml').read().replace('@@IDS@@','('+', '.join(str(p['id']) for p in P)+')')
js=s[s.index('<script>')+8:s.index('</script>',s.index('<script>'))]
assert '&' not in s and '<' not in js; xml.dom.minidom.parseString(s)
open('arch_v5.xml','w').write(s); print(len(s))
