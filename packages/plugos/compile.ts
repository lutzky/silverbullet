import esbuild from "esbuild";
import { readFile, unlink, writeFile } from "fs/promises";
import path from "path";

export async function compile(
  filePath: string,
  functionName: string = "",
  debug: boolean = false,
  excludeModules: string[] = [],
  meta = false
): Promise<string> {
  let outFile = path.join(path.dirname(filePath), "_out.tmp");
  let inFile = filePath;

  if (functionName) {
    // Generate a new file importing just this one function and exporting it
    inFile = "_in.ts";
    await writeFile(
      inFile,
      `import {${functionName}} from "./${filePath}";export default ${functionName};`
    );
  }

  // TODO: Figure out how to make source maps work correctly with eval() code
  let result = await esbuild.build({
    entryPoints: [path.basename(inFile)],
    bundle: true,
    format: "iife",
    globalName: "mod",
    platform: "browser",
    sourcemap: false, //sourceMap ? "inline" : false,
    minify: !debug,
    outfile: outFile,
    metafile: true,
    external: excludeModules,
    absWorkingDir: path.resolve(path.dirname(inFile)),
  });

  if (meta) {
    let text = await esbuild.analyzeMetafile(result.metafile);
    console.log("Bundle info for", functionName, text);
  }

  let jsCode = (await readFile(outFile)).toString();
  await unlink(outFile);
  if (inFile !== filePath) {
    await unlink(inFile);
  }
  return `(() => { ${jsCode}
    return mod;})()`;
}
