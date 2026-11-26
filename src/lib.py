import io
from PIL import Image, ImageDraw, ImageFont
def addbuf(raw, target=None):
    while len(binb) % 4: binb.append(0)
    bv = {"buffer": 0, "byteOffset": len(binb), "byteLength": len(raw)}
    if target: bv["target"] = target
    j['bufferViews'].append(bv); binb.extend(raw); return len(j['bufferViews'])-1
def addacc(arr, typ, comp=5126, target=34962, mm=False):
    a = {"bufferView": addbuf(arr.tobytes(), target), "componentType": comp, "count": len(arr), "type": typ}
    if mm: a["min"] = arr.min(0).tolist(); a["max"] = arr.max(0).tolist()
    j['accessors'].append(a); return len(j['accessors'])-1
def box(x0, x1, y0, y1, z0, z1):
    P=[];N=[];I=[]
    faces=[((1,0,0),[(x1,y0,z0),(x1,y1,z0),(x1,y1,z1),(x1,y0,z1)]),((-1,0,0),[(x0,y0,z1),(x0,y1,z1),(x0,y1,z0),(x0,y0,z0)]),
           ((0,1,0),[(x0,y1,z0),(x0,y1,z1),(x1,y1,z1),(x1,y1,z0)]),((0,-1,0),[(x0,y0,z1),(x0,y0,z0),(x1,y0,z0),(x1,y0,z1)]),
           ((0,0,1),[(x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]),((0,0,-1),[(x1,y0,z0),(x0,y0,z0),(x0,y1,z0),(x1,y1,z0)])]
    for n,q in faces:
        k=len(P); P+=q; N+=[n]*4; I+=[k,k+1,k+2,k,k+2,k+3]
    return P,N,None,I
def merge(parts):
    P=[];N=[];I=[]
    for p,n,_,i in parts:
        k=len(P); P+=p; N+=n; I+=[x+k for x in i]
    return P,N,None,I
def mesh(name, geo, mat):
    P,N,UV,I = geo
    attr = {"POSITION": addacc(np.array(P,np.float32),"VEC3",mm=True), "NORMAL": addacc(np.array(N,np.float32),"VEC3")}
    if UV is not None: attr["TEXCOORD_0"] = addacc(np.array(UV,np.float32),"VEC2")
    ia = addacc(np.array(I,np.uint32),"SCALAR",5125,34963)
    j['meshes'].append({"name":name,"primitives":[{"attributes":attr,"indices":ia,"material":mat}]}); return len(j['meshes'])-1
def mat(name, rgba, rough=1, blend=False, tex=None, unlit=False):
    m = {"name":name,"pbrMetallicRoughness":{"baseColorFactor":rgba,"metallicFactor":0,"roughnessFactor":rough},"doubleSided":True}
    if blend: m["alphaMode"]="BLEND"
    if tex is not None: m["pbrMetallicRoughness"]["baseColorTexture"]={"index":tex}
    j['materials'].append(m); return len(j['materials'])-1

FONT = ImageFont.truetype('/usr/share/fonts/opentype/inter/Inter-Bold.otf', 60)
def label_tex(text):
    tw = int(FONT.getlength(text)); W = tw + 56; H = 96
    im = Image.new('RGBA', (W, H), (0,0,0,0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((2,2,W-3,H-3), radius=46, fill=(255,255,255,235), outline=(11,48,57,255), width=4)
    d.text((W/2, H/2+2), text, font=FONT, fill=(11,48,57,255), anchor='mm')
    pw = 1
    while pw * 1.5 < W: pw *= 2
    im = im.resize((pw//2, 64), Image.LANCZOS)
    im = im.quantize(colors=6, method=Image.FASTOCTREE, dither=Image.NONE)
    bio = io.BytesIO(); im.save(bio, 'PNG', optimize=True)
    bv = addbuf(bio.getvalue())
    j['images'].append({"bufferView":bv,"mimeType":"image/png"})
    if not j['samplers']: j['samplers'].append({"magFilter":9729,"minFilter":9987,"wrapS":33071,"wrapT":33071})
    j['textures'].append({"sampler":0,"source":len(j['images'])-1})
    return len(j['textures'])-1, W/H
def quad(cx, cy, cz, w, h, normal, up):
    n = np.array(normal,float); u = np.array(up,float); r = np.cross(u, n)
    c = np.array([cx,cy,cz]); hw, hh = w/2, h/2
    P = [c-r*hw-u*hh, c+r*hw-u*hh, c+r*hw+u*hh, c-r*hw+u*hh]
    return [tuple(p) for p in P], [tuple(n)]*4, [(0,1),(1,1),(1,0),(0,0)], [0,1,2,0,2,3]
def label(name, text, cx, cy, cz, h, normal, up):
    t, ar = label_tex(text)
    return mesh(name, quad(cx,cy,cz,h*ar,h,normal,up), mat(name, [1,1,1,1], blend=True, tex=t))

