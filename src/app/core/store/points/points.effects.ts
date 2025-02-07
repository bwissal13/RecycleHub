import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as PointsActions from './points.actions';
import { PointsService } from '../../services/points.service';

@Injectable()
export class PointsEffects {
  constructor(
    private actions$: Actions,
    private pointsService: PointsService
  ) {}
} 