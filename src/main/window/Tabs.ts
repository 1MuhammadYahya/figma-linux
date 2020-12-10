import * as Settings from "electron-settings";
import * as E from "electron";
import * as path from "path";

import { DEFAULT_SETTINGS } from "Const";
import { isDev, app } from "Utils/Common";
import { getThemeById } from "Utils/Main";
import Fonts from "../Fonts";

export default class Tabs {
  public static registeredCancelCallbackMap: Map<number, Function> = new Map();

  private static tabs: Array<E.BrowserView> = [];

  public static newTab = (url: string, rect: E.Rectangle, preloadScript?: string): E.BrowserView => {
    const options: E.BrowserViewConstructorOptions = {
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true,
        webgl: true,
        experimentalFeatures: false,
        zoomFactor: Settings.get("ui.scaleFigmaUI") as number,
      },
    };

    if (preloadScript !== "") {
      options.webPreferences.preload = path.resolve(
        isDev ? `${process.cwd()}/dist/` : `${__dirname}/../`,
        "renderer/middleware",
        preloadScript || "",
      );
    }

    const tab = new E.BrowserView(options);

    tab.setAutoResize({
      width: true,
      height: true,
      horizontal: true,
      vertical: true,
    });
    tab.setBounds(rect);
    tab.webContents.loadURL(url);
    tab.webContents.on("dom-ready", () => {
      let dirs = Settings.get("app.fontDirs") as string[];

      const currentThemeId = Settings.get("theme.currentTheme") as string;
      if (currentThemeId !== "0") {
        getThemeById(currentThemeId).then(theme => {
          app.emit("themes-change", theme);
        });
      }

      if (!dirs) {
        dirs = DEFAULT_SETTINGS.app.fontDirs;
      }
      Fonts.getFonts(dirs)
        .catch(err => console.error(`Failed to load local fonts, error: ${err}`))
        .then(fonts => {
          tab.webContents.send("updateFonts", fonts);
        });
    });

    isDev && tab.webContents.toggleDevTools();

    Tabs.tabs.push(tab);

    return tab;
  };

  public static closeAll = () => {
    Tabs.tabs = Tabs.tabs.filter(t => {
      if (t.id != 1) {
        t.destroy();
        return false;
      } else {
        return true;
      }
    });
  };

  public static close = (id: number) => {
    Tabs.tabs = Tabs.tabs.filter(t => {
      if (t.id != id) {
        return true;
      } else {
        t.destroy();
        return false;
      }
    });
  };

  public static reloadAll = () => Tabs.tabs.forEach(t => (!t.isDestroyed() ? t.webContents.reload() : ""));

  public static focus = (id: number): E.BrowserView => {
    return Tabs.tabs.find(t => t.id === id) as E.BrowserView;
  };

  public static getAll = (): Array<E.BrowserView> => Tabs.tabs;

  public static getByWebContentId = (id: number): E.BrowserView | undefined => {
    for (const tab of Tabs.tabs) {
      if (tab.webContents.id === id) {
        return tab;
      }
    }

    return undefined;
  };
}
