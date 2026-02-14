import * as ai from "../services/ai.service.js";
import { createZipStream } from "../services/zip.service.js";
import stream from "stream";

const tryParseJSON = (text) => {
  if (!text) return null;
  if (typeof text === "object") return text;
  try {
    return JSON.parse(text);
  } catch (e) {
    // try extract JSON substring
    try {
      const s = String(text);
      const first = s.indexOf("{");
      const last = s.lastIndexOf("}");
      if (first !== -1 && last !== -1 && last > first) {
        return JSON.parse(s.substring(first, last + 1));
      }
    } catch (e2) {
      return null;
    }
  }
  return null;
};

const flattenFileTree = (node, path = "", out = {}) => {
  if (node === null || node === undefined) return out;
  if (Array.isArray(node)) {
    node.forEach((item) => {
      const name = item.name || item.filename || item.path;
      const contents = item.contents || item.content || (item.file && (item.file.contents || item.file)) || JSON.stringify(item);
      if (name) out[path ? `${path}/${name}` : name] = { content: typeof contents === "string" ? contents : JSON.stringify(contents) };
    });
    return out;
  }

  if (node && typeof node === "object") {
    // explicit file node
    if (node.file || node.content || node.contents) {
      const contents = node.content || node.contents || (node.file && (node.file.contents || node.file)) || JSON.stringify(node);
      if (path) out[path] = { content: typeof contents === "string" ? contents : JSON.stringify(contents) };
    }

    // directory key
    if (node.directory && typeof node.directory === "object") {
      Object.keys(node.directory).forEach((k) => flattenFileTree(node.directory[k], path ? `${path}/${k}` : k, out));
      return out;
    }

    // generic object: recurse keys
    Object.keys(node).forEach((k) => {
      if (["text", "buildCommand", "startCommand"].includes(k)) return;
      flattenFileTree(node[k], path ? `${path}/${k}` : k, out);
    });
  }
  return out;
};

export const getResult = async (req, res) => {
  try {
    const prompt = req.query.prompt;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    const result = await ai.generateResult(prompt);
    return res.status(200).json({ result });
  } catch (error) {
    console.error("Error in getResult controller:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const generate = async (req, res) => {
  try {
    const prompt = req.body.prompt;
    if (!prompt) return res.status(400).json({ message: "prompt is required" });

    const raw = await ai.generateResult(prompt);
    const parsed = tryParseJSON(raw) || {};

    const fileTreeSource = parsed.fileTree || parsed.files || parsed.filesTree || parsed;
    const fileTree = flattenFileTree(fileTreeSource, "", {});

    const buildCommand = parsed.buildCommand || parsed.build || null;
    const startCommand = parsed.startCommand || parsed.start || null;

    return res.status(200).json({ fileTree, buildCommand, startCommand });
  } catch (error) {
    console.error("Error in generate:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const zipProject = async (req, res) => {
  try {
    const fileTree = req.body.fileTree;
    if (!fileTree || typeof fileTree !== "object") return res.status(400).json({ message: "fileTree required" });

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename=project.zip`);

    const archive = createZipStream(fileTree);
    const pass = new stream.PassThrough();
    archive.pipe(pass);
    archive.finalize();
    pass.pipe(res);
  } catch (error) {
    console.error("Error creating zip:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
