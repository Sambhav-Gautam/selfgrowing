import type { GridCell, CellType } from './types.js';

export const GRID_SIZE = 100;

export class WorldGrid {
    cells: GridCell[][];

    constructor(initialGrid?: GridCell[][]) {
        if (initialGrid) {
            this.cells = initialGrid;
        } else {
            this.cells = this.generateEmptyGrid();
        }
    }

    private generateEmptyGrid(): GridCell[][] {
        const grid: GridCell[][] = [];
        for (let x = 0; x < GRID_SIZE; x++) {
            const col: GridCell[] = [];
            for (let y = 0; y < GRID_SIZE; y++) {
                col.push({
                    x,
                    y,
                    type: 'grass'
                });
            }
            grid.push(col);
        }
        return grid;
    }

    getCell(x: number, y: number): GridCell | null {
        if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return null;
        return this.cells[x][y];
    }

    setCellType(x: number, y: number, type: CellType) {
        const cell = this.getCell(x, y);
        if (cell) cell.type = type;
    }
}
