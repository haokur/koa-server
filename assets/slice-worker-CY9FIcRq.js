var E=Object.defineProperty;var I=(c,e,a)=>e in c?E(c,e,{enumerable:!0,configurable:!0,writable:!0,value:a}):c[e]=a;var g=(c,e,a)=>I(c,typeof e!="symbol"?e+"":e,a);import{M as b}from"./MultiChannel-CkJFUiEV.js";import{d as C}from"./file.util-CjwJT0wH.js";import{d as N,c as x,a as s,F as A,o as S,q as U,s as j,f as z,_ as D}from"./index-BxD6fV-S.js";function V(){return Date.now().toString(36)+Math.random().toString(36).substr(2)}class y{constructor(e){g(this,"resolves");g(this,"worker");this.worker=new Worker(e),this.worker.onmessage=this.handleMessage.bind(this),this.worker.onerror=this.handlerError.bind(this),this.resolves=new Map}handleMessage(e){const{_id:a,payload:k}=e.data;this.resolves.has(a)&&(this.resolves.get(a)(k),this.resolves.delete(a))}handlerError(e){console.log("webworker error",e)}postMessage(e){return new Promise(a=>{const k=V(),m={_id:k,payload:e};this.worker.postMessage(m),this.resolves.set(k,a)})}}var v={NODE_ENV:"production",title:"生产环境",baseUrl:"https://api.haokur.com",workerBaseUrl:"workers"};const f=c=>(U("data-v-86f332ef"),c=c(),j(),c),W=f(()=>s("div",{class:"mb20 intro"},[z(" 实测发现： "),s("p",null," 1、在小文件，少文件，使用同步处理的时间会更优于使用webworker处理，因为开启webworker会有损耗，通信也会有消耗 "),s("p",null,"2、使用webworker不会阻塞渲染进程，在进行slice时，不会阻碍刷新渲染"),s("p",null,"3、当处理的量级上去之后，比如8个大文件要进行切割，使用webworker的优势才开始显现"),s("p",null,"4、打开控制台，可以看到console.time打印的耗时")],-1)),$={class:"slice-worker"},q={class:"mb20"},G=f(()=>s("label",{for:""},"直接文件切割",-1)),H={class:"mb20"},O=f(()=>s("label",{for:""},"webworker文件切割-任务大数组",-1)),P={class:"mb20"},J=f(()=>s("label",{for:""},"webworker文件切割-任务二维数组（减少webworker通信）",-1)),K={class:"mb20"},L=f(()=>s("label",{for:""},"多文件同步slice",-1)),Q={class:"mb20"},R=f(()=>s("label",{for:""},"多文件webworker-slice",-1)),M=.4*1024*1024,X=N({__name:"slice-worker",setup(c){const e=l=>{const t=Math.ceil(l.size/M),r=navigator.hardwareConcurrency||4;let o=[];for(let n=0;n<t;n++)o.push({index:n,start:n*M,end:Math.min((n+1)*M,l.size)});return{allTasks:o,workerNum:r}},a=async l=>{const t=l.target.files[0],{allTasks:r}=e(t);console.time("普通切割耗时：");for(let o=0;o<r.length;o++){let{start:n,end:i}=r[o];t.slice(n,i)}console.timeEnd("普通切割耗时：")},k=async l=>{const t=l.target.files[0],{allTasks:r,workerNum:o}=e(t),n=[];console.time("webworker，任务不分组切割");const i=new b(o,()=>new y(`${v.workerBaseUrl}/slice-helper.js`)).onFinished(()=>{console.timeEnd("webworker，任务不分组切割"),C(n,t.name),i.clear()}).addManyTask(r,async(w,_)=>{const h=_.channelInstance,{start:u,end:d}=w;let p=await h.postMessage({action:"sliceFile",file:t,start:u,end:d});n.push(p)}).run()},m=async l=>{const t=l.target.files[0],{allTasks:r,workerNum:o}=e(t),n=[];let i=Math.ceil(r.length/o);for(let h=0;h<o;h++){let u=[];for(let d=0;d<i;d++){let p=h*i+d;r[p]&&u.push(r[p])}n.push(u)}console.time("webworker任务分组切割");const w=[],_=new b(o,()=>new y(`${v.workerBaseUrl}/slice-helper.js`)).onFinished(()=>{console.timeEnd("webworker任务分组切割");let h=w.reduce((u,d)=>u.concat(d),[]);C(h,t.name),_.clear()}).addManyTask(n,async(h,u)=>{const{channelInstance:d,index:p}=u;let B=await d.postMessage({action:"sliceFileMany",file:t,chunks:h});w[p]=B}).run()},F=async l=>{const t=l.target.files;console.time("普通切割耗时："),Array.from(t).forEach(r=>{const{allTasks:o}=e(r);for(let n=0;n<o.length;n++){let{start:i,end:w}=o[n];r.slice(i,w)}}),console.timeEnd("普通切割耗时：")},T=async l=>{const t=l.target.files,r=Array.from(t);console.time("webworker，按文件分别分组切割"),new b(8,()=>new y(`${v.workerBaseUrl}/slice-helper.js`)).onFinished(()=>{console.timeEnd("webworker，按文件分别分组切割")}).addManyTask(r,async(o,n)=>{const i=n.channelInstance,{allTasks:w}=e(o);await i.postMessage({action:"sliceFileByTasks",file:o,allTasks:w})}).run()};return(l,t)=>(S(),x(A,null,[W,s("div",$,[s("div",q,[G,s("input",{type:"file",onChange:a},null,32)]),s("div",H,[O,s("input",{type:"file",onChange:k},null,32)]),s("div",P,[J,s("input",{type:"file",onChange:m},null,32)]),s("div",K,[L,s("input",{type:"file",multiple:"",onChange:F},null,32)]),s("div",Q,[R,s("input",{type:"file",multiple:"",onChange:T},null,32)])])],64))}}),ne=D(X,[["__scopeId","data-v-86f332ef"]]);export{ne as default};
//# sourceMappingURL=slice-worker-CY9FIcRq.js.map
