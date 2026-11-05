import {detectFilm} from './recorte.js';
import {$,esc,icon,toast,download,toBlob,loadImage,imageFromBlob,put,get,del,openDialog,waitFrame} from './core.js';
export const state={base:null,original:null,name:'',annotations:[],filters:{brightness:0,contrast:0,sharpness:0,detail:0,gray:false,invert:false},calibration:null,tool:null,scale:1,tx:0,ty:0};
const canvas=$('imageCanvas'),view=$('viewport'),svg=$('annotationSvg'),transform=$('imageTransform');
const history=[];let draft=[],gesture=null,pendingText=null,pendingCalibration=null,saveTimer,filterTimer,filterVersion=0,appliedVersion=0,renderPromise=Promise.resolve(),worker=null;
const toolNames={move:'Navegar',arrow:'Seta',line:'Linha',curve:'Curva',polygon:'Polígono',measure:'Medir',calibrate:'Calibrar',text:'Texto',erase:'Apagar'};
export const hasImage=()=>!!state.base;
const copy=o=>structuredClone(o);
function snapshot(){const entry={base:state.base,annotations:copy(state.annotations),filters:{...state.filters},calibration:state.calibration};history.push(entry);if(history.length>15)history.shift();let bases=new Set(),pixels=0;for(let i=history.length-1;i>=0;i--){const b=history[i].base;if(!bases.has(b)){bases.add(b);pixels+=b.width*b.height;}if(pixels>18000000){history.splice(0,i+1);break;}}return entry;}
function changed(){scheduleSave();document.dispatchEvent(new Event('imagechange'));}
function scheduleSave(){clearTimeout(saveTimer);saveTimer=setTimeout(save,650);}
async function save(){if(!state.base)return;try{await put('image',{base:await toBlob(state.base),original:state.original,name:state.name,annotations:state.annotations,filters:state.filters,calibration:state.calibration});}catch{toast('Sem espaço para salvar a imagem localmente. Exporte antes de sair.');}}
function makeCanvas(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.round(w));c.height=Math.max(1,Math.round(h));return c;}
function updateSize(){if(!state.base)return;transform.style.width=state.base.width+'px';transform.style.height=state.base.height+'px';svg.setAttribute('viewBox',`0 0 ${state.base.width} ${state.base.height}`);$('imageName').textContent=state.name;$('imageSize').textContent=`${state.base.width} × ${state.base.height} px · ${state.calibration?'escala calibrada':'medidas em pixels'}`;}
export function fit(){if(!state.base||view.clientWidth===0)return;state.scale=Math.min((view.clientWidth-28)/state.base.width,(view.clientHeight-28)/state.base.height);state.tx=(view.clientWidth-state.base.width*state.scale)/2;state.ty=(view.clientHeight-state.base.height*state.scale)/2;applyTransform();}
function applyTransform(){transform.style.transform=`translate(${state.tx}px,${state.ty}px) scale(${state.scale})`;$('zoomBadge').textContent=Math.round(state.scale*100)+'%';drawAnnotations();}
function clamp(n,a,b){return Math.min(b,Math.max(a,n));}
function loc(e){const r=view.getBoundingClientRect();return {x:e.clientX-r.left,y:e.clientY-r.top};}
function imagePoint(p){return {x:clamp((p.x-state.tx)/state.scale,0,state.base.width),y:clamp((p.y-state.ty)/state.scale,0,state.base.height)};}
function syncFilterControls(){['brightness','contrast','sharpness','detail'].forEach(k=>{$(k).value=state.filters[k];$(k+'Value').textContent=state.filters[k];});document.querySelector('[data-action="gray"]').classList.toggle('active',state.filters.gray);document.querySelector('[data-action="invert"]').classList.toggle('active',state.filters.invert);}
let workerCallbacks=new Map();
function getWorker(){if(!worker){worker=new Worker('image-worker.js',{type:'module'});worker.onmessage=e=>{const p=workerCallbacks.get(e.data.id);if(p){workerCallbacks.delete(e.data.id);e.data.error?p.reject(Error(e.data.error)):p.resolve(e.data.buffer);}};worker.onerror=()=>{for(const p of workerCallbacks.values())p.reject(Error('Processamento indisponível. Recarregue o aplicativo.'));workerCallbacks.clear();worker?.terminate();worker=null;};}return worker;}
async function renderPixels(){if(!state.base)return;const id=++filterVersion,b=state.base,f={...state.filters};canvas.width=b.width;canvas.height=b.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});const input=b.getContext('2d',{willReadFrequently:true}).getImageData(0,0,b.width,b.height);renderPromise=(async()=>{const buffer=await new Promise((resolve,reject)=>{workerCallbacks.set(id,{resolve,reject});getWorker().postMessage({id,buffer:input.data.buffer,w:b.width,h:b.height,filters:f},[input.data.buffer]);});if(id!==filterVersion)return;ctx.putImageData(new ImageData(new Uint8ClampedArray(buffer),b.width,b.height),0,0);appliedVersion=id;})();try{await renderPromise;}catch(e){toast(e.message);} }
export async function flushImage(){clearTimeout(filterTimer);if(state.base&&(appliedVersion!==filterVersion||!filterVersion))await renderPromise;}
function updateFilters(){clearTimeout(filterTimer);filterTimer=setTimeout(async()=>{await renderPixels();changed();},70);}
export async function loadFile(file,fromCamera=false){if(!file)return;if(file.size>60*1024*1024){toast('Selecione uma imagem de até 60 MB.');return;}if(state.base&&!confirm('Abrir outra radiografia substituirá a imagem e as anotações atuais. Continuar?'))return;cancelInteraction();releasePointers();try{toast('Abrindo radiografia…');const im=await imageFromBlob(file),ratio=Math.min(1,2400/Math.max(im.width,im.height));const b=makeCanvas(im.width*ratio,im.height*ratio);b.getContext('2d').drawImage(im,0,0,b.width,b.height);state.base=b;state.original=file;state.name=file.name||'Radiografia digitalizada';state.annotations=[];state.calibration=null;state.filters={brightness:0,contrast:0,sharpness:0,detail:0,gray:false,invert:false};history.length=0;draft=[];selectedAnnotation=-1;setTool(null);$('imageOrigin').value=fromCamera?'Digitalizada':'Digital';$('editorEmpty').hidden=true;$('editor').hidden=false;syncFilterControls();updateSize();fit();drawAnnotations();await renderPixels();changed();toast(ratio<1?'Imagem aberta. Cópia de trabalho limitada a 2.400 px; original preservado.':'Radiografia aberta.');if(fromCamera)openCrop(true);}catch(e){toast(e.message);}}
export async function restoreImage(){try{const saved=await get('image');if(!saved)return;const im=await imageFromBlob(saved.base),b=makeCanvas(im.width,im.height);b.getContext('2d').drawImage(im,0,0);Object.assign(state,{...saved,base:b});$('editorEmpty').hidden=true;$('editor').hidden=false;syncFilterControls();updateSize();drawAnnotations();await renderPixels();fit();document.dispatchEvent(new Event('imagechange'));}catch{toast('Não foi possível restaurar a imagem salva.');}}
export async function clearImage(){cancelInteraction();releasePointers();clearTimeout(saveTimer);await del('image');state.base=null;state.original=null;state.annotations=[];state.calibration=null;history.length=0;draft=[];selectedAnnotation=-1;setTool(null);canvas.width=0;svg.innerHTML='';$('editor').hidden=true;$('editorEmpty').hidden=false;document.dispatchEvent(new Event('imagechange'));}
function setTool(tool){
  cancelInteraction();releasePointers();draft=[];state.tool=tool||null;
  $('toolBadge').textContent=tool?toolNames[tool]||tool:'Selecionar';
  $('gestureHint').textContent=!tool||tool==='move'?'Toque para selecionar · arraste a anotação · segure para editar · dois dedos para zoom':tool==='polygon'||tool==='curve'?'Toque nos pontos e conclua · arraste objetos existentes · toque novamente na ferramenta para desativar':tool==='erase'?'Toque para apagar · segure para editar · dois dedos para navegar':tool==='text'?'Toque no fundo para inserir · arraste textos existentes · segure para editar':'Arraste no fundo para traçar · objetos existentes podem ser movidos · dois dedos para zoom';
  document.querySelectorAll('[data-tool]').forEach(b=>{const active=b.dataset.tool===tool;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('finishShape').hidden=true;drawAnnotations();
}
function smooth(points){if(points.length<2)return '';let p=`M${points[0].x},${points[0].y}`;for(let i=1;i<points.length-1;i++){const a=points[i],b=points[i+1];p+=` Q${a.x},${a.y} ${(a.x+b.x)/2},${(a.y+b.y)/2}`;}const last=points.at(-1);return p+` T${last.x},${last.y}`;}
function annotationMarkup(a,index,preview=false,interactive=false){const col=a.color||'#ffcb32',w=a.width||3,p=a.points||[],end=p.at(-1),start=p[0];if(!start)return '';const common=`stroke="${col}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"`;let mark='';if(a.type==='arrow'&&end){const ang=Math.atan2(end.y-start.y,end.x-start.x),sz=Math.max(12,w*4);mark=`<path d="M${start.x},${start.y} L${end.x},${end.y} M${end.x-sz*Math.cos(ang-.5)},${end.y-sz*Math.sin(ang-.5)} L${end.x},${end.y} L${end.x-sz*Math.cos(ang+.5)},${end.y-sz*Math.sin(ang+.5)}" ${common}/>`;}else if(['line','measure','calibrate'].includes(a.type)&&end){mark=`<path d="M${start.x},${start.y} L${end.x},${end.y}" ${common}/>`;if(a.type==='measure'||a.type==='calibrate'){const d=Math.hypot(end.x-start.x,end.y-start.y),text=a.type==='calibrate'?'Referência':state.calibration?(d*state.calibration).toFixed(2)+' mm':d.toFixed(0)+' px';const size=Math.max(16,state.base.width/30),x=(start.x+end.x)/2,y=(start.y+end.y)/2-size*.5;mark+=`<text x="${x}" y="${y}" fill="${col}" stroke="#071525" stroke-width="${size/6}" paint-order="stroke" font-family="Arial,sans-serif" font-size="${size}" font-weight="bold">${text}</text>`;}}else if(a.type==='polygon'){mark=`<path d="M${p.map(z=>z.x+','+z.y).join(' L')}${preview?'':' Z'}" ${common} ${preview?'':`fill-opacity=".1" style="fill:${col}"`}/>`;}else if(a.type==='curve'){mark=`<path d="${smooth(p)}" ${common}/>`;}else if(a.type==='text'){mark=`<text x="${start.x}" y="${start.y}" fill="${col}" stroke="#071525" stroke-width="${Math.max(1,(a.fontSize||24)/10)}" paint-order="stroke" font-size="${a.fontSize||24}" font-family="Arial,sans-serif" font-weight="bold">${String(a.text||'').split(/\r?\n/).map((line,i)=>`<tspan x="${start.x}" dy="${i?'1.25em':'0'}">${esc(line)||' '}</tspan>`).join('')}</text>`;}return interactive?`<g data-annotation="${index}" role="button" tabindex="0" aria-label="${esc(annotationLabel(a)+(a.type==='text'?': '+a.text:''))}" aria-pressed="${index===selectedAnnotation}"><g class="annotation-visual">${mark}</g></g>`:`<g>${mark}</g>`;}
function styleAnnotation(type,points){return {type,points:copy(points),color:$('annotationColor').value,width:Number($('strokeWidth').value)*Math.max(1,state.base.width/700)};}
// Annotation interaction layer. UI-only hit areas and selection never enter exports.
const SVG_NS='http://www.w3.org/2000/svg';
const pointers=new Map();
const DRAG_THRESHOLD=6,LONG_PRESS_MS=550;
let suppressSingle=false,selectedAnnotation=-1,longPressTimer=null,selectionBar=null,annotationEditor=null,editingAnnotation=-1,editingControls=null;
function clearLongPress(){clearTimeout(longPressTimer);longPressTimer=null;}
function rollbackDrag(g=gesture){
  if(g?.type!=='annotation'||!g.moved)return;
  state.annotations[g.index]=copy(g.original);
  const h=history.indexOf(g.undoEntry);if(h>=0)history.splice(h,1);scheduleSave();
}
function cancelInteraction(){clearLongPress();rollbackDrag();gesture=null;}
function releasePointers(){
  const ids=[...pointers.keys()];pointers.clear();gesture=null;suppressSingle=false;
  for(const id of ids)try{if(view.hasPointerCapture(id))view.releasePointerCapture(id);}catch{}
}
function selectedObject(){return state.annotations[selectedAnnotation]||null;}
function annotationLabel(a){return ({text:'Texto',measure:'Medida',calibrate:'Referência'})[a.type]||toolNames[a.type]||'Anotação';}
function selectAnnotation(index){
  selectedAnnotation=Number.isInteger(index)&&state.annotations[index]?index:-1;
  drawAnnotations();
}
function objectBounds(index){
  const visual=svg.querySelector(`[data-annotation="${index}"] .annotation-visual`);
  if(visual)try{const b=visual.getBBox();if(Number.isFinite(b.x+b.y+b.width+b.height))return {x:b.x,y:b.y,width:b.width,height:b.height};}catch{}
  const pts=state.annotations[index]?.points||[];if(!pts.length)return null;
  const xs=pts.map(p=>p.x),ys=pts.map(p=>p.y);
  return {x:Math.min(...xs),y:Math.min(...ys),width:Math.max(...xs)-Math.min(...xs),height:Math.max(...ys)-Math.min(...ys)};
}
function addHitAreas(group){
  const visual=group.querySelector('.annotation-visual');if(!visual)return;
  const hit=document.createElementNS(SVG_NS,'g'),pad=6/Math.max(.03,state.scale);
  hit.setAttribute('class','annotation-hit');hit.setAttribute('aria-hidden','true');
  for(const path of visual.querySelectorAll('path')){
    const target=path.cloneNode(false);target.removeAttribute('style');
    const polygon=state.annotations[Number(group.dataset.annotation)]?.type==='polygon';
    target.setAttribute('fill',polygon?'transparent':'none');target.setAttribute('fill-opacity','1');
    target.setAttribute('stroke','transparent');target.setAttribute('stroke-width',Math.max(Number(path.getAttribute('stroke-width'))||3,22/Math.max(.03,state.scale)));
    target.setAttribute('pointer-events',polygon?'all':'stroke');hit.append(target);
  }
  for(const text of visual.querySelectorAll('text'))try{
    const b=text.getBBox(),w=Math.max(b.width+pad*2,24/Math.max(.03,state.scale)),h=Math.max(b.height+pad*2,28/Math.max(.03,state.scale));
    const rect=document.createElementNS(SVG_NS,'rect');
    Object.entries({x:b.x-(w-b.width)/2,y:b.y-(h-b.height)/2,width:w,height:h,fill:'transparent','pointer-events':'all'}).forEach(([k,v])=>rect.setAttribute(k,String(v)));hit.append(rect);
  }catch{}
  group.append(hit);
}
function updateSelectionUI(){
  const a=selectedObject();if(!a)selectedAnnotation=-1;
  if(selectionBar){selectionBar.hidden=!a;selectionBar.querySelector('span').textContent=a?'Selecionado: '+annotationLabel(a):'';}
  if(a){
    const b=objectBounds(selectedAnnotation);if(b){if(selectionBar){const bottom=state.ty+(b.y+b.height/2)*state.scale<view.clientHeight/2;selectionBar.style.top=bottom?'auto':'9px';selectionBar.style.bottom=bottom?'40px':'auto';}const pad=5/Math.max(.03,state.scale),rect=document.createElementNS(SVG_NS,'rect');
      Object.entries({x:b.x-pad,y:b.y-pad,width:Math.max(b.width,1)+pad*2,height:Math.max(b.height,1)+pad*2,rx:pad/2,fill:'none',stroke:'#ffcb32','stroke-width':1.5,'stroke-dasharray':'5 4','vector-effect':'non-scaling-stroke','pointer-events':'none','data-selection-outline':'true'}).forEach(([k,v])=>rect.setAttribute(k,String(v)));svg.append(rect);
    }
  }
  view.classList.toggle('annotation-dragging',gesture?.type==='annotation'&&!!gesture.moved);
}
function drawAnnotations(preview=null){
  svg.innerHTML=state.annotations.map((a,i)=>annotationMarkup(a,i,false,true)).join('');
  svg.querySelectorAll('[data-annotation]').forEach(addHitAreas);
  if(draft.length){
    svg.insertAdjacentHTML('beforeend',annotationMarkup(styleAnnotation(state.tool,draft),-1,true));
    const r=Math.max(4,state.base.width/140);svg.insertAdjacentHTML('beforeend',draft.map(p=>`<circle cx="${p.x}" cy="${p.y}" r="${r}" fill="#ffcb32" pointer-events="none"/>`).join(''));
  }
  if(preview)svg.insertAdjacentHTML('beforeend',annotationMarkup(preview,-1,true));
  updateSelectionUI();
}
function commit(a){snapshot();state.annotations.push(a);selectedAnnotation=state.annotations.length-1;draft=[];$('finishShape').hidden=true;drawAnnotations();changed();}
function targetAnnotation(e){const target=e.target.closest?.('[data-annotation]');if(!target||!svg.contains(target))return -1;const i=Number(target.dataset.annotation);return i>=0&&state.annotations[i]?i:-1;}
function capturePointer(id){try{view.setPointerCapture(id);}catch{}}
function openAnnotationEditor(index=selectedAnnotation){
  const a=state.annotations[index];if(!a||!annotationEditor)return;
  clearLongPress();releasePointers();selectedAnnotation=index;editingAnnotation=index;drawAnnotations();
  $('annotationEditTitle').textContent=a.type==='text'?'Editar texto':'Editar '+annotationLabel(a).toLowerCase();
  $('annotationEditTextField').hidden=a.type!=='text';$('annotationEditSizeField').hidden=a.type!=='text';$('annotationEditWidthField').hidden=a.type==='text';
  $('annotationEditText').value=a.text||'';$('annotationEditColor').value=/^#[\da-f]{6}$/i.test(a.color||'')?a.color:'#ffcb32';
  const unit=Math.max(1,state.base.width/700);
  $('annotationEditSize').value=clamp((a.fontSize||24)/unit,8,160);$('annotationEditSizeValue').textContent=Math.round(Number($('annotationEditSize').value));
  $('annotationEditWidth').value=clamp((a.width||3)/unit,1,7);$('annotationEditWidthValue').textContent=Number($('annotationEditWidth').value).toFixed(1);editingControls={size:$('annotationEditSize').value,width:$('annotationEditWidth').value};
  openDialog('annotationEditDialog');
}
function deleteAnnotation(index){
  if(!state.annotations[index])return;snapshot();state.annotations.splice(index,1);selectedAnnotation=-1;draft=[];$('finishShape').hidden=true;drawAnnotations();changed();
}
function initAnnotationUI(){
  if(selectionBar)return;
  const style=document.createElement('style');style.textContent=`
    #viewport,#annotationSvg,#annotationSvg *{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
    #annotationSvg [data-annotation]{cursor:grab;outline:none}
    #viewport.annotation-dragging,#viewport.annotation-dragging *{cursor:grabbing!important}
    #annotationSvg [data-annotation]:focus-visible .annotation-visual{filter:drop-shadow(0 0 3px #fff)}
    #annotationSelection{position:absolute;z-index:4;left:9px;top:9px;max-width:calc(100% - 18px);display:flex;align-items:center;gap:7px;flex-wrap:wrap;padding:7px 9px;border:1px solid #ffffff24;border-radius:10px;background:#102644ed;color:#fff;box-shadow:0 3px 12px #0002;font-size:10px}
    #annotationSelection span{max-width:145px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    #annotationSelection button{min-height:32px;padding:7px 10px;border-radius:7px;background:#ffcb32;color:#102644;font-size:10px;font-weight:750}
    #annotationSelection button:last-child{background:#ffffff12;color:#dce7f7;padding-inline:9px}
    #annotationEditDialog .annotation-edit-tools{display:flex;align-items:center;gap:18px;margin-top:18px}
    #annotationEditDialog input[type=color]{display:block;width:64px;height:42px;margin-top:9px;padding:3px;border:1px solid #dfe6f0;border-radius:9px;background:#fff}
    #annotationEditDialog input[type=range]{width:100%;margin-top:12px}
    #annotationEditDialog output{float:right;color:#8c9bb1}
    #annotationEditDialog .annotation-delete{min-height:44px;padding:10px 14px;border-radius:9px;background:#fff0f1;color:#b64b55;font-size:12px;font-weight:650}
    #annotationEditDialog .annotation-edit-actions{display:flex;justify-content:space-between;gap:10px;margin-top:23px}
  `;document.head.append(style);
  selectionBar=document.createElement('div');selectionBar.id='annotationSelection';selectionBar.hidden=true;selectionBar.dataset.annotationUi='true';selectionBar.setAttribute('role','group');selectionBar.setAttribute('aria-label','Anotação selecionada');
  selectionBar.innerHTML='<span></span><button type="button" id="editSelectedAnnotation">Editar</button><button type="button" id="clearAnnotationSelection" aria-label="Desmarcar anotação">✕</button>';view.append(selectionBar);
  $('editSelectedAnnotation').onclick=()=>openAnnotationEditor();$('clearAnnotationSelection').onclick=()=>selectAnnotation(-1);
  annotationEditor=document.createElement('dialog');annotationEditor.id='annotationEditDialog';
  annotationEditor.innerHTML=`<div class="dialog-head"><div><small>ANOTAÇÃO SELECIONADA</small><h2 id="annotationEditTitle">Editar anotação</h2></div><button type="button" class="icon-btn" id="closeAnnotationEdit" aria-label="Fechar edição">${icon('close')}</button></div><p>Arraste o objeto na imagem para reposicionar. Aqui você pode editar ou apagar.</p><label id="annotationEditTextField">Texto<textarea id="annotationEditText" rows="3" maxlength="240" placeholder="Sua observação"></textarea></label><label>Cor da anotação<input type="color" id="annotationEditColor" value="#ffcb32"></label><label id="annotationEditSizeField">Tamanho do texto <output id="annotationEditSizeValue"></output><input type="range" id="annotationEditSize" min="8" max="160" step="1"></label><label id="annotationEditWidthField">Espessura do traço <output id="annotationEditWidthValue"></output><input type="range" id="annotationEditWidth" min="1" max="7" step="0.5"></label><div class="annotation-edit-actions"><button type="button" id="deleteEditedAnnotation" class="annotation-delete">Apagar anotação</button><button type="button" id="saveEditedAnnotation" class="primary">Salvar alterações</button></div>`;
  document.body.append(annotationEditor);
  $('closeAnnotationEdit').onclick=()=>annotationEditor.close();
  annotationEditor.addEventListener('click',e=>{if(e.target!==annotationEditor)return;const r=annotationEditor.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)annotationEditor.close();});
  annotationEditor.addEventListener('close',()=>{editingAnnotation=-1;editingControls=null;});
  $('annotationEditSize').oninput=()=>$('annotationEditSizeValue').textContent=$('annotationEditSize').value;
  $('annotationEditWidth').oninput=()=>$('annotationEditWidthValue').textContent=Number($('annotationEditWidth').value).toFixed(1);
  $('saveEditedAnnotation').onclick=()=>{
    const index=editingAnnotation,a=state.annotations[index];if(!a)return annotationEditor.close();
    const next=copy(a);next.color=$('annotationEditColor').value;
    const unit=Math.max(1,state.base.width/700);
    if(a.type==='text'){next.text=$('annotationEditText').value.trim();if(!next.text){toast('Digite o texto ou use Apagar anotação.');return;}if($('annotationEditSize').value!==editingControls?.size)next.fontSize=Number($('annotationEditSize').value)*unit;}
    else if($('annotationEditWidth').value!==editingControls?.width)next.width=Number($('annotationEditWidth').value)*unit;
    if(JSON.stringify(next)!==JSON.stringify(a)){snapshot();state.annotations[index]=next;drawAnnotations();changed();}
    annotationEditor.close();
  };
  $('deleteEditedAnnotation').onclick=()=>{deleteAnnotation(editingAnnotation);annotationEditor.close();};
}
view.addEventListener('pointerdown',e=>{
  if(!state.base||e.target.closest?.('[data-annotation-ui]')||(e.pointerType==='mouse'&&e.button!==0))return;
  e.preventDefault();capturePointer(e.pointerId);pointers.set(e.pointerId,loc(e));
  if(pointers.size>=2){
    cancelInteraction();suppressSingle=true;draft=[];$('finishShape').hidden=true;drawAnnotations();
    const [a,b]=[...pointers.values()],mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    gesture={type:'pinch',distance:Math.hypot(a.x-b.x,a.y-b.y),scale:state.scale,anchor:{x:(mid.x-state.tx)/state.scale,y:(mid.y-state.ty)/state.scale}};return;
  }
  if(suppressSingle)return;
  const p=loc(e),index=targetAnnotation(e);
  if(index>=0){
    // Existing annotations always take precedence over insertion tools.
    selectedAnnotation=index;draft=[];$('finishShape').hidden=true;drawAnnotations();
    const g=gesture={type:'annotation',index,start:p,last:p,original:copy(state.annotations[index]),bounds:objectBounds(index),moved:false,eraseOnTap:state.tool==='erase'};
    clearLongPress();longPressTimer=setTimeout(()=>{if(gesture===g&&pointers.size===1&&!g.moved)openAnnotationEditor(index);},LONG_PRESS_MS);return;
  }
  clearLongPress();selectedAnnotation=-1;drawAnnotations();
  gesture={type:state.tool||'move',start:p,last:p,startImage:imagePoint(p),tx:state.tx,ty:state.ty};
});
function dragDelta(g,p){
  let dx=(p.x-g.start.x)/state.scale,dy=(p.y-g.start.y)/state.scale;
  const b=g.bounds;
  if(b){
    if(b.width<=state.base.width)dx=clamp(dx,-b.x,state.base.width-b.x-b.width);
    else dx=clamp(dx,-g.original.points[0].x,state.base.width-g.original.points[0].x);
    if(b.height<=state.base.height)dy=clamp(dy,-b.y,state.base.height-b.y-b.height);
    else dy=clamp(dy,-g.original.points[0].y,state.base.height-g.original.points[0].y);
  }
  return {dx,dy};
}
view.addEventListener('pointermove',e=>{
  if(!pointers.has(e.pointerId))return;e.preventDefault();const p=loc(e);pointers.set(e.pointerId,p);
  if(pointers.size>=2&&gesture?.type==='pinch'){
    const [a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y),mid={x:(a.x+b.x)/2,y:(a.y+b.y)/2};
    state.scale=clamp(gesture.scale*d/Math.max(1,gesture.distance),.03,16);state.tx=mid.x-gesture.anchor.x*state.scale;state.ty=mid.y-gesture.anchor.y*state.scale;applyTransform();return;
  }
  if(suppressSingle||!gesture)return;const g=gesture;g.last=p;
  if(g.type==='annotation'){
    const distance=Math.hypot(p.x-g.start.x,p.y-g.start.y);if(!g.moved&&distance<DRAG_THRESHOLD)return;
    clearLongPress();if(!g.moved){clearTimeout(saveTimer);g.undoEntry=snapshot();g.moved=true;}
    const {dx,dy}=dragDelta(g,p);state.annotations[g.index]={...g.original,points:g.original.points.map(point=>({x:point.x+dx,y:point.y+dy}))};drawAnnotations();
  }else if(g.type==='move'){state.tx=g.tx+p.x-g.start.x;state.ty=g.ty+p.y-g.start.y;applyTransform();}
  else if(['line','arrow','measure','calibrate'].includes(g.type))drawAnnotations(styleAnnotation(g.type,[g.startImage,imagePoint(p)]));
});
function pointerEnd(e,cancel=false){
  if(!pointers.has(e.pointerId))return;
  const g=gesture,p=pointers.get(e.pointerId);pointers.delete(e.pointerId);clearLongPress();
  if(suppressSingle){if(!pointers.size){suppressSingle=false;gesture=null;}return;}
  gesture=null;
  if(!g){drawAnnotations();return;}
  if(cancel){rollbackDrag(g);drawAnnotations();return;}
  if(g.type==='annotation'){
    if(g.moved){if(JSON.stringify(state.annotations[g.index])!==JSON.stringify(g.original))changed();else{const i=history.indexOf(g.undoEntry);if(i>=0)history.splice(i,1);}}
    else if(g.eraseOnTap)deleteAnnotation(g.index);
    drawAnnotations();return;
  }
  const ip=imagePoint(p),dist=Math.hypot(p.x-g.start.x,p.y-g.start.y);
  if(['arrow','line','measure','calibrate'].includes(g.type)){
    if(dist<DRAG_THRESHOLD){drawAnnotations();return;}
    const a=styleAnnotation(g.type,[g.startImage,ip]);
    if(g.type==='calibrate'){pendingCalibration=a;drawAnnotations(a);$('knownLength').value='';openDialog('calibrationDialog');}else commit(a);
  }else if(['polygon','curve'].includes(g.type)&&dist<12){draft.push(ip);drawAnnotations();$('finishShape').hidden=draft.length<(g.type==='polygon'?3:2);}
  else if(g.type==='text'&&dist<12){pendingText=ip;$('annotationText').value='';openDialog('textDialog');setTimeout(()=>$('annotationText').focus(),100);}
}
view.addEventListener('pointerup',e=>pointerEnd(e));view.addEventListener('pointercancel',e=>pointerEnd(e,true));
view.addEventListener('lostpointercapture',e=>{if(pointers.has(e.pointerId))pointerEnd(e,true);});
view.addEventListener('contextmenu',e=>{const i=targetAnnotation(e);if(i>=0){e.preventDefault();openAnnotationEditor(i);}});
svg.addEventListener('keydown',e=>{
  const index=targetAnnotation(e);if(index<0)return;
  if(e.key==='Enter'||e.key===' '){e.preventDefault();openAnnotationEditor(index);}
  else if(e.key==='Delete'||e.key==='Backspace'){e.preventDefault();deleteAnnotation(index);}
  else if(e.key==='Escape'){e.preventDefault();selectAnnotation(-1);}
});
view.addEventListener('wheel',e=>{
  if(!state.base||e.target.closest?.('[data-annotation-ui]'))return;e.preventDefault();cancelInteraction();releasePointers();
  const p=loc(e),anchor={x:(p.x-state.tx)/state.scale,y:(p.y-state.ty)/state.scale},factor=Math.exp(-e.deltaY*.002);
  state.scale=clamp(state.scale*factor,.03,16);state.tx=p.x-anchor.x*state.scale;state.ty=p.y-anchor.y*state.scale;applyTransform();
},{passive:false});
window.addEventListener('blur',()=>{cancelInteraction();releasePointers();drawAnnotations();});
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'){cancelInteraction();releasePointers();drawAnnotations();}});
$('finishShape').onclick=()=>{if(draft.length>1)commit(styleAnnotation(state.tool,draft));};
$('confirmText').onclick=()=>{const t=$('annotationText').value.trim();if(!t||!pendingText)return;const a=styleAnnotation('text',[pendingText]);a.text=t;a.fontSize=Math.max(20,state.base.width/25);commit(a);$('textDialog').close();pendingText=null;};
$('confirmCalibration').onclick=()=>{const real=Number($('knownLength').value);if(!pendingCalibration||!Number.isFinite(real)||real<=0||real>1000){toast('Informe um comprimento válido em milímetros.');return;}snapshot();const [a,b]=pendingCalibration.points;state.calibration=real/Math.hypot(a.x-b.x,a.y-b.y);pendingCalibration=null;$('calibrationDialog').close();updateSize();drawAnnotations();changed();toast('Escala calibrada. Confira a referência e a distorção da projeção.');};
$('calibrationDialog').addEventListener('close',()=>drawAnnotations());
$('undoButton').onclick=async()=>{if(draft.length){draft.pop();drawAnnotations();$('finishShape').hidden=draft.length<(state.tool==='polygon'?3:2);return;}cancelInteraction();releasePointers();selectedAnnotation=-1;const prev=history.pop();if(!prev){toast('Nenhuma anotação ou transformação para desfazer.');return;}const changedBase=prev.base!==state.base;Object.assign(state,prev);syncFilterControls();updateSize();drawAnnotations();await renderPixels();if(changedBase)fit();changed();};
async function rotate(){if(!state.base)return;snapshot();const b=state.base,c=makeCanvas(b.height,b.width),ctx=c.getContext('2d');ctx.translate(b.height,0);ctx.rotate(Math.PI/2);ctx.drawImage(b,0,0);state.annotations=state.annotations.map(a=>({...a,points:a.points.map(p=>({x:b.height-p.y,y:p.x}))}));state.base=c;draft=[];updateSize();await renderPixels();fit();drawAnnotations();changed();}
// Detect the largest dark film-like region surrounded by bright or blue light.

let crop={x:.06,y:.06,w:.88,h:.88},cropDrag=null;
function drawCrop(){const c=$('cropCanvas'),w=c.width,h=c.height,x=crop.x*w,y=crop.y*h,cw=crop.w*w,ch=crop.h*h;const handle=Math.max(10,w/45);$('cropOverlay').setAttribute('viewBox',`0 0 ${w} ${h}`);$('cropOverlay').innerHTML=`<path d="M0 0H${w}V${h}H0Z M${x} ${y}V${y+ch}H${x+cw}V${y}Z" fill="#03101b" fill-opacity=".65" fill-rule="evenodd"/><rect x="${x}" y="${y}" width="${cw}" height="${ch}" fill="none" stroke="#ffcb32" stroke-width="${w/200}"/>${[[x,y],[x+cw,y],[x+cw,y+ch],[x,y+ch]].map(([px,py],i)=>`<circle data-corner="${i}" cx="${px}" cy="${py}" r="${handle*1.9}" fill="transparent"/><circle data-corner="${i}" cx="${px}" cy="${py}" r="${handle}" fill="#fff" stroke="#ffcb32" stroke-width="${w/250}"/>`).join('')}`;}
function autoCrop(){const c=makeCanvas(480,480*state.base.height/state.base.width),ctx=c.getContext('2d');ctx.drawImage(state.base,0,0,c.width,c.height);const result=detectFilm(ctx.getImageData(0,0,c.width,c.height).data,c.width,c.height);if(result){crop={x:result.x+.002,y:result.y+.002,w:Math.max(.025,result.w-.004),h:Math.max(.025,result.h-.004)};$('cropHint').textContent='Contorno sugerido. Confira e arraste os cantos se necessário.';}else{crop={x:.06,y:.06,w:.88,h:.88};$('cropHint').textContent='Não foi possível isolar o filme com confiança. Ajuste os quatro cantos.';}drawCrop();}
function openCrop(auto=false){if(!state.base)return;const c=$('cropCanvas');c.width=state.base.width;c.height=state.base.height;c.getContext('2d').drawImage(state.base,0,0);crop={x:.06,y:.06,w:.88,h:.88};$('cropStage').style.maxWidth=(window.innerHeight*.55*c.width/c.height)+'px';openDialog('cropDialog');if(auto)autoCrop();else drawCrop();}
function cropPoint(e){const r=$('cropOverlay').getBoundingClientRect();return {x:clamp((e.clientX-r.left)/r.width,0,1),y:clamp((e.clientY-r.top)/r.height,0,1)};}
$('cropOverlay').addEventListener('pointerdown',e=>{const corner=e.target.dataset.corner;if(corner===undefined)return;e.preventDefault();$('cropOverlay').setPointerCapture(e.pointerId);cropDrag={corner:Number(corner),start:{...crop}};});
$('cropOverlay').addEventListener('pointermove',e=>{if(!cropDrag)return;e.preventDefault();const p=cropPoint(e),c=cropDrag.start;let x1=c.x,y1=c.y,x2=c.x+c.w,y2=c.y+c.h;if([0,3].includes(cropDrag.corner))x1=Math.min(p.x,x2-.025);else x2=Math.max(p.x,x1+.025);if([0,1].includes(cropDrag.corner))y1=Math.min(p.y,y2-.025);else y2=Math.max(p.y,y1+.025);crop={x:x1,y:y1,w:x2-x1,h:y2-y1};drawCrop();});
['pointerup','pointercancel','lostpointercapture'].forEach(ev=>$('cropOverlay').addEventListener(ev,()=>cropDrag=null));
$('autoCrop').onclick=autoCrop;
$('applyCrop').onclick=async()=>{snapshot();const b=state.base,x=Math.round(crop.x*b.width),y=Math.round(crop.y*b.height),c=makeCanvas(Math.min(b.width-x,crop.w*b.width),Math.min(b.height-y,crop.h*b.height));c.getContext('2d').drawImage(b,x,y,c.width,c.height,0,0,c.width,c.height);state.annotations=state.annotations.map(a=>({...a,points:a.points.map(p=>({x:p.x-x,y:p.y-y}))}));state.base=c;draft=[];updateSize();await renderPixels();drawAnnotations();fit();$('cropDialog').close();changed();toast('Recorte aplicado. Desfazer restaura o enquadramento anterior.');};
export async function flattened(){if(!state.base)return null;clearTimeout(filterTimer);await renderPixels();const c=makeCanvas(canvas.width,canvas.height);c.getContext('2d').drawImage(canvas,0,0);if(state.annotations.length){const markup=`<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}" viewBox="0 0 ${c.width} ${c.height}">${state.annotations.map((a,i)=>annotationMarkup(a,i)).join('')}</svg>`;const blob=new Blob([markup],{type:'image/svg+xml'}),im=await imageFromBlob(blob);c.getContext('2d').drawImage(im,0,0);}return c;}
export async function reportPreview(){const c=await flattened();if(!c)return null;const ratio=Math.min(1,1100/c.width),small=makeCanvas(c.width*ratio,c.height*ratio);small.getContext('2d').drawImage(c,0,0,small.width,small.height);return small.toDataURL('image/jpeg',.9);}
function setEditorPane(pane){
  const image=pane==='image';$('imageToolsPane').hidden=!image;$('annotationToolsPane').hidden=image;
  document.querySelectorAll('[data-editor-pane]').forEach(b=>{const active=b.dataset.editorPane===pane;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  $('editorControls').scrollTop=0;if(image)setTool(null);
}
export function initEditor(){initAnnotationUI();document.querySelectorAll('[data-editor-pane]').forEach(b=>b.onclick=()=>setEditorPane(b.dataset.editorPane));$('adjustPanel').hidden=false;const main=[['adjust','Ajustes','adjust'],['crop','Recortar','crop'],['gray','Cinza','gray'],['invert','Inverter','invert'],['rotate','Girar','rotate'],['ai','IA 2×','sparkles'],['original','Original','reset']];$('mainTools').innerHTML=main.map(([id,label,ic])=>`<button data-action="${id}" class="${id==='ai'?'ai-tool':''}">${icon(ic)}<span>${label}</span></button>`).join('');const draw=[['move','Mover','move'],['arrow','Seta','arrow'],['line','Linha','line'],['curve','Curva','curve'],['polygon','Polígono','polygon'],['text','Texto','text'],['measure','Medir','ruler'],['calibrate','Escala','calibrate'],['erase','Apagar','erase']];$('drawTools').innerHTML=draw.map(([id,label,ic])=>`<button data-tool="${id}" class="${id==='move'?'active':''}">${icon(ic)}<span>${label}</span></button>`).join('');$('drawTools').onclick=e=>{const b=e.target.closest('[data-tool]');if(b)setTool(state.tool===b.dataset.tool?null:b.dataset.tool);};$('mainTools').onclick=async e=>{const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action;if(a==='adjust'){setEditorPane('image');$('adjustPanel').hidden=false;}else if(a==='crop')openCrop();else if(['gray','invert'].includes(a)){state.filters[a]=!state.filters[a];syncFilterControls();await renderPixels();changed();}else if(a==='rotate')await rotate();else if(a==='ai')openAI();else if(a==='original'){if(!confirm('Restaurar a imagem original? Recorte, ajustes, anotações e escala serão reiniciados.'))return;const im=await imageFromBlob(state.original),ratio=Math.min(1,2400/Math.max(im.width,im.height)),c=makeCanvas(im.width*ratio,im.height*ratio);c.getContext('2d').drawImage(im,0,0,c.width,c.height);snapshot();state.base=c;state.annotations=[];state.calibration=null;Object.assign(state.filters,{brightness:0,contrast:0,sharpness:0,detail:0,gray:false,invert:false});draft=[];syncFilterControls();updateSize();drawAnnotations();await renderPixels();fit();changed();toast('Original restaurado. Desfazer recupera a edição anterior.');}};['brightness','contrast','sharpness','detail'].forEach(k=>$(k).oninput=()=>{state.filters[k]=Number($(k).value);$(k+'Value').textContent=state.filters[k];updateFilters();});$('resetFilters').onclick=async()=>{Object.assign(state.filters,{brightness:0,contrast:0,sharpness:0,detail:0,gray:false,invert:false});syncFilterControls();await renderPixels();changed();};$('fitButton').onclick=fit;$('captureButton').onclick=$('editorCaptureButton').onclick=()=>$('cameraInput').click();$('openButton').onclick=$('editorOpenButton').onclick=()=>$('fileInput').click();$('cameraInput').onchange=async e=>{await loadFile(e.target.files[0],true);e.target.value='';};$('fileInput').onchange=async e=>{await loadFile(e.target.files[0]);e.target.value='';};$('exportImage').onclick=async()=>{try{const c=await flattened();if(c)download(await toBlob(c),'UNINASSAU_radiografia_anotada.png');}catch(e){toast(e.message);}};new ResizeObserver(()=>{if(state.base&&view.clientWidth>0&&!pointers.size)fit();}).observe(view);setTool(null);}
let upscaler=null,aiResult=null,aiRunning=false;
function script(src){return new Promise((res,rej)=>{if(document.querySelector(`script[src="${src}"]`)){res();return;}const el=document.createElement('script');el.src=src;el.onload=res;el.onerror=()=>{el.remove();rej(Error('Não foi possível carregar o motor de IA.'));};document.head.append(el);});}
function openAI(){if(!state.base)return;$('compareStage').hidden=true;$('downloadAI').hidden=true;aiResult=null;openDialog('aiDialog');}
$('runAI').onclick=async()=>{if(aiRunning)return;aiRunning=true;$('runAI').disabled=true;$('cancelAI').hidden=false;$('aiProgress').hidden=false;$('downloadAI').hidden=true;const label=$('aiProgress').querySelector('span'),bar=$('aiProgress').querySelector('progress');bar.value=0;try{label.textContent='Carregando rede neural local…';await script('vendor/tf.min.js');await script('vendor/esrgan-2x.min.js');await script('vendor/upscaler.min.js');if(!aiRunning)return;await window.tf.ready();if(!upscaler){upscaler=new window.Upscaler({model:{...window.ESRGANSlim2x,path:new URL('models/2x/model.json',location.href).href}});}await renderPixels();const max=Number($('aiResolution').value),ratio=Math.min(1,max/Math.max(canvas.width,canvas.height)),input=makeCanvas(canvas.width*ratio,canvas.height*ratio);input.getContext('2d').drawImage(canvas,0,0,input.width,input.height);$('compareBefore').src=input.toDataURL('image/png');label.textContent='Processando em blocos…';const src=await upscaler.upscale(input,{patchSize:64,padding:6,awaitNextFrame:true,output:'base64',progress:p=>{bar.value=Math.round(p*100);label.textContent=`Processando localmente… ${Math.round(p*100)}%`;}});if(!aiRunning)return;aiResult=src;$('compareAfter').src=src;await loadImage(src);$('compareStage').style.maxWidth=(window.innerHeight*.5*input.width/input.height)+'px';$('compareStage').style.marginInline='auto';$('compareStage').hidden=false;$('downloadAI').hidden=false;$('compareSlider').value=50;comparePosition();label.textContent=`Concluído · ${input.width*2} × ${input.height*2} px · IA ilustrativa`;bar.value=100;toast('Arraste a divisória para comparar. O original do laudo foi preservado.');}catch(e){label.textContent='Não foi possível concluir a IA neste dispositivo.';if(aiRunning)toast('IA indisponível: memória ou aceleração insuficiente. Tente a opção mais leve.');console.warn('Upscaling failed',e.name);}finally{aiRunning=false;$('runAI').disabled=false;$('cancelAI').hidden=true;}};
function comparePosition(){const p=Number($('compareSlider').value);$('compareAfterWrap').style.clipPath=`inset(0 0 0 ${p}%)`;$('compareDivider').style.left=p+'%';}
$('compareSlider').oninput=comparePosition;
$('cancelAI').onclick=()=>{aiRunning=false;upscaler?.abort();$('aiProgress').querySelector('span').textContent='Processamento cancelado.';};
$('aiDialog').addEventListener('close',()=>{if(aiRunning){aiRunning=false;upscaler?.abort();}});
$('downloadAI').onclick=async()=>{if(aiResult)download(await (await fetch(aiResult)).blob(),'UNINASSAU_IA_ilustrativa_2x.png');};
