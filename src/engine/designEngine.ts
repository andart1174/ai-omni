export interface UIComponent {
    id: string;
    type: 'button' | 'input' | 'card' | 'navbar' | 'login' | 'table' | 'hero';
    label: string;
    styles: string; // Tailwind classes
    children?: UIComponent[];
}

export const componentBlueprints: Record<string, UIComponent> = {
    button: {
        id: 'bp-btn',
        type: 'button',
        label: 'Submit Button',
        styles: 'bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all'
    },
    input: {
        id: 'bp-inp',
        type: 'input',
        label: 'Email Input',
        styles: 'bg-zinc-900 border border-zinc-700 text-white p-2 rounded-md w-full focus:ring-2 focus:ring-blue-500 outline-none'
    },
    card: {
        id: 'bp-crd',
        type: 'card',
        label: 'Feature Card',
        styles: 'bg-zinc-800 p-6 rounded-2xl border border-zinc-700 shadow-xl'
    },
    login: {
        id: 'bp-lgn',
        type: 'login',
        label: 'Login Panel',
        styles: 'bg-zinc-900 p-8 rounded-3xl border border-zinc-800 w-80 shadow-2xl flex flex-col gap-4'
    },
    navbar: {
        id: 'bp-nav',
        type: 'navbar',
        label: 'Global Nav',
        styles: 'w-full bg-black/50 backdrop-blur-md p-4 flex justify-between items-center border-b border-white/10'
    }
};

export const generateReactCode = (components: UIComponent[]): string => {
    const renderComponent = (comp: UIComponent): string => {
        switch (comp.type) {
            case 'button':
                return `<button className="${comp.styles}">${comp.label}</button>`;
            case 'input':
                return `<input type="text" placeholder="${comp.label}" className="${comp.styles}" />`;
            case 'card':
                return `<div className="${comp.styles}">\n  <h3 className="text-xl font-bold mb-2">${comp.label}</h3>\n  <p className="text-zinc-400">Add your content here...</p>\n</div>`;
            case 'login':
                return `<div className="${comp.styles}">\n  <h2 className="text-2xl font-bold text-center">${comp.label}</h2>\n  <input type="email" placeholder="Email" className="bg-zinc-800 p-2 rounded border border-zinc-700" />\n  <input type="password" placeholder="Password" className="bg-zinc-800 p-2 rounded border border-zinc-700" />\n  <button className="bg-blue-600 p-2 rounded font-bold">Sign In</button>\n</div>`;
            case 'navbar':
                return `<nav className="${comp.styles}">\n  <div className="font-bold text-blue-500">LOGO</div>\n  <div className="flex gap-4 text-sm">\n    <a href="#">Home</a>\n    <a href="#">Products</a>\n    <a href="#">Contact</a>\n  </div>\n</nav>`;
            default:
                return `<div className="${comp.styles}">${comp.label}</div>`;
        }
    };

    const componentStrings = components.map(c => renderComponent(c));

    return `import React from 'react';

export default function GeneratedComponent() {
  return (
    <div className="min-h-screen bg-black text-white p-12 flex flex-col gap-8 items-center">
      ${componentStrings.join('\n      ')}
    </div>
  );
}`;
};
