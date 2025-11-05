import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChildren,
  QueryList,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-input-data-grid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './input-data-grid.component.html',
  styleUrls: ['./input-data-grid.component.css'],
})
export class InputDataGridComponent implements AfterViewInit {
  /* =============================
   🧠 DataGridView-Like Properties
  ==============================*/
  @Input() columns: any[] = [];
  @Input() data: any[] = [];

  @Input() allowUserToAddRows = true;
  @Input() allowUserToDeleteRows = false;
  @Input() allowUserToResizeColumns = true;
  @Input() readOnly = false;
  @Input() selectionMode: 'CellSelect' | 'FullRowSelect' = 'CellSelect';
  @Input() parent: any = {};

  /* =============================
   📤 Events
  ==============================*/
  @Output() cellFocus = new EventEmitter<any>();
  @Output() cellBeginEdit = new EventEmitter<any>();
  @Output() cellEndEdit = new EventEmitter<any>();
  @Output() cellValueChanged = new EventEmitter<any>();
  @Output() rowAdded = new EventEmitter<any>();
  @Output() rowDeleted = new EventEmitter<any>();
  @Output() columnResized = new EventEmitter<any>();

  /* =============================
   🔧 Internal State
  ==============================*/
  @ViewChildren('gridInput') inputs!: QueryList<ElementRef>;
  focusedCell = { row: 0, col: 0 };
  editingCell = { row: -1, col: -1 };

  resizingColumn: number | null = null;
  startX: number | null = null;
  startWidth: number | null = null;

  ngAfterViewInit() {
    if (this.data.length) setTimeout(() => this.focusCell(0, 0), 150);
  }

  /* ---------------- Helper ---------------- */
  private focusAndSelect(el: HTMLElement | null) {
    if (!el) return;
    el.focus?.();

    const tag = el.tagName?.toLowerCase();
    if (
      (tag === 'input' || tag === 'textarea') &&
      typeof (el as any).select === 'function'
    ) {
      (el as any).select();
    }
  }

  /* ---------------- Focus & Navigation ---------------- */
  focusCell(row: number, col: number) {
    if (row < 0 || col < 0) return;
    if (row >= this.data.length) row = this.data.length - 1;
    if (col >= this.columns.length) col = this.columns.length - 1;

    this.focusedCell = { row, col };
    this.cellFocus.emit({ row, col, field: this.columns[col].field });

    // Wait until input is rendered in DOM
    setTimeout(() => {
      const input = this.getInput(row, col);
      this.focusAndSelect(input?.nativeElement);
    }, 30);
  }

  /* ---------------- Editing ---------------- */
  enableEditing(row: number, col: number) {
    if (this.readOnly) return;

    this.editingCell = { row, col };
    this.cellBeginEdit.emit({ row, col });

    setTimeout(() => {
      const input = this.getInput(row, col);
      this.focusAndSelect(input?.nativeElement);
    }, 10);
  }

  disableEditing(row: number, col: number) {
    if (!this.isEditingCell(row, col)) return;

    const field = this.columns[col].field;
    const value = this.data[row][field];
    this.cellEndEdit.emit({ row, col, value });
    this.cellValueChanged.emit({ row, col, value });
    this.editingCell = { row: -1, col: -1 };
  }

  isEditingCell(row: number, col: number): boolean {
    return this.editingCell.row === row && this.editingCell.col === col;
  }

