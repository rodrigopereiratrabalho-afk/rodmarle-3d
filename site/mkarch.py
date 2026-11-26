import json,sys
P=json.load(open('products.json'))
def q(x): return "'"+x.replace("'","\\'")+"'"
ents=[]
for p in P:
    lines='['+', '.join(q(x) for x in p['lines'])+']'
    ents.append("%d: [%s, %s, %s, %s, %s, %s, %s, %s, %s]"%(p['id'],q(p['parts']),q(p['gz']),q(p['name']),q(p['orbit']),q(p['target']),lines,q(p['fp']),q(p['mode']),q(p.get('holes',''))))
s=open('arch_tpl4.xml').read().replace('@@RMC@@','{'+', '.join(ents)+'}').replace('@@IDS@@','('+', '.join(str(p['id']) for p in P)+')')
assert '&' not in s
open('arch_v4.xml','w').write(s); print(len(s))
