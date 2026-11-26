# GLB para RA (tamanho real) com grupos Banco (produto), Macicos (fixacao no chao), Cotas, CotasMacicos
import json, struct, sys
import numpy as np
cfg = json.load(open(sys.argv[1])); d = json.load(open(cfg['src'])); OUT = cfg['out']
up, ax_x, ax_z = cfg['up'], cfg['x'], cfg['z']      # eixos do Fusion: [indice, sinal]
G0 = cfg['ground']; C = cfg['center']                 # mm, no eixo de cima / centro em planta (fusion x-axis, z-axis)
def tf(v):
    return np.stack([ax_x[1]*(v[:,ax_x[0]]-C[0])/1000, up[1]*(v[:,up[0]]-G0)/1000, ax_z[1]*(v[:,ax_z[0]]-C[1])/1000], 1)
def tfn(n): return np.stack([ax_x[1]*n[:,ax_x[0]], up[1]*n[:,up[0]], ax_z[1]*n[:,ax_z[0]]], 1)
j = {"asset":{"version":"2.0","generator":"RODMARLE"},"scene":0,"scenes":[{"nodes":[]}],"nodes":[],"meshes":[],"materials":[],
     "accessors":[],"bufferViews":[],"buffers":[{"byteLength":0}],"images":[],"textures":[],"samplers":[]}
binb = bytearray()
exec(open('lib.py').read())
mP = mat("Perfil plastico reciclado", [0.032,0.026,0.021,1], 1.0)
mS = mat("Aco inox", [0.62,0.63,0.64,1], 0.4); j['materials'][-1]['pbrMetallicRoughness']['metallicFactor']=0.85
groups={'p':([],[],[]),'s':([],[],[])}
for o in d:
    v=np.array(o['v'],float).reshape(-1,3); n=np.array(o['n'],float).reshape(-1,3)
    w=tf(v)
    if w[:,1].max() <= 0.0005: continue                 # totalmente enterrado
    w[:,1]=np.maximum(w[:,1],0.0)                       # corta o que fica abaixo do chao (pecas retas)
    g=groups['s' if ('Aço' in o['mat'] or 'inox' in o['mat'].lower() or 'AÇO' in o['occ'] or 'BARRA' in o['occ'] or 'CANTONEIRA' in o['occ']) else 'p']
    k=len(g[0]); g[0].extend(w.tolist()); g[1].extend(tfn(n).tolist()); g[2].extend([x+k for x in o['i']])
for b in cfg.get('extra',[]):   # pecas novas em mm [x0,x1,y0,y1,z0,z1] no referencial final
    p,nn,_,ii=box(*[a/1000 for a in b]); g=groups['p']; k=len(g[0]); g[0].extend(p); g[1].extend(nn); g[2].extend([x+k for x in ii])
prims=[]
for k,m in (('p',mP),('s',mS)):
    P,N,I=groups[k]
    if not P: continue
    mi=mesh("Produto "+k,(P,N,None,I),m); prims.append(mi)
A=np.array(groups['p'][0]); print('bbox', A.min(0).round(4), A.max(0).round(4))
TH=0.008; X0,X1=A[:,0].min(),A[:,0].max(); Z=cfg['D']/2000; H=cfg['H']/1000; X=max(-X0,X1)
mC = mat("Cota linha", [0.043,0.188,0.224,1]); mF = mat("Fixacao", [0.40,0.40,0.38,1])
E2=0.008
def frame(x0,x1,z0,z1):
    return [box(x0-E2,x1+E2,0,0.006,z0-E2,z0), box(x0-E2,x1+E2,0,0.006,z1,z1+E2), box(x0-E2,x0,0,0.006,z0,z1), box(x1,x1+E2,0,0.006,z0,z1)]
fp=cfg['footprints']    # [[x0,x1,z0,z1] em mm, ja no referencial final]
fpm=[[a/1000 for a in f] for f in fp]
holes=mesh("Fixacao geo", merge([box(f[0],f[1],0,0.004,f[2],f[3]) for f in fpm]), mF)
hfr=mesh("Fixacao contorno", merge(sum([frame(*f) for f in fpm],[])), mC)
upv=(0,1,0); fw=(0,0,-1)
# cotas da fixacao: ao longo de X atras, ao longo de Z ao lado
PO,PI,QO,QI=[v/1000 for v in cfg['fix_x']+cfg['fix_z']]   # meias distancias fora/dentro
zc,zo=-Z-0.12,-Z-0.34; xc,xo=X+0.12,X+0.34
ml=merge([
  box(-PO,PO,0.001,0.0058,zc-TH/2,zc+TH/2), box(-PO,PO,0.001,0.0058,zo-TH/2,zo+TH/2),
  box(-PO-TH/2,-PO+TH/2,0.001,0.0058,zo-0.04,-QO), box(PO-TH/2,PO+TH/2,0.001,0.0058,zo-0.04,-QO),
  box(-PI-TH/2,-PI+TH/2,0.001,0.0058,zc-0.04,-QO), box(PI-TH/2,PI+TH/2,0.001,0.0058,zc-0.04,-QO),
  box(xc-TH/2,xc+TH/2,0.001,0.0058,-QO,QO), box(xo-TH/2,xo+TH/2,0.001,0.0058,-QO,QO),
  box(PO,xo+0.04,0.001,0.0058,-QO-TH/2,-QO+TH/2), box(PO,xo+0.04,0.001,0.0058,QO-TH/2,QO+TH/2),
  box(PI,xc+0.04,0.001,0.0058,-QI-TH/2,-QI+TH/2), box(PI,xc+0.04,0.001,0.0058,QI-TH/2,QI+TH/2)])
