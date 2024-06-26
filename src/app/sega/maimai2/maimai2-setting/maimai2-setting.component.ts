import {Component, OnInit} from '@angular/core';
import {ApiService} from '../../../api.service';
import {AuthenticationService} from '../../../auth/authentication.service';
import {MessageService} from '../../../message.service';
import {MatDialog} from '@angular/material/dialog';
import {HttpClient, HttpParams} from '@angular/common/http';
import {DisplayMaimai2Profile} from '../model/Maimai2Profile';
import { Maimai2NameSettingDialog } from './maimai2-name-setting/maimai2-name-setting.dialog';
import { Maimai2UploadUserPortraitDialog } from './maimai2-upload-user-portrait/maimai2-upload-user-portrait.dialog';
import {environment} from '../../../../environments/environment';
import { UserService } from 'src/app/user.service';
import {AccountService} from '../../../auth/account.service';

@Component({
  selector: 'app-maimai2-setting',
  templateUrl: './maimai2-setting.component.html',
  styleUrls: ['./maimai2-setting.component.css']
})
export class Maimai2SettingComponent implements OnInit {

  profile: DisplayMaimai2Profile;

  aimeId: number;
  apiServer: string;
  divMaxLength: number;

  constructor(
    private api: ApiService,
    private accountService: AccountService,
    private http: HttpClient,
    private userService: UserService,
    private messageService: MessageService,
    public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.aimeId = this.userService.currentUser.defaultCard.extId;
    this.apiServer = environment.apiServer;
    const param = new HttpParams().set('aimeId', this.aimeId);
    this.api.get('api/game/maimai2/profile', param).subscribe(
      data => {
        this.profile = data;
      },
      error => this.messageService.notice(error)
    );

    this.api.get("api/game/maimai2/config/userPhoto/divMaxLength").subscribe(divMaxLength => {
      this.divMaxLength = divMaxLength;
    });
  }

  userName() {
    const dialogRef = this.dialog.open(Maimai2NameSettingDialog, {
      width: '250px',
      data: { userName: this.profile.userName }
    });

    dialogRef.afterClosed().subscribe(userName => {
      if (userName) {
        this.api.post('api/game/maimai2/profile/username', { aimeId: this.aimeId, userName: userName }).subscribe(
          x => {
            this.profile = x;
            this.messageService.notice('Successfully changed');
          }, error => this.messageService.notice(error)
        );
      }
    });
  }

  openUploadUserPortraitDialog() {
    this.dialog.open(Maimai2UploadUserPortraitDialog, {
      data: { aimeId: String(this.userService.currentUser.defaultCard.extId), divMaxLength: this.divMaxLength },
      width: "500px",
    });
  }

  downloadFile() {
    const url = this.apiServer + 'api/game/maimai2/export?aimeId=' + this.aimeId;
    const headers = { Authorization: `Bearer ${this.accountService.currentAccountValue.accessToken}` };
    this.http.get(url, { headers, responseType: 'blob' }).subscribe(blob => {
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = `maimai2_${this.aimeId}_exported.json`;
      a.click();
      document.body.appendChild(a);
      document.body.removeChild(a);

      window.URL.revokeObjectURL(objUrl);
    });
  }
}
