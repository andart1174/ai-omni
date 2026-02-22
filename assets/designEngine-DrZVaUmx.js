const a={button:{id:"bp-btn",type:"button",label:"Submit Button",styles:"bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all"},input:{id:"bp-inp",type:"input",label:"Email Input",styles:"bg-zinc-900 border border-zinc-700 text-white p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none"},card:{id:"bp-crd",type:"card",label:"Feature Card",styles:"bg-zinc-800 p-6 rounded-2xl border border-zinc-700 shadow-xl"},login:{id:"bp-lgn",type:"login",label:"Login Panel",styles:"bg-zinc-900 p-8 rounded-3xl border border-zinc-800 w-80 shadow-2xl flex flex-col gap-4"},navbar:{id:"bp-nav",type:"navbar",label:"Global Nav",styles:"w-full bg-black/50 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10"}},r=t=>{const n=e=>{switch(e.type){case"button":return`<button className="${e.styles}">${e.label}</button>`;case"input":return`<input type="text" placeholder="${e.label}" className="${e.styles}" />`;case"card":return`<div className="${e.styles}">
  <h3 className="text-xl font-bold mb-2">${e.label}</h3>
  <p className="text-zinc-400">Add your content here...</p>
</div>`;case"login":return`<div className="${e.styles}">
  <h2 className="text-2xl font-bold text-center">${e.label}</h2>
  <input type="email" placeholder="Email" className="bg-zinc-800 p-2 rounded border border-zinc-700" />
  <input type="password" placeholder="Password" className="bg-zinc-800 p-2 rounded border border-zinc-700" />
  <button className="bg-blue-600 p-2 rounded font-bold">Sign In</button>
</div>`;case"navbar":return`<nav className="${e.styles}">
  <div className="font-bold text-blue-500">LOGO</div>
  <div className="flex gap-4 text-sm">
    <a href="#">Home</a>
    <a href="#">Products</a>
    <a href="#">Contact</a>
  </div>
</nav>`;default:return`<div className="${e.styles}">${e.label}</div>`}};return`import React from 'react';

export default function GeneratedComponent() {
  return (
    <div className="min-h-screen bg-black text-white p-12 flex flex-col gap-8 items-center">
      ${t.map(e=>n(e)).join(`
      `)}
    </div>
  );
}`};export{a as componentBlueprints,r as generateReactCode};
