import archiver from "archiver";

export const createZipStream = (fileTree) => {
  const archive = archiver("zip", { zlib: { level: 9 } });

  Object.keys(fileTree).forEach((p) => {
    const entry = fileTree[p];
    const contents = (entry && (entry.content || entry.contents)) || String(entry);
    archive.append(contents, { name: p });
  });

  archive.on("warning", function (err) {
    console.warn("Archive warning:", err);
  });

  archive.on("error", function (err) {
    throw err;
  });

  return archive;
};
