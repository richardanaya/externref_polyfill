import './style.css'
import typescriptLogo from './typescript.svg'
import {ExternRef} from "externref_polyfill"

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Vite + TypeScript</h1>
    <div class="card">
      <button id="run" type="button">Run</button>
    </div>
    <p class="read-the-docs">
      Click on the Vite and TypeScript logos to learn more
    </p>
  </div>
`

document.querySelector<HTMLButtonElement>('#run')?.addEventListener('click', async () => {
  // instantiate webassembly module echo.wasm
  const response = await fetch('echo.wasm');
  const wasmBytes = await response.arrayBuffer();
  const wasmModule = await WebAssembly.instantiate(wasmBytes, {
    env: {
      externref_drop: (externRef:bigint) => {
        const index = Number(externRef & BigInt(0xffffffff));
        const generation = Number(externRef >> BigInt(32));
        console.log(`dropped externref with index ${index} and generation ${generation} and value ${JSON.stringify(ExternRef.load(externRef))}`);
        ExternRef.delete(externRef);
      },
      echo_echo: (externRef:bigint) => {
        console.log(ExternRef.load(externRef)+"...");
      }
    }
  });
  const textExternRef = ExternRef.create("Hello, World!");
  (wasmModule.instance.exports.echo as CallableFunction)(textExternRef);
});
