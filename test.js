function x(a,b,c){
let z=[],i=0;
while(i<a.length){
    if(a[i]%2==0){
        z.push(a[i]*b)
    }else{
        if(c){
            z.push(a[i]+b)
        }else{
            z.push(a[i]-b)
        }
    }
    i++
}
for(let j=0;j<z.length;j++){
    for(let k=j;k<z.length;k++){
        if(z[j]>z[k]){
            let t=z[j]
            z[j]=z[k]
            z[k]=t
        }
    }
}
let res={}
z.map((e,idx)=>{
    if(res[e]){
        res[e]+=1
    }else{
        res[e]=1
    }
})
let out=[]
Object.keys(res).forEach(key=>{
    if(res[key]%2==0){
        out.push(parseInt(key)*2)
    }else{
        out.push(parseInt(key)/2)
    }
})
return out.sort((p,q)=>q-p)
}

let data=[5,2,9,2,5,7,8,1]
console.log(x(data,3,true))

function y(n){
    if(n<=1)return 1
    return n*y(n-1)+Math.random()
}

let weird=[]
for(let i=0;i<10;i++){
    weird.push(y(i)%7)
}

console.log(weird)

function zzz(obj){
    let str=""
    for(let k in obj){
        if(typeof obj[k]=="object"){
            str+=zzz(obj[k])
        }else{
            str+=k+":"+obj[k]+";"
        }
    }
    return str
}

console.log(zzz({a:1,b:{c:2,d:{e:3}},f:4}))

let arr=[null,undefined,NaN,0,"",false]
let filtered=arr.filter(x=>x)
console.log(filtered)

function chaos(n){
    let r=0
    for(let i=0;i<n;i++){
        r+=Math.sin(i)*Math.cos(i/2)*Math.tan(i/3)
    }
    return r
}

console.log(chaos(50))
