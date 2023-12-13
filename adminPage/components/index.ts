import { ComponentLoader } from 'adminjs';
import path from 'path';
import * as url from 'url';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
export const componentLoader = new ComponentLoader();

const add = (componentName: string, url: string): string =>
  componentLoader.add(componentName, path.join(__dirname, url));

export const Components = {
  Dashboard: add('Dashboard', './dashboard/dashboard.tsx'),
  event_list: add('EventList', './event/EventList.tsx'),
  event_show: add('EventShow', './event/EventShow.tsx'),
  notice_list: add('NoticeList', './notice/NoticeList.tsx'),
  notice_show: add('NoticeShow', './notice/NoticeShow.tsx'),
  // event_edit: add('EventEdit', './event/EventEdit.tsx'),
  // custom: add('Custom', './custom/Custom.tsx')
}
