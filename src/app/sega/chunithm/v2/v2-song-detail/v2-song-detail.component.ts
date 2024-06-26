import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ApiService} from '../../../../api.service';
import {AuthenticationService} from '../../../../auth/authentication.service';
import {ChusanMusic, ChusanMusicLevelInfo, Difficulty} from '../model/ChusanMusic';
import {NgxIndexedDBService} from 'ngx-indexed-db';
import {environment} from '../../../../../environments/environment';
import {HttpParams} from '@angular/common/http';
import {MessageService} from '../../../../message.service';
import {V2Record} from '../model/V2Record';
import { UserService } from 'src/app/user.service';

@Component({
  selector: 'app-v2-song-detail',
  templateUrl: './v2-song-detail.component.html',
  styleUrls: ['./v2-song-detail.component.css']
})
export class V2SongDetailComponent implements OnInit {

  host = environment.assetsHost;
  enableImages = environment.enableImages;
  isfavorite = false;

  id: number;
  music: ChusanMusic;
  levels: ChusanMusicLevelInfo[] = [];
  difficulty = Difficulty;
  records: V2Record[] = [null, null, null, null, null];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private userService: UserService,
    private messageService: MessageService,
    private dbService: NgxIndexedDBService
  ) {
  }

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    const aimeId = String(this.userService.currentUser.defaultCard.extId);
    const param = new HttpParams().set('aimeId', String(aimeId));
    this.dbService.getByID<ChusanMusic>('chusanMusic', this.id).subscribe(x => {
      if (x) {
        this.music = x;
        for (const key of Object.keys(this.music.levels)) {
          if (this.music.levels[key].enable) {
            this.levels.push(this.music.levels[key]);
          }
        }
      }

    });
    this.api.get('api/game/chuni/v2/song/' + this.id, param).subscribe(
      data => {
        console.log(data);
        this.checkfavorite();
        data.forEach(x => {
          this.records[x.level] = x;
        });
      },
      error => this.messageService.notice(error)
    );
  }

  favorite() {
    const aimeId = String(this.userService.currentUser.defaultCard.extId);
    const param = new HttpParams().set('aimeId', String(aimeId));
    this.api.put('api/game/chuni/v2/song/' + this.id + '/favorite', param).subscribe(
      data => {
        console.log(data);
        this.checkfavorite();
      },
      error => this.messageService.notice(error)
    );
  }

  checkfavorite() {
    const aimeId = String(this.userService.currentUser.defaultCard.extId);
    const param = new HttpParams().set('aimeId', String(aimeId));
    this.api.get('api/game/chuni/v2/song/' + this.id + '/isfavorite', param).subscribe(
      data => {
        this.isfavorite = data;
      }
    )
  }

}
