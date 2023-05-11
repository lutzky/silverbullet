import { indexedDB } from "https://deno.land/x/indexeddb@v1.1.0/ponyfill_memory.ts";
import { IndexedDBSpacePrimitives } from "./indexeddb_space_primitives.ts";
import { assertEquals } from "../../test_deps.ts";

Deno.test("IndexedDBSpacePrimitives", async () => {
  const space = new IndexedDBSpacePrimitives("test", indexedDB);
  const files = await space.fetchFileList();
  assertEquals(files, []);
  // Write text file
  const fileMeta = await space.writeFile("test.txt", "utf8", "Hello World");
  assertEquals((await space.readFile("test.txt", "utf8")).data, "Hello World");
  const fbContent = (await space.readFile("test.txt", "arraybuffer"))
    .data as ArrayBuffer;
  assertEquals(new TextDecoder().decode(fbContent), "Hello World");
  assertEquals(await space.fetchFileList(), [fileMeta]);
  const buf = new Uint8Array([1, 2, 3, 4, 5]);
  // Write binary file
  await space.writeFile("test.bin", "arraybuffer", buf);
  const fMeta = await space.getFileMeta("test.bin");
  assertEquals(fMeta.size, 5);
  assertEquals((await space.fetchFileList()).length, 2);

  await space.deleteFile("test.bin");
  assertEquals(await space.fetchFileList(), [fileMeta]);
});