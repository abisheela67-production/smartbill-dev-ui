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

  /* ---------------- Focus & Navigation ---------------- */
  focusCell(row: number, col: number) {
    if (row < 0 || col < 0) return;
    if (row >= this.data.length) row = this.data.length - 1;
    if (col >= this.columns.length) col = this.columns.length - 1;

    this.focusedCell = { row, col };
    this.cellFocus.emit({ row, col, field: this.columns[col].field });

    // Wait until inputs are ready
    setTimeout(() => {
      const input = this.getInput(row, col);
      if (input) input.nativeElement.focus();
    }, 30);
  }

  enableEditing(row: number, col: number) {
    if (this.readOnly) return;
    this.editingCell = { row, col };
    this.cellBeginEdit.emit({ row, col });
    setTimeout(() => {
      const input = this.getInput(row, col);
      if (input) {
        input.nativeElement.focus();
        input.nativeElement.select();
      }
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

  // ✅ Ctrl + N → Add new row
  if (event.ctrlKey && key === 'n') {
    event.preventDefault();
    this.addRow();
    this.focusCell(this.data.length - 1, 0);
    return;
  }

  // ✅ Ctrl + Delete → Delete current row
  if (event.ctrlKey && key === 'delete' && this.allowUserToDeleteRows) {
    event.preventDefault();
    this.deleteRow(row);
    return;
  }

  // ✅ Delete → Clear cell
  if (key === 'delete' && !event.ctrlKey) {
    event.preventDefault();
    const field = this.columns[col].field;
    this.data[row][field] = '';
    this.cellValueChanged.emit({ row, col, value: '' });
    return;
  }

  // ✅ Enter → Move right or to next row
  if (key === 'enter') {
    event.preventDefault();
    this.disableEditing(row, col);

    if (col < this.columns.length - 1) {
      // Move to next column in same row
      this.focusCell(row, col + 1);
      this.enableEditing(row, col + 1);
    } else {
      // Move to next row, first cell
      if (row < this.data.length - 1) {
        this.focusCell(row + 1, 0);
        this.enableEditing(row + 1, 0);
      } else if (this.allowUserToAddRows) {
        // Add row if at end
        this.addRow();
        this.focusCell(this.data.length - 1, 0);
        this.enableEditing(this.data.length - 1, 0);
      }
    }
    return;
  }

  // ✅ Escape → Cancel editing
  if (key === 'escape') {
    event.preventDefault();
    this.disableEditing(row, col);
    return;
  }

  // ✅ Tab / Shift+Tab → Navigate horizontally and wrap
  if (key === 'tab') {
    event.preventDefault();
    const nextCol = event.shiftKey ? col - 1 : col + 1;

    if (nextCol >= 0 && nextCol < this.columns.length) {
      // Move horizontally within same row
      this.focusCell(row, nextCol);
    } else if (!event.shiftKey) {
      // Move to next row’s first column
      if (row < this.data.length - 1) {
        this.focusCell(row + 1, 0);
      } else if (this.allowUserToAddRows) {
        this.addRow();
        this.focusCell(this.data.length - 1, 0);
      }
    } else {
      // Shift+Tab at first column → Move to previous row’s last column
      if (row > 0) {
        this.focusCell(row - 1, this.columns.length - 1);
      }
    }
    return;
  }

  // ✅ Arrow key navigation with wrapping
  switch (key) {
    case 'arrowright':
      event.preventDefault();
      if (col < this.columns.length - 1) {
        this.focusCell(row, col + 1);
      } else if (row < this.data.length - 1) {
        this.focusCell(row + 1, 0);
      } else if (this.allowUserToAddRows) {
        this.addRow();
        this.focusCell(this.data.length - 1, 0);
      }
      break;

    case 'arrowleft':
      event.preventDefault();
      if (col > 0) {
        this.focusCell(row, col - 1);
      } else if (row > 0) {
        this.focusCell(row - 1, this.columns.length - 1);
      }
      break;

    case 'arrowup':
      event.preventDefault();
      if (row > 0) this.focusCell(row - 1, col);
      break;

    case 'arrowdown':
      event.preventDefault();
      if (row < this.data.length - 1) {
        this.focusCell(row + 1, col);
      } else if (this.allowUserToAddRows) {
        this.addRow();
        this.focusCell(this.data.length - 1, col);
      }
      break;
  }
}


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
    this.focusCell(next, 0);
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
