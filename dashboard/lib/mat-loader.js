import fs from "fs";
import path from "path";
import mat4js from "mat4js";

const DATA_DIR = path.join(process.cwd(), "data");

export function loadGroupData(groupId = 1) {
  const safeGroup = Number(groupId);
  const fileName = `group${safeGroup}_combined.mat`;
  const filePath = path.join(DATA_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing MAT file: ${fileName}. Place it in ${DATA_DIR}.`);
  }

  const mat = mat4js.read(filePath);
  const record = mat.group1_combined || mat[`group${safeGroup}_combined`] || mat;

  if (!record) {
    throw new Error("MAT file does not contain expected struct.");
  }

  return record;
}

export function normalizeMatrix(matrix) {
  if (!Array.isArray(matrix)) {
    return [];
  }
  return matrix.map((row) => Array.from(row));
}

export function normalizeVector(vector) {
  if (!Array.isArray(vector)) {
    return [];
  }
  if (Array.isArray(vector[0])) {
    return vector.map((item) => (Array.isArray(item) ? item[0] : item));
  }
  return Array.from(vector);
}
