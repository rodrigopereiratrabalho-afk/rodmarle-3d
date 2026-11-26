# gera site/cfg/<id>.json a partir de products5.json
import json,os
os.makedirs('cfg',exist_ok=True)
for p in json.load(open('products5.json')):
    json.dump({k:v for k,v in p.items() if k!='id'},open('cfg/%d.json'%p['id'],'w'),ensure_ascii=False,indent=1)
print(sorted(p['id'] for p in json.load(open('products5.json'))))
