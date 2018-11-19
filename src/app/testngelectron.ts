import {ElectronService} from 'ngx-electron'

export class DialogHelper {
    public static remote=new ElectronService().remote;
    public static alert = new ElectronService().remote.dialog;
}