// Declaração de tipo para CSS — permite import de .css e .module.css em .tsx

// CSS Module imports (import styles from "./X.module.css")
// Deve vir ANTES da declaração genérica para ter prioridade.
declare module "*.module.css" {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Side-effect CSS imports (import "./index.css")
// Nota: em ambientes Vite, side-effect CSS imports são válidos.
// Esta declaração atende apenas o type checker; Vite lida no runtime.
declare module "*.css" {}
