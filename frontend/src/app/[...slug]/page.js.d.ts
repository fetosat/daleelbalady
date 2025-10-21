// Type declaration for page.js shim
// This tells TypeScript about the JS module exports

declare const _default: typeof import('./page.tsx').default;
declare const generateStaticParams: typeof import('./page.tsx').generateStaticParams;

export { generateStaticParams };
export default _default;
