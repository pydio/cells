## Upgrading the web folder

Download the distribution from pdf.js github releases:

```bash
wget https://github.com/mozilla/pdf.js/releases/download/v5.4.296/pdfjs-5.4.296-dist.zip
unzip pdfjs-5.4.296-dist.zip
cp -r pdfjs-5.4.296-dist/web/* frontend/assets/editor.pdfjs/res/dist/pdfjs/web/
```

Copy the contents of the `web` folder from the unzipped distribution to `frontend/assets/editor.pdfjs/res/dist/pdfjs/web`, overwriting existing files.
