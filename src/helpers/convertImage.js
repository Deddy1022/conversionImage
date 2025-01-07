const sharp = require("sharp");
const { writeLog } = require("../shared/logApp")

sharp.cache({ memory: 1000, files: 10, dirs: 1 });

async function convertImage(buffer, currentName, outputPath, xmlDir, attempt = 1) {
  try {
   
    const processedBuffer = await sharp(buffer)
      .rotate()
      .grayscale()
      .withMetadata({ density: 200 })
      .jpeg({ quality: Math.max(90 - attempt * 25, 50) })
      .toBuffer();

    const metadata = await sharp(processedBuffer).metadata();
    const fileSizeKB = processedBuffer.length / 1024;

    if (fileSizeKB > 900 && attempt < 4) {
      console.log(
        `Tentative ${attempt}: Taille de l'image ${currentName} ${fileSizeKB.toFixed(2)} KB trop grande. Nouvelle compression...`
      );

      const resizedBuffer = await sharp(processedBuffer)
        .resize({ width: Math.round(metadata.width * 0.9) })
        .toBuffer();

      return convertImage(resizedBuffer, currentName, outputPath, attempt + 1);
    }

    await sharp(processedBuffer).toFile(outputPath);

    writeLog("SUCCES", xmlDir, `Compression réussie pour ${currentName}: ${fileSizeKB.toFixed(2)} KB`);
    return { success: true, message: "Compression réussie", sizeKB: fileSizeKB };
  } catch (err) {
    writeLog("ERREUR", xmlDir, `Échec de la compression pour ${currentName}: ${err}`);
    return { success: false, message: "Échec de la compression", error: err };
  }
}

module.exports = { convertImage }