var e=Object.defineProperty;var l=(h,s,t)=>s in h?e(h,s,{enumerable:!0,configurable:!0,writable:!0,value:t}):h[s]=t;var a=(h,s,t)=>l(h,typeof s!="symbol"?s+"":s,t);class c{constructor(s,t){a(this,"channels",[]);a(this,"tasks",[]);a(this,"channelMaxNum",0);a(this,"channelInit");a(this,"finishCallback");a(this,"isPause",!1);this.channelMaxNum=s,this.channelInit=t}onFinished(s){return this.finishCallback=s,this}addTask(s,t){return this.tasks.push({task:s,callback:t,status:0}),this}addManyTask(s,t){return this.tasks=s.map(n=>({task:n,callback:t,status:0})),this}checkChannel(){if(!(this.channels.length>=this.channelMaxNum)&&this.channels.length<this.tasks.length){const t=Math.min(this.tasks.length,this.channelMaxNum);for(let n=this.channels.length;n<t;n++)this.channels.push({index:n,status:0,channelInstance:this.channelInit?this.channelInit():null})}}runTask(){this.isPause||(this.checkChannel(),!this.tasks.length&&this.channels.every(s=>s.status===0)&&this.finishCallback&&this.finishCallback(),this.channels.forEach(s=>{if(s.status===0&&this.tasks.length){s.status=1;const t=this.tasks.shift(),{callback:n,task:i}=t;t.status=1,n(i,s).then(()=>{s.status=0,t.status=2,this.runTask()})}}))}run(){return this.isPause=!1,this.runTask(),this}pause(){return this.isPause=!0,this}clear(){return this.isPause=!0,this.tasks=[],this.channels=[],this}}export{c as M};
