# image-sizer - A simple tool to resize and convert your images for the web

### Demo: [https://tobycm.github.io/image-sizer/demo/](https://tobycm.github.io/image-sizer/demo/)
### Video demo: [https://youtu.be/7agkmatB7cA](https://youtu.be/7agkmatB7cA)

## Usage:

### Install dependencies

```bash
bun install
```

```bash
bun run index.ts [-f/--formats formats] [-s/--sizes sizes] [-o/--output output_folder] [-F/--folderforeach] image_file
```

`--formats` (`-f`): comma-seperated list of formats to convert the images to (default: webp,png)

`--sizes` (`-s`): comma-seperated list of width sizes to resize the images to (default: 16,32,64,128,192,256,384,512,768,1024)

`--output` (`-o`): path to output folder. will be created if it doesn't exist (default: dist/)

`--folderforeach` (`-F`): a toggle flag to organize each generated pictures into their own folder (default: true)

This project was created using `bun init` in bun v1.1.42. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
