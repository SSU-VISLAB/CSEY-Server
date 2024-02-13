import fs from 'fs/promises';
import path from 'path';
import * as url from 'url';

// 폴더를 생성할 경로 정의
const foldersToCreate = [
  '/public/events',
  '/public/notices'
];
const __dirname = url.fileURLToPath(new URL('./dist', import.meta.url));
// 각 폴더를 생성하는 함수
async function createFolder(folderPath) {
  try {
    await fs.mkdir(folderPath, { recursive: true });
  } catch (err) {
    console.error(`Error creating folder ${folderPath}: ${err.message}`);
  }
}

// 모든 폴더를 생성
async function createFolders() {
  for (const folder of foldersToCreate) {
    const absolutePath = path.join(__dirname, folder);
    await createFolder(absolutePath);
  }
}
createFolders();
