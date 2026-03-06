import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function validadorLongitudId(min: number, max: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value as string | null)?.trim() ?? '';
    if (!value) {
      return null;
    }
    if (value.length < min || value.length > max) {
      return { idLength: { requiredMin: min, requiredMax: max, actualLength: value.length } };
    }
    return null;
  };
}

export function validadorFechaLiberacionNoEnFuturo(todayProvider: () => string = obtenerHoyIso): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value as string | null;
    if (!value) {
      return null;
    }

    const todayIso = todayProvider();

    if (value > todayIso) {
      return { releaseDateInFuture: true };
    }

    return null;
  };
}

export function validadorFechaRevisionUnAnioDespuesLiberacion(
  releaseDateControlName: string,
  todayProvider: () => string = obtenerHoyIso
): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const releaseControl = group.get(releaseDateControlName);
    const reviewControl = group.get('date_revision');

    if (!releaseControl || !reviewControl) {
      return null;
    }

    const releaseDate = releaseControl.value as string | null;
    const reviewDate = reviewControl.value as string | null;

    if (!releaseDate || !reviewDate) {
      return null;
    }

    const expectedReview = agregarUnAnioIso(releaseDate);

    if (reviewDate !== expectedReview) {
      return { reviewDateNotOneYearAfterRelease: { expected: expectedReview, actual: reviewDate } };
    }

    return null;
  };
}

export function obtenerHoyIso(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, '0');
  const day = `${today.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function agregarUnAnioIso(dateIso: string): string {
  const [yearStr, monthStr, dayStr] = dateIso.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  const date = new Date(year, month - 1, day);
  date.setFullYear(date.getFullYear() + 1);

  const newYear = date.getFullYear();
  const newMonth = `${date.getMonth() + 1}`.padStart(2, '0');
  const newDay = `${date.getDate()}`.padStart(2, '0');

  return `${newYear}-${newMonth}-${newDay}`;
}

