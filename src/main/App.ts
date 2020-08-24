import * as Settings from "electron-settings";
import * as E from "electron";

import * as Const from "Const";
import { themesDirectory } from "Utils/Common";
import { isFigmaValidUrl, mkdirIfNotExists } from "Utils/Main";
import Args from "./Args";
import WindowManager from "./window/WindowManager";
import { Session } from "./Session";
import "./events/app";

class App {
  windowManager: WindowManager;
  session: Session;

  constructor() {
    const isSingleInstance = E.app.requestSingleInstanceLock();

    if (!isSingleInstance) {
      E.app.quit();
      return;
    } else {
      E.app.on("second-instance", (event, argv) => {
        let projectLink = "";
        console.log("second-instance, argv: ", argv);
        const paramIndex: number = argv.findIndex(i => isFigmaValidUrl(i));

        if (paramIndex !== -1) {
          projectLink = argv[paramIndex];
        }

        if (this.windowManager && this.windowManager.mainWindow) {
          if (projectLink !== "") {
            this.windowManager.openUrl(projectLink);
          }

          this.windowManager.mainWindow.isMinimized() && this.windowManager.mainWindow.restore();
          !this.windowManager.mainWindow.isVisible() && this.windowManager.mainWindow.show();

          this.windowManager.mainWindow.focus();
        }
      });

      this.session = new Session();

      mkdirIfNotExists(themesDirectory).catch(error => {
        console.error("mkdirIfNotExists error: ", error);
      });
    }

    this.appEvent();

    Settings.setAll({
      ...Const.DEFAULT_SETTINGS,
      ...(Settings.getAll() as SettingsInterface),
    });
  }

  private appEvent = (): void => {
    E.app.setAsDefaultProtocolClient(Const.PROTOCOL);
    E.app.allowRendererProcessReuse = false;

    E.app.on("ready", this.ready);
    E.app.on("browser-window-created", (e, window) => window.setMenu(null));
    E.app.on("window-all-closed", this.onWindowAllClosed);
  };

  private ready = (): void => {
    const { figmaUrl } = Args();

    this.windowManager = WindowManager.instance;
    this.session.handleAppReady();

    setTimeout(() => {
      figmaUrl !== "" && this.windowManager.openUrl(figmaUrl);
    }, 1500);

    E.protocol.registerHttpProtocol(
      Const.PROTOCOL,
      (req, cb) => {
        this.windowManager.addTab("loadMainContent.js", req.url);

        cb({
          url: req.url,
          method: req.method,
        });
      },
      err => err && console.log("failed to register http protocol, err: ", err),
    );
  };

  private onWindowAllClosed = (): void => {
    if (process.platform !== "darwin") {
      E.app.quit();
    }
  };
}

export default (): void => {
  new App();
};
