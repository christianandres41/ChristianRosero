import { FormControl, FormGroup } from '@angular/forms';
import {
  agregarUnAnioIso,
  obtenerHoyIso,
  validadorLongitudId,
  validadorFechaLiberacionNoEnFuturo,
  validadorFechaRevisionUnAnioDespuesLiberacion
} from './product.validators';

describe('product.validators', () => {
  it('validadorLongitudId should accept values within range', () => {
    const control = new FormControl('ABC123');
    const validator = validadorLongitudId(3, 10);

    const result = validator(control);

    expect(result).toBeNull();
  });

  it('validadorLongitudId should reject values shorter than min', () => {
    const control = new FormControl('AB');
    const validator = validadorLongitudId(3, 10);

    const result = validator(control);

    expect(result).toEqual({
      idLength: {
        requiredMin: 3,
        requiredMax: 10,
        actualLength: 2
      }
    });
  });

  it('validadorFechaLiberacionNoEnFuturo should mark future dates as invalid', () => {
    const control = new FormControl('2099-01-01');
    const validator = validadorFechaLiberacionNoEnFuturo(() => '2025-01-01');

    const result = validator(control);

    expect(result).toEqual({ releaseDateInFuture: true });
  });

  it('validadorFechaRevisionUnAnioDespuesLiberacion should validate review date correctly', () => {
    const group = new FormGroup({
      date_release: new FormControl('2024-03-04'),
      date_revision: new FormControl('2025-03-04')
    });
    const validator = validadorFechaRevisionUnAnioDespuesLiberacion('date_release');

    const result = validator(group);

    expect(result).toBeNull();
  });

  it('validadorFechaRevisionUnAnioDespuesLiberacion should return error when dates do not match rule', () => {
    const group = new FormGroup({
      date_release: new FormControl('2024-03-04'),
      date_revision: new FormControl('2024-03-05')
    });
    const validator = validadorFechaRevisionUnAnioDespuesLiberacion('date_release');

    const result = validator(group);

    expect(result).toEqual({
      reviewDateNotOneYearAfterRelease: {
        expected: '2025-03-04',
        actual: '2024-03-05'
      }
    });
  });

  it('obtenerHoyIso should return a valid ISO date string', () => {
    const iso = obtenerHoyIso();
    expect(iso).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('agregarUnAnioIso should add one year to the given date', () => {
    const result = agregarUnAnioIso('2024-03-04');
    expect(result).toBe('2025-03-04');
  });
});