  getInput(row: number, col: number): ElementRef | null {
    const flat = this.inputs?.toArray();
    const index = row * this.columns.length + col;
    return flat[index] || null;
  }
handleKeyDown(event: KeyboardEvent, row: number, col: number) {
  const key = event.key.toLowerCase();

  switch (key) {
    case 'arrowright':
      event.preventDefault();
      this.focusNextEditableCell(row, col);
      break;

    case 'arrowleft':
      event.preventDefault();
      this.focusPrevEditableCell(row, col);
      break;

    case 'arrowdown':
      event.preventDefault();
      this.focusNextRowSameColumn(row, col);
      break;

    case 'arrowup':
      event.preventDefault();
      this.focusPrevRowSameColumn(row, col);
      break;

    case 'delete':
      event.preventDefault();
      this.deleteRow(row);
      break;

    case 'enter':
      event.preventDefault();
      this.disableEditing(row, col);
      this.focusNextEditableCell(row, col);
      break;

    case 'tab':
      event.preventDefault();
      if (event.shiftKey) this.focusPrevEditableCell(row, col);
      else this.focusNextEditableCell(row, col);
      break;

    case 'escape':
      event.preventDefault();
      this.disableEditing(row, col);
      break;

    default:
      if (event.key.length === 1) this.handleKeyPress(event, row, col);
      break;
  }
}
focusNextRowSameColumn(row: number, col: number) {
  if (row + 1 < this.data.length) this.focusCell(row + 1, col);
}

focusPrevRowSameColumn(row: number, col: number) {
  if (row - 1 >= 0) this.focusCell(row - 1, col);
}
handleCheckboxKeyDown(event: KeyboardEvent, row: number, col: number) {
  if (event.key === ' ') {
    event.preventDefault();
    const field = this.columns[col].field;
    this.data[row][field] = !this.data[row][field];
    this.cellValueChanged.emit({ row, col, value: this.data[row][field] });
  } else {
    this.handleKeyDown(event, row, col);
  }
}


focusNextEditableCell(row: number, col: number) {
  const totalCols = this.columns.length;

  // 👉 Move to next editable cell in current row
  for (let c = col + 1; c < totalCols; c++) {
    if (!this.columns[c].readOnly && this.columns[c].visible !== false) {
      this.focusCell(row, c);
      this.enableEditing(row, c);
      return;
    }
  }

  // 👉 Move to next row’s first editable cell
  if (row + 1 < this.data.length) {
    for (let c = 0; c < totalCols; c++) {
      if (!this.columns[c].readOnly && this.columns[c].visible !== false) {
        this.focusCell(row + 1, c);
        this.enableEditing(row + 1, c);
        return;
      }
    }
  }

  // 👉 If new row creation is allowed
  if (this.allowUserToAddRows) {
    this.addRow();
    for (let c = 0; c < totalCols; c++) {
      if (!this.columns[c].readOnly && this.columns[c].visible !== false) {
        this.focusCell(this.data.length - 1, c);
        this.enableEditing(this.data.length - 1, c);
        return;
      }
    }
  }
}

focusPrevEditableCell(row: number, col: number) {
  // 👈 Move backward across editable cells
  for (let c = col - 1; c >= 0; c--) {
    if (!this.columns[c].readOnly && this.columns[c].visible !== false) {
      this.focusCell(row, c);
      this.enableEditing(row, c);
      return;
    }
  }

  // 👈 If at start, go to previous row’s last editable column
  if (row > 0) {
    for (let c = this.columns.length - 1; c >= 0; c--) {
      if (!this.columns[c].readOnly && this.columns[c].visible !== false) {
        this.focusCell(row - 1, c);
        this.enableEditing(row - 1, c);
        return;
      }
    }
  }
}

  handleSelectKeyDown(
    event: KeyboardEvent,
    rowIndex: number,
    colIndex: number,
    select: HTMLSelectElement
  ) {
    switch (event.key) {
      case 'ArrowDown':
        // Move to next option if dropdown is open, else open it
        if (!select.matches(':focus')) select.focus();
        if (select.selectedIndex < select.options.length - 1) {
          select.selectedIndex++;
          select.dispatchEvent(new Event('change'));
        }
        event.preventDefault();
        break;

      case 'ArrowUp':
        // Move to previous option
        if (select.selectedIndex > 0) {
          select.selectedIndex--;
          select.dispatchEvent(new Event('change'));
        }
        event.preventDefault();
        break;

      case 'Enter':
        // Confirm selection and move to next cell
        this.handleKeyDown(event, rowIndex, colIndex);
        break;

      case 'Tab':
        // Move to next column
        this.handleKeyDown(event, rowIndex, colIndex);
        break;

      default:
        break;
    }
  }

  /* ---------------- Key Press ---------------- */
  handleKeyPress(event: KeyboardEvent, row: number, col: number) {
    if (event.key.length === 1 && !this.isEditingCell(row, col)) {
      this.enableEditing(row, col);
      setTimeout(() => {
        const field = this.columns[col].field;
        this.data[row][field] = event.key;
        this.cellValueChanged.emit({ row, col, value: event.key });
      }, 10);
    }
  }

  /* ---------------- Row Management ---------------- */
  addRow() {
    const newRow: any = {};
    this.columns.forEach((c) => (newRow[c.field] = ''));
    this.data.push(newRow);
    this.rowAdded.emit(newRow);
  }

  deleteRow(row: number) {
    if (row < 0 || row >= this.data.length) return;
    this.data.splice(row, 1);
    this.rowDeleted.emit(row);
    const next = Math.min(row, this.data.length - 1);
    this.focusCell(next, 1);
  }

  /* ---------------- Column Resize ---------------- */
  startResize(event: MouseEvent, colIndex: number) {
    if (!this.allowUserToResizeColumns) return;
    this.resizingColumn = colIndex;
    this.startX = event.pageX;
    this.startWidth = (event.target as HTMLElement).parentElement!.offsetWidth;
    document.addEventListener('mousemove', this.resizeMove);
    document.addEventListener('mouseup', this.resizeStop);
  }

  resizeMove = (event: MouseEvent) => {
    if (this.resizingColumn === null) return;
    const dx = event.pageX - (this.startX ?? 0);
    const newWidth = Math.max(60, (this.startWidth ?? 0) + dx);
    const th = document.querySelectorAll('th')[this.resizingColumn];
    if (th) (th as HTMLElement).style.width = `${newWidth}px`;
  };

  resizeStop = () => {
    this.columnResized.emit(this.resizingColumn);
    this.resizingColumn = null;
    document.removeEventListener('mousemove', this.resizeMove);
    document.removeEventListener('mouseup', this.resizeStop);
  };
}
