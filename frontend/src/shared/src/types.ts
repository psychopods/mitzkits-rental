export interface StudentAccount {
  id: string;
  studentId: string;
  firstName: string;
  lastName: string;
  email: string;
  status: AccountStatus;
  flags: AccountFlag[];
  createdAt: Date;
  updatedAt: Date;
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  FROZEN = 'FROZEN',
  DEACTIVATED = 'DEACTIVATED'
}

export enum AccountFlag {
  MISCONDUCT = 'MISCONDUCT',
  OVERDUE = 'OVERDUE',
  DAMAGED_ITEMS = 'DAMAGED_ITEMS',
  PAYMENT_DUE = 'PAYMENT_DUE'
}

export interface Kit {
  id: string;
  name: string;
  description: string;
  components: KitComponent[];
  status: KitStatus;
  condition: KitCondition;
  createdAt: Date;
  updatedAt: Date;
}

export interface KitComponent {
  id: string;
  name: string;
  description: string;
  status: ComponentStatus;
  condition: KitCondition;
}

export enum KitStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  MAINTENANCE = 'MAINTENANCE',
  LOST = 'LOST'
}

export enum ComponentStatus {
  PRESENT = 'PRESENT',
  MISSING = 'MISSING',
  DAMAGED = 'DAMAGED'
}

export enum KitCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  DAMAGED = 'DAMAGED'
}

export interface BorrowTransaction {
  id: string;
  studentId: string;
  kitId: string;
  borrowDate: Date;
  dueDate: Date;
  returnDate?: Date;
  initialCondition: KitCondition;
  returnCondition?: KitCondition;
  status: TransactionStatus;
  notes?: string;
}

export enum TransactionStatus {
  ACTIVE = 'ACTIVE',
  RETURNED = 'RETURNED',
  OVERDUE = 'OVERDUE',
  LOST = 'LOST'
}

export interface SystemConfig {
  loanPeriodDays: number;
  maxKitsPerStudent: number;
  retentionPeriodYears: number;
  penaltyRules: PenaltyRule[];
}

export interface PenaltyRule {
  type: PenaltyType;
  condition: KitCondition;
  amount: number;
}

export enum PenaltyType {
  DAMAGE = 'DAMAGE',
  LATE_RETURN = 'LATE_RETURN',
  LOSS = 'LOSS'
}

export interface NotificationConfig {
  type: NotificationType;
  enabled: boolean;
  template: string;
  triggers: NotificationTrigger[];
}

export enum NotificationType {
  EMAIL = 'EMAIL',
  SMS = 'SMS'
}

export enum NotificationTrigger {
  DUE_DATE_REMINDER = 'DUE_DATE_REMINDER',
  OVERDUE_NOTICE = 'OVERDUE_NOTICE',
  ACCOUNT_STATUS_CHANGE = 'ACCOUNT_STATUS_CHANGE',
  PENALTY_NOTICE = 'PENALTY_NOTICE'
}