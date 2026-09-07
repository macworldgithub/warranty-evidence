import React from 'react';
import { Badge } from './Badge';

export type AnyStatus =
  | 'ACTIVE'
  | 'INACTIVE'
  | 'SUSPENDED'
  | 'VOIDED'
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'CLOSED'
  | 'REQUIRED'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'INFO_REQUESTED'
  | 'CLAIM_IN_PROGRESS'
  | 'EXPIRED'
  | 'TODO'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH'
  | 'URGENT'
  | 'ADMIN'
  | 'OPERATIONS'
  | string;

interface StatusBadgeProps {
  status: AnyStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  switch (normalized) {
    // Positive / Completed / Active
    case 'ACTIVE':
    case 'APPROVED':
    case 'COMPLETED':
      return <Badge variant="green" size={size}>{formatLabel(status)}</Badge>;

    // In progress / Blue
    case 'IN_PROGRESS':
    case 'SUBMITTED':
    case 'CLAIM_IN_PROGRESS':
    case 'OPEN':
      return <Badge variant="blue" size={size}>{formatLabel(status)}</Badge>;

    // Warning / Attention / High
    case 'PENDING':
    case 'UNDER_REVIEW':
    case 'INFO_REQUESTED':
    case 'MEDIUM':
    case 'HIGH':
      return <Badge variant="yellow" size={size}>{formatLabel(status)}</Badge>;

    // Critical / Danger / Urgent / Rejected
    case 'REJECTED':
    case 'URGENT':
    case 'VOIDED':
    case 'CANCELLED':
    case 'SUSPENDED':
      return <Badge variant="red" size={size}>{formatLabel(status)}</Badge>;

    // Roles
    case 'ADMIN':
      return <Badge variant="purple" size={size}>Admin</Badge>;
    case 'OPERATIONS':
      return <Badge variant="blue" size={size}>Operations</Badge>;

    // Neutral / Low / Muted
    case 'INACTIVE':
    case 'EXPIRED':
    case 'CLOSED':
    case 'TODO':
    case 'LOW':
    case 'REQUIRED':
    default:
      return <Badge variant="gray" size={size}>{formatLabel(status)}</Badge>;
  }
}

function formatLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
