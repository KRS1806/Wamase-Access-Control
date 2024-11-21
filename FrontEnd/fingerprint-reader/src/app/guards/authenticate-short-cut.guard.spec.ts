import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { authenticateShortCutGuard } from './authenticate-short-cut.guard';

describe('authenticateShortCutGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => authenticateShortCutGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
