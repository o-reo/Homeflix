import { TestBed } from '@angular/core/testing';

import { AuthsimpleService } from './authsimple.service';

describe('AuthsimpleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AuthsimpleService = TestBed.get(AuthsimpleService);
    expect(service).toBeTruthy();
  });
});
