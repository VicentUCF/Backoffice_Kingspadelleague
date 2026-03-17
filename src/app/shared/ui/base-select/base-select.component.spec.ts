import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import { axe } from 'jest-axe';

import { BaseSelectComponent } from './base-select.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseSelectComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-base-select
        formControlName="status"
        label="Estado"
        helperText="Selecciona el estado operativo."
        [errorMessage]="showError() ? 'Debes seleccionar un estado.' : null"
      >
        <option value="DRAFT">Borrador</option>
        <option value="ACTIVE">Activa</option>
      </app-base-select>
    </form>
  `,
})
class BaseSelectHostComponent {
  readonly showError = signal(false);
  readonly form = new FormGroup({
    status: new FormControl('DRAFT', {
      nonNullable: true,
    }),
  });
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BaseSelectComponent, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <app-base-select formControlName="captain" label="Capitán" placeholder="Selecciona capitán">
        @for (option of options(); track option.value) {
          <option [value]="option.value">{{ option.label }}</option>
        }
      </app-base-select>
    </form>
  `,
})
class DynamicBaseSelectHostComponent {
  readonly options = signal([
    { label: 'Borja Vercher', value: 'borja' },
    { label: 'Adri Alvarez', value: 'adri' },
    { label: 'Miguel Esteve', value: 'miguel' },
  ]);
  readonly form = new FormGroup({
    captain: new FormControl('borja', {
      nonNullable: true,
    }),
  });
}

describe('BaseSelectComponent', () => {
  it('updates the reactive form when the selected option changes', async () => {
    const { fixture } = await render(BaseSelectHostComponent);
    const host = fixture.componentInstance;
    const select = screen.getByRole('combobox', { name: /Estado/i });

    await fireEvent.change(select, {
      target: { value: 'ACTIVE' },
    });

    expect(host.form.controls.status.value).toBe('ACTIVE');
  });

  it('associates helper text and errors accessibly', async () => {
    const { fixture } = await render(BaseSelectHostComponent);
    const host = fixture.componentInstance;

    host.showError.set(true);
    fixture.detectChanges();

    const select = screen.getByRole('combobox', { name: /Estado/i });
    const helperText = screen.getByText(/Selecciona el estado operativo/i);
    const errorMessage = screen.getByText(/Debes seleccionar un estado/i);
    const describedBy = select.getAttribute('aria-describedby');

    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(describedBy).toContain(helperText.id);
    expect(describedBy).toContain(errorMessage.id);
  });

  it('keeps the selected value in sync when the available options change', async () => {
    const { fixture } = await render(DynamicBaseSelectHostComponent);
    const host = fixture.componentInstance;

    host.options.set([
      { label: 'Adri Alvarez', value: 'adri' },
      { label: 'Miguel Esteve', value: 'miguel' },
    ]);
    host.form.controls.captain.setValue('adri');
    fixture.detectChanges();

    const select = screen.getByRole('combobox', { name: /Capitán/i }) as HTMLSelectElement;

    expect(select.value).toBe('adri');
    expect(select.selectedOptions[0]?.textContent?.trim()).toBe('Adri Alvarez');
  });

  it('has no accessibility violations', async () => {
    const { container } = await render(BaseSelectHostComponent);

    expect(await axe(container)).toHaveNoViolations();
  });
});
