import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class IpcServiceService {

  tempate_html = '';
  fs;
  path;
  dir = 'D:/ThangTT/Dropbox/Project/LGenToolsApp';
  appName = 'LGenToolsApp';
  win;

  constructor(private _electronService: ElectronService) {
    const remote = this._electronService.remote;

    this.fs = remote.require('fs');
    this.path = remote.require('path');
    this.fs.readFile(this.dir + '/src/view_template.html', 'utf-8', (err, data) => {
      if ( err ) {
        alert( 'An error ocurred reading the file :' + err.message);
        return;
      }
      this.tempate_html = data;
    });
  }

  public on(channel: string, listener: Function): void {
    this._electronService.ipcRenderer.on(channel, (evt, args) => listener(evt, args));
  }

  public send(channel: string, ...args): void {
    console.log('service');
    this._electronService.ipcRenderer.send(channel, args);
  }

  public openWindowEditTemplate(filePath) {
    if (!filePath || filePath.length === 0) { return; }
    const remote = this._electronService.remote;

    if(this.win === undefined){
      const BrowserWindow = remote.BrowserWindow;
      this.win = new BrowserWindow({
        height: 600,
        width: 800});
        this.win.loadURL('data:text/html;charset=utf-8,' + encodeURI(this.tempate_html));
    }

    let self = this;
    this.fs.readFile(filePath, 'utf-8', (err, data) => {
      if ( err ) {
        alert( 'An error ocurred reading the file :' + err.message);
        return;
      }
      self.showOnWindow(data);
    });

    
      
  }

  private showOnWindow(content){
    this.win.webContents.executeJavaScript(' document.getElementById(\'content\').value = \'' 
      + content.replace(/\n/g, '\\n' )
        .replace(/\r/g, '\\r' )
        .replace(/\t/g, '\\t' )
        .replace(/'/g,'\\\'') 
        + '\' ');
  }
}
