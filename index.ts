import { existsSync, mkdirSync } from "fs";
import Magic from "magickwand.js";
import path from "path";
import { parseArgs } from "util";
const { Magick } = await Magic;

const { values: args, positionals } = parseArgs({
  args: process.argv,
  options: {
    formats: {
      type: "string",
      short: "f",
      default: "webp,png",
      description: "Comma-separated list of formats to generate",
    },
    sizes: {
      type: "string",
      short: "s",
      default: "16,32,64,128,192,256,384,512,768,1024",
      description: "Comma-separated list of sizes to generate",
    },
    output: {
      type: "string",
      short: "o",
      default: "dist",
      description: "Output directory",
    },
    folderforeach: {
      type: "boolean",
      short: "F",
      default: true,
      description: "Create a folder for each image",
    },
    srcgen: {
      type: "string",
      default: "img",
      description: "Comma-separated list sources to generate",
    },
    convertprogram: {
      type: "string",
      default: "convert",
      description: "Path to the ImageMagick convert program",
    },
  },
  strict: true,
  allowPositionals: true,
});

const getOutput = (filePath: string) => path.join(args.output!, args.folderforeach ? filePath.replace(/\.[^.]*$/, "") : "");

const formats = args.formats!.split(",");
const sizes = args
  .sizes!.split(",")
  .map((size) => parseInt(size, 10))
  .sort((a, b) => b - a); // descending
const srcgen = args.srcgen!.split(",");

let images = positionals.slice(2).map((image) => {
  return {
    path: image,
  };
});

const loadedImages = await Promise.all(
  images.map(async (image) => {
    const im = new Magick.Image();
    await im.readAsync(image.path);
    const size = await im.sizeAsync();
    return {
      ...image,
      loaded: im,
      size,
    };
  })
);

for (const image of loadedImages) {
  const output = getOutput(image.path);

  if (!existsSync(output)) mkdirSync(output);

  const mySizes = sizes.filter((size) => size < image.size.width());

  for (const size of mySizes) {
    await image.loaded.thumbnailAsync(`${size}x0\>`);

    for (const format of formats) {
      await image.loaded.magickAsync(format);

      const filename = args.folderforeach ? `x${size}.${format}` : image.path.replace(/\.[^.]*$/, `-${size}.${format}`);
      await image.loaded.writeAsync(path.join(output, filename));
    }
  }

  if (srcgen.includes("img")) {
    console.log(
      `<img src="${image.path}" srcset="${image.path} ${mySizes[0] + 1}w, ${mySizes
        .map((size) =>
          formats.map(
            (format) =>
              `${path.join(output, args.folderforeach ? `x${size}.${format}` : image.path.replace(/\.[^.]*$/, `-${size}.${format}`))} ${size}w`
          )
        )
        .flat()
        .join(", ")}">`
    );
  }

  if (srcgen.includes("source")) {
    const img = `<img src="${image.path}">`;

    const sources = formats.map(
      (format) =>
        `<source srcset="${image.path} ${mySizes[0] + 1}w, ${mySizes
          .map(
            (size) =>
              `${path.join(output, args.folderforeach ? `x${size}.${format}` : image.path.replace(/\.[^.]*$/, `-${size}.${format}`))} ${size}w`
          )
          .join(", ")}" type="image/${format}">`
    );

    console.log(
      `<picture>
  ${sources.join("\n  ")}
  ${img}
</picture>`
    );
  }
}
