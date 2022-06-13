import { join } from "path";
import { app } from "electron";
import { CaptureInterface, CaptureInterfaceOptions, Message } from "@ffxiv-teamcraft/pcap-ffxiv";
import log from "electron-log";
import App from "../app";

export class PacketCapture {

  private static readonly MACHINA_EXE_PATH = join(app.getAppPath(), "../../resources/MachinaWrapper/MachinaWrapper.exe");

  private captureInterface: CaptureInterface;

  constructor() {
    this.start();
  }

  stop(): void {
    if (this.captureInterface) {
      this.captureInterface.stop();
    }
  }

  sendToRenderer(packet: Message): void {
    App.mainWindow?.webContents.send("packet", packet);
  }

  private async start(): Promise<void> {
    const region = "Global"; // TODO get from a store or something to save between sessions.

    const options: Partial<CaptureInterfaceOptions> = {
      monitorType: "WinPCap",
      region: region,
      logger: message => {
        if (message.type === "info") {
          log.info(message.message);
        } else {
          log[message.type || "warn"](message.message);
        }
      }
    };
    log.log(App.isDevelopmentMode(), PacketCapture.MACHINA_EXE_PATH);

    if (!App.isDevelopmentMode()) {
      options.exePath = PacketCapture.MACHINA_EXE_PATH;
    }

    log.info(`Starting PacketCapture with options: ${JSON.stringify(options)}`);
    this.captureInterface = new CaptureInterface(options);
    this.captureInterface.start()
      .then(() => {
        log.info("Packet capture started");
      })
      .catch((err) => {
        log.error(`Couldn't start packet capture`);
        log.error(err);
      });
    this.captureInterface.setMaxListeners(0);
    this.captureInterface.on("message", (message) => {
      this.sendToRenderer(message);
    });
  }
}
