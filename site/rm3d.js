/* RODMARLE - visualizador 3D e RA na ficha de produto (modelo do Banco 8A). Config por produto em site/cfg/<id>.json */
(function(){var MARKUP="<div class=\"rm3d-stage\">\n    <span class=\"rm3d-badge\">3D</span>\n    <button type=\"button\" class=\"rm3d-reset\" title=\"Repor vista\" aria-label=\"Repor vista\">↺</button>\n    <model-viewer class=\"rm3d-main\" camera-controls=\"\" touch-action=\"pan-y\" auto-rotate=\"\" auto-rotate-delay=\"3000\" rotation-per-second=\"15deg\" interaction-prompt=\"none\" shadow-intensity=\"0.9\" shadow-softness=\"0.8\" exposure=\"1.05\" environment-image=\"neutral\" min-camera-orbit=\"auto 10deg auto\" max-camera-orbit=\"auto 95deg auto\" field-of-view=\"20deg\">\n      <div class=\"rm3d-tools\"><button type=\"button\" class=\"on\" data-g=\"b\">Produto</button><button type=\"button\" data-g=\"d\">Dimensões</button><button type=\"button\" data-g=\"m\">Fixação</button></div>\n    </model-viewer>\n    <model-viewer class=\"rm3d-arv\" loading=\"eager\" ar=\"\" ar-scale=\"fixed\" ar-placement=\"floor\" ar-modes=\"scene-viewer quick-look webxr\"><span slot=\"ar-button\" style=\"display:none\"></span></model-viewer>\n    <button type=\"button\" class=\"rm3d-ar\" style=\"display:none\">Ver no seu espaço (tamanho real)</button>\n    <div class=\"rm3d-warn\" hidden=\"\"><div class=\"rm3d-warn-box\"><b>Atenção às medidas</b><p>Pode haver um erro de 1 a 2 cm em todas as medidas. Confirme sempre com fita métrica.</p><p class=\"s\">Aponte o telemóvel para o chão, com boa luz, e mexa-o devagar.</p><button type=\"button\" class=\"rm3d-warn-ok\">OK</button></div></div>\n    <div class=\"rm3d-hint\">Arraste para rodar · toque nos números</div>\n  </div>\n  <div class=\"rm3d-notes\"></div>\n  <details class=\"rfp-extra-info rm3d-mont\"><summary>Como se fixa<span class=\"rfp-extra-info-toggle\" aria-hidden=\"true\">+</span></summary><div class=\"rfp-extra-info-content\">\n    <model-viewer class=\"rm3d-mv2\" camera-controls=\"\" touch-action=\"pan-y\" interaction-prompt=\"none\" shadow-intensity=\"0.8\" exposure=\"1.05\" environment-image=\"neutral\" field-of-view=\"22deg\" min-camera-orbit=\"auto 10deg 0.4m\" max-camera-orbit=\"auto 95deg auto\"></model-viewer>\n    <ol class=\"rm3d-steps\"></ol>\n    <button type=\"button\" class=\"rm3d-replay\">↺ Ver de novo</button>\n    <div class=\"rm3d-req\"></div>\n    <p class=\"rm3d-mont-note\">Toque num passo para o ver.</p>\n  </div></details>";

      var holder=document.getElementById('rm3d'); if(!holder){return;}
      var me=document.currentScript, CR=me.src.replace(/site\/rm3d\.js.*$/,'');
      var ver=(CR.match(/rodmarle-3d@([^/]+)\//)||[0,'main'])[1], RR='https://raw.githubusercontent.com/rodrigopereiratrabalho-afk/rodmarle-3d/'+ver+'/';
      var CDN=CR+'glb/', RAW=RR+'glb/', cf='site/cfg/'+holder.getAttribute('data-pid')+'.json';
      var lk=document.createElement('link'); lk.rel='stylesheet'; lk.href=CR+'site/rm3d.css'; document.head.appendChild(lk);
      if(!customElements.get('model-viewer')){var sm=document.createElement('script'); sm.type='module'; sm.src='https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js'; document.head.appendChild(sm);}
      holder.innerHTML=MARKUP;
      function getJ(u){return fetch(u).then(function(r){if(!r.ok){throw new Error(u);}return r.json();});}
      Promise.all([getJ(CR+cf).catch(function(){return getJ(RR+cf);}), customElements.whenDefined('model-viewer')]).then(function(x){init(x[0]);});
      function init(C){
      var stage=holder.querySelector('.rm3d-stage'), mv=stage.querySelector('model-viewer.rm3d-main'), mvAR=stage.querySelector('model-viewer.rm3d-arv');
      var notes=holder.querySelector('.rm3d-notes'), mont=holder.querySelector('.rm3d-mont'), mv2=mont.querySelector('model-viewer'), stepsBox=mont.querySelector('.rm3d-steps'), reqBox=mont.querySelector('.rm3d-req');
      function el(tag,cls,txt){var e=document.createElement(tag);if(cls){e.className=cls;}if(txt){e.textContent=txt;}return e;}
      function setSrc(v,file){var tried=false;v.addEventListener('error',function(){if(!tried){tried=true;v.setAttribute('src',RAW+file);}});v.setAttribute('src',CDN+file);}
      mv.setAttribute('alt','Modelo 3D '+C.name+' RODMARLE'); mv.setAttribute('camera-orbit',C.orbit); mv.setAttribute('camera-target',C.target);
      mv2.setAttribute('alt','Fixação '+C.name); mv2.setAttribute('camera-orbit',C.orbit); mv2.setAttribute('camera-target',C.target);
      mvAR.setAttribute('alt','Modelo 3D '+C.name+' RODMARLE');
      C.hs.forEach(function(h,i){var k=String(i+1);
        var b=el('button','hs'); b.type='button'; b.slot='hotspot-'+k; b.setAttribute('data-i',k); b.setAttribute('data-position',h.p); b.setAttribute('data-normal',h.n||'0 1 0'); b.setAttribute('data-orbit',h.o);
        b.appendChild(el('span','d',k)); mv.appendChild(b);
        var r=el('div','r'); r.setAttribute('data-i',k); r.appendChild(el('span','n',k)); var w=el('div'); w.appendChild(el('b','',h.t)); w.appendChild(el('span','t',h.d)); r.appendChild(w); notes.appendChild(r);
      });
      var T=[0.2,2,4,6], TEND=8.5;
      C.steps.forEach(function(s,i){var li=el('li'); li.setAttribute('data-t',String(T[i])); li.appendChild(el('b','',String(i+1))); li.appendChild(document.createTextNode(s)); stepsBox.appendChild(li);});
      reqBox.appendChild(el('b','',C.req[0])); C.req.slice(1).forEach(function(s){reqBox.appendChild(el('span','',s));});
      var hs=stage.querySelectorAll('.hs'), rows=notes.querySelectorAll('.r'), steps=stepsBox.querySelectorAll('li');
      var tries=0;
      (function place(){
        var main=document.querySelector('.rfp-ref-main');
        if(main){if(stage.parentNode!==main){main.classList.add('rm3d-on');main.appendChild(stage);}
          if(notes.previousElementSibling!==main){main.insertAdjacentElement('afterend',notes);}}
        var firstInfo=document.querySelector('.rfp-ref-shell .rfp-extra-info:not(.rm3d-mont)'), tech=document.querySelector('.rfp-ref-shell .rfp-tech-access');
        if(mont.parentNode===holder){if(firstInfo){firstInfo.parentNode.insertBefore(mont,firstInfo);}else{if(tech){tech.insertAdjacentElement('afterend',mont);}}}
        tries+=1; if(tries!==120){setTimeout(place,250);}
      })();
      function scn(v){var s=Object.getOwnPropertySymbols(v).find(function(x){return x.description==='scene';});return s ? v[s] : null;}
      function vis(sc,name,on){var o=sc ? sc.getObjectByName(name) : null; if(o){o.visible=!!on;}}
      function buildBuried(sc){
        if(sc.getObjectByName('Enterrado')){return;}
        var ban=sc.getObjectByName('Banco'), mac=sc.getObjectByName('Macicos'); if(!ban){return;} if(!mac){return;}
        var src=null; ban.traverse(function(o){if(!src){if(o.isMesh){src=o;}}}); if(!src){return;}
        var GeoC=src.geometry.constructor, AttC=src.geometry.attributes.position.constructor, MeshC=src.constructor;
        function boxes(list){
          var P=[],N=[],I=[];
          list.forEach(function(b){
            var x0=b[0],x1=b[1],y0=b[2],y1=b[3],z0=b[4],z1=b[5];
            [[[x1,y0,z0],[x1,y1,z0],[x1,y1,z1],[x1,y0,z1],[1,0,0]],[[x0,y0,z1],[x0,y1,z1],[x0,y1,z0],[x0,y0,z0],[-1,0,0]],
             [[x0,y1,z0],[x0,y1,z1],[x1,y1,z1],[x1,y1,z0],[0,1,0]],[[x0,y0,z1],[x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[0,-1,0]],
             [[x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1]],[[x1,y0,z0],[x0,y0,z0],[x0,y1,z0],[x1,y1,z0],[0,0,-1]]].forEach(function(f){
              var n=P.length/3; [0,1,2,3].forEach(function(i){P.push(f[i][0],f[i][1],f[i][2]);N.push(f[4][0],f[4][1],f[4][2]);});
              I.push(n,n+1,n+2,n,n+2,n+3);});
          });
          var g=new GeoC(); g.setAttribute('position',new AttC(new Float32Array(P),3)); g.setAttribute('normal',new AttC(new Float32Array(N),3)); g.setIndex(I); g.computeBoundingBox(); g.computeBoundingSphere(); return g;
        }
        var DEP=0.4, CV=0.15, R=0.006, prf=[], cov=[];
        if(C.mode==='b'){
          C.fp.forEach(function(f){cov.push([f[0],f[1],-0.3,-0.002,f[2],f[3]]);});
          (C.holes||[]).forEach(function(h){prf.push([h[0]-R,h[0]+R,-0.09,0.012,h[1]-R,h[1]+R]);});
        }else{
          C.fp.forEach(function(f){var cx=(f[0]+f[1])/2, cz=(f[2]+f[3])/2;
            prf.push([f[0],f[1],0.01-DEP,0,f[2],f[3]]); cov.push([cx-CV,cx+CV,-DEP,-0.002,cz-CV,cz+CV]);});
        }
        var mP=src.material.clone(), mB=src.material.clone();
        if(mB.color){mB.color.setRGB(0.55,0.56,0.55);} mB.transparent=true; mB.opacity=0.6; mB.depthWrite=false; if(mB.map){mB.map=null;} mB.needsUpdate=true;
        var grp=new (mac.constructor)(); grp.name='Enterrado';
        var a=new MeshC(boxes(prf),mP); a.name='EnPerfil'; var c=new MeshC(boxes(cov),mB); c.name='EnBetao'; c.renderOrder=2;
        grp.add(a); grp.add(c); grp.visible=false; mac.parent.add(grp);
      }
      function prep(v){var sc=scn(v); if(sc){try{buildBuried(sc);}catch(e){} vis(sc,'Enterrado',false); if(sc.updateBoundingBox){sc.updateBoundingBox();}} return sc;}
      /* vista principal */
      setSrc(mv,C.file+'.glb');
      /* se a galeria do Odoo mexer no DOM a meio do carregamento, o model-viewer fica parado: volta a pedir */
      var kicks=0, kt=setInterval(function(){
        [mv,mvAR].forEach(function(v){if(!v.loaded){var s=v.getAttribute('src'); if(s){v.removeAttribute('src'); setTimeout(function(){v.setAttribute('src',s);},30);}}});
        kicks+=1; if(kicks===6){clearInterval(kt);} if(mv.loaded){if(mvAR.loaded){clearInterval(kt);}}
      },4000);
      var home={orbit:C.orbit,target:C.target};
      function pick(i){
        hs.forEach(function(e){e.classList.toggle('on',e.getAttribute('data-i')===i);});
        rows.forEach(function(e){e.classList.toggle('on',e.getAttribute('data-i')===i);});
        var h=stage.querySelector('.hs[data-i="'+i+'"]'); mv.autoRotate=false;
        mv.cameraTarget=h.getAttribute('data-position').split(' ').map(function(v){return v+'m';}).join(' ');
        mv.cameraOrbit=h.getAttribute('data-orbit');
      }
      hs.forEach(function(e){e.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();pick(e.getAttribute('data-i'));});});
      rows.forEach(function(e){e.addEventListener('click',function(){pick(e.getAttribute('data-i'));});});
      stage.addEventListener('click',function(ev){ev.stopPropagation();});
      stage.querySelector('.rm3d-reset').addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();
        hs.forEach(function(e){e.classList.remove('on');});rows.forEach(function(e){e.classList.remove('on');});
        mv.cameraTarget=home.target;mv.cameraOrbit=home.orbit;mv.autoRotate=true;});
      var tools=stage.querySelectorAll('.rm3d-tools button');
      function isOn(k){return stage.querySelector('.rm3d-tools button[data-g="'+k+'"]').classList.contains('on');}
      function applyTools(){var sc=scn(mv); if(!sc){return;} var b=isOn('b'), d=isOn('d'), m=isOn('m');
        vis(sc,'Banco',b); vis(sc,'Cotas',d ? b : false); vis(sc,'Macicos',m); vis(sc,'CotasMacicos',d ? m : false); vis(sc,'Enterrado',m);
        if(sc.updateShadow){sc.updateShadow();} sc.queueRender(); mv.classList.toggle('rm3d-nob',!b);}
      mv.addEventListener('load',function(){prep(mv);applyTools();});
      tools.forEach(function(b){b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();b.classList.toggle('on');applyTools();});});
      /* realidade aumentada: so o produto, tamanho real */
      setSrc(mvAR,C.file+'-ar.glb');
      var arBtn=stage.querySelector('.rm3d-ar'), warn=stage.querySelector('.rm3d-warn');
      function arCheck(){if(mvAR.canActivateAR){arBtn.style.display='';}}
      mvAR.addEventListener('load',arCheck); setTimeout(arCheck,2500);
      arBtn.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();warn.hidden=false;});
      warn.querySelector('.rm3d-warn-ok').addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();warn.hidden=true;mvAR.activateAR();});
      /* como se fixa: animacao por passos */
      var loaded2=false, ready2=false, t0=0, tStart=0, playing=false, camStep=-2;
      var lift=Math.max(0.6,parseFloat(C.target.split(' ')[1])*1.6);
      var cams=[[C.target,C.orbit],[C.target,C.orbit],[C.target,C.orbit],[C.target,C.orbit]];
      var ob=C.orbit.split(' '), dist=parseFloat(ob[2]);
      if(C.mode==='b'){cams[1]=C.zoom;cams[3]=C.zoom;}else{cams[0]=['0m 0m 0m',ob[0]+' 50deg '+(dist*0.7).toFixed(2)+'m'];cams[2]=['0m -0.1m 0m',ob[0]+' 84deg '+(dist*0.85).toFixed(2)+'m'];}
      function ease(x){var y=x;if(y !== Math.max(0,y)){y=0;}if(y !== Math.min(1,y)){y=1;}return y*y*(3-2*y);}
      function render2(t){
        var sc=scn(mv2); if(!sc){return;}
        var k=0; steps.forEach(function(e,i){if(t+0.01 >= T[i]){k=i;}});
        steps.forEach(function(e,i){e.classList.toggle('on',i===k);});
        var ban=sc.getObjectByName('Banco'), enP=sc.getObjectByName('EnPerfil'), enB=sc.getObjectByName('EnBetao'), off=0;
        vis(sc,'Cotas',false); vis(sc,'Macicos',true); vis(sc,'Enterrado',true);
        if(C.mode==='b'){
          vis(sc,'CotasMacicos',k===0); if(enB){enB.visible=true;} if(enP){enP.visible=k !== 0;}
          if(ban){ban.visible=k >= 2; off=lift*(1-ease((t-T[2])/1.5)); ban.position.y=off;}
        }else{
          vis(sc,'CotasMacicos',k !== 3); if(enB){enB.visible=k >= 2;}
          off=lift*(1-ease((t-T[1])/1.5));
          if(ban){ban.visible=k >= 1; ban.position.y=off;} if(enP){enP.visible=k >= 1; enP.position.y=off;}
        }
        if(k!==camStep){camStep=k; mv2.cameraTarget=cams[k][0]; mv2.cameraOrbit=cams[k][1];}
        if(sc.updateShadow){sc.updateShadow();} sc.queueRender();
      }
      function tick(){if(!playing){return;} var t=t0+(performance.now()-tStart)/1000; if(t >= TEND){t=TEND;playing=false;} render2(t); if(playing){requestAnimationFrame(tick);}}
      function playFrom(t){
        if(!loaded2){loaded2=true; mv2.addEventListener('load',function(){prep(mv2);ready2=true;playFrom(t);},{once:true}); setSrc(mv2,C.file+'.glb'); return;}
        if(!ready2){return;}
        t0=t; tStart=performance.now(); camStep=-2; if(!playing){playing=true;requestAnimationFrame(tick);}
      }
      mont.addEventListener('toggle',function(){if(mont.open){playFrom(0);}});
      if(location.hash==='#como-se-fixa'){setTimeout(function(){mont.open=true;mont.scrollIntoView({block:'center'});},1500);}
      steps.forEach(function(e,i){e.addEventListener('click',function(){playFrom(T[i]);});});
      mont.querySelector('.rm3d-replay').addEventListener('click',function(){playFrom(0);});
      document.addEventListener('click',function(ev){
        var opt=ev.target.closest ? ev.target.closest('.rfp-dynamic-option') : null; if(!opt){return;}
        var grp=opt.closest('.rfp-dynamic-variant-group'); var lab=grp ? grp.querySelector('.rfp-config-label') : null;
        if(lab){if(/fixa/i.test(lab.textContent)){if(!mont.open){mont.open=true;}else{playFrom(0);}mont.scrollIntoView({behavior:'smooth',block:'center'});}}
      });
      }
    })();