mcl=mesh("Cotas fix linhas", ml, mC)
L=cfg['labels']; s=cfg.get('ls',1.0)
mtx=[label("F1",L['xin'],0,0.004,zc-0.08*s,0.08*s,upv,fw), label("F2",L['xout'],0,0.004,zo-0.09*s,0.09*s,upv,fw),
     label("F3",L['zin'],xc+0.08*s,0.004,0,0.08*s,upv,(1,0,0)), label("F4",L['zout'],xo+0.09*s,0.004,0,0.09*s,upv,(1,0,0)),
     label("F5",L['note'],0,0.004,0,0.08*s,upv,fw)]
zf=Z+0.14; xs=X0-0.14
cl=mesh("Cotas linhas", merge([
  box(X0,X1,0.001,0.0058,zf-TH/2,zf+TH/2), box(X0-TH/2,X0+TH/2,0.001,0.0058,Z,zf+0.04), box(X1-TH/2,X1+TH/2,0.001,0.0058,Z,zf+0.04),
  box(xs-TH/2,xs+TH/2,0.001,0.0058,-Z,Z), box(xs-0.04,X0,0.001,0.0058,-Z-TH/2,-Z+TH/2), box(xs-0.04,X0,0.001,0.0058,Z-TH/2,Z+TH/2),
  box(xs-TH/2,xs+TH/2,0,H,Z-TH/2,Z+TH/2), box(xs-0.04,X0+0.25,H-TH/2,H+TH/2,Z-TH/2,Z+TH/2)]), mC)
lw=label("CW","%d mm"%cfg['W'],(X0+X1)/2,0.004,zf+0.09*s,0.12*s,upv,fw)
ld=label("CD","%d mm"%cfg['D'],xs-0.2*s,0.004,0,0.10*s,upv,(-1,0,0))
lh=label("CH","%d mm"%cfg['H'],xs,H/2,Z+0.01,0.10*s,(0,0,1),(0,1,0))
Nd=lambda dd:(j['nodes'].append(dd),len(j['nodes'])-1)[1]
g_b=Nd({"name":"Banco","children":[Nd({"name":"Geo%d"%i,"mesh":m}) for i,m in enumerate(prims)]})
hl=[[a/1000 for a in h] for h in cfg.get('holes',[])]
mHole=mat("Furo bucha", [0.05,0.05,0.05,1], 1.0)
ch=[Nd({"name":"FxGeo","mesh":holes}),Nd({"name":"FxFr","mesh":hfr})]
if hl: ch.append(Nd({"name":"FxHoles","mesh":mesh("Furos",merge([box(h[0]-0.015,h[0]+0.015,0.004,0.007,h[1]-0.015,h[1]+0.015) for h in hl]),mHole)}))
g_m=Nd({"name":"Macicos","children":ch})
g_c=Nd({"name":"Cotas","children":[Nd({"name":"CL","mesh":cl}),Nd({"name":"CWn","mesh":lw}),Nd({"name":"CDn","mesh":ld}),Nd({"name":"CHn","mesh":lh})]})
g_cm=Nd({"name":"CotasMacicos","children":[Nd({"name":"FL","mesh":mcl})]+[Nd({"name":"FT%d"%i,"mesh":m}) for i,m in enumerate(mtx)]})
j['scenes'][0]['nodes']=[g_b,g_m,g_c,g_cm]
while len(binb)%4: binb.append(0)
j['buffers'][0]['byteLength']=len(binb)
js=json.dumps(j,separators=(',',':')).encode()
while len(js)%4: js+=b' '
out=b'glTF'+struct.pack('<II',2,12+8+len(js)+8+len(binb))+struct.pack('<I',len(js))+b'JSON'+js+struct.pack('<I',len(binb))+b'BIN\x00'+bytes(binb)
open(OUT,'wb').write(out); print(OUT,len(out))
