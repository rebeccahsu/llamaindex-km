import { DepartmentNames } from "src/constants"

export enum Department {
  HR = 0,
  RD = 1,
  LEGAL = 2,
  A = 3,
  B = 4,
  C = 5,
  D = 6,
  E = 7,
  F = 8,
  G = 9,
  H = 10
}

const DEPARTMENT_MAP = {
  [DepartmentNames.HR]: Department.HR,
  [DepartmentNames.RD]: Department.RD,
  [DepartmentNames.Legal]: Department.LEGAL,
  [DepartmentNames.A]: Department.A,
  [DepartmentNames.B]: Department.B,
  [DepartmentNames.C]: Department.C,
  [DepartmentNames.D]: Department.D,
  [DepartmentNames.E]: Department.E,
  [DepartmentNames.F]: Department.F,
  [DepartmentNames.G]: Department.G,
  [DepartmentNames.H]: Department.H
} as const

export default class PermissionFlags {
  private flags: Map<Department, boolean>

  constructor(flags: Partial<Record<Department, boolean>> = {}) {
    this.flags = new Map(
      Object.values(Department)
        .filter(key => typeof key === 'number')
        .map(dept => [dept as Department, flags[dept as Department] ?? false])
    )
  }

  // Parse from string format (e.g., "110")
  static parse(flagString: string): PermissionFlags {
    const flags = new PermissionFlags()
    Array.from(flagString).forEach((flag, index) => {
      flags.setPermission(index as Department, flag === '1')
    })
    return flags
  }

  static permissionsToDepartments(permissionString: string): string[] {
    return permissionString
      .split('')
      .map((flag, index) => flag === '1' ? Object.values(DepartmentNames)[index as Department] : null)
      .filter((name): name is string => name !== null)
  }

  // Convert to string format
  stringify(): string {
    return Array.from(Object.values(Department))
      .filter(key => typeof key === 'number')
      .map(dept => this.hasPermission(dept as Department) ? '1' : '0')
      .join('')
  }

  // Get all flags as array
  toFlags(): boolean[] {
    return Array.from(Object.values(Department))
      .filter(key => typeof key === 'number')
      .map(dept => this.hasPermission(dept as Department))
  }

  // Check if has specific permission
  hasPermission(department: Department): boolean {
    return this.flags.get(department) ?? false
  }

  // Set specific permission
  setPermission(department: Department, value: boolean): void {
    this.flags.set(department, value)
  }

  // Add multiple permissions at once
  addPermissions(...departments: Department[]): void {
    departments.forEach(dept => this.setPermission(dept, true))
  }

  // Remove multiple permissions at once
  removePermissions(...departments: Department[]): void {
    departments.forEach(dept => this.setPermission(dept, false))
  }

  // Get departments that have permission
  getEnabledDepartments(): Department[] {
    return Array.from(this.flags.entries())
      .filter(([_, hasPermission]) => hasPermission)
      .map(([dept]) => dept)
  }

  // Create MongoDB query for finding users with specific permissions
  static createQuery(departments: string[]) {
    // Convert department names to indexes
    const indexes = departments
      .map(dept => DEPARTMENT_MAP[dept.toLowerCase() as keyof typeof DEPARTMENT_MAP])
      .filter(index => index !== undefined)

      console.log('indexes', indexes)
  
    // Create regex pattern where specified positions must be '1'
    const pattern = Array(Math.max(...Object.values(Department).filter(k => typeof k === 'number')) + 1).fill('.')
    indexes.forEach(index => {
      if (index !== undefined) {
        pattern[index] = '1'
      }
    })
  
    return { permission: new RegExp(`^${pattern.join('')}`) }
  }
}
