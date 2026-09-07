'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '../../../components/layout/AppShell';
import { ProtectedRoute } from '../../../components/auth/ProtectedRoute';
import { PageHeader } from '../../../components/ui/PageHeader';
import { Card } from '../../../components/ui/Card';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Button } from '../../../components/ui/Button';
import { mockTasks } from '../../../lib/mock';
import type { TaskStatus } from '../../../types/task';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params?.['id'] as string;

  const task = mockTasks.find((t) => t.id === taskId) || mockTasks[0];
  const [currentStatus, setCurrentStatus] = useState<TaskStatus>(task?.status || 'TODO');
  const [checklist, setChecklist] = useState(task?.checklist || []);

  if (!task) {
    return (
      <ProtectedRoute requiredPermission="tasks.view">
        <AppShell>
          <div className="py-12 text-center text-slate-500">Task record not found.</div>
        </AppShell>
      </ProtectedRoute>
    );
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item)),
    );
  };

  return (
    <ProtectedRoute requiredPermission="tasks.view">
      <AppShell>
        <div className="space-y-6">
          <PageHeader
            title={task.title}
            description={`Case #${task.caseNumber} • Assigned to ${task.assignedToName}`}
            breadcrumbs={[
              { label: 'Home', href: '/dashboard' },
              { label: 'Tasks', href: '/tasks' },
              { label: task.title },
            ]}
            actions={
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => router.push('/tasks')}>
                  ← Back to Tasks
                </Button>
                <Link href={`/cases/${task.caseId}`}>
                  <Button variant="primary" size="sm">
                    Open Case #{task.caseNumber}
                  </Button>
                </Link>
              </div>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Context Card */}
            <div className="space-y-6">
              <Card title="Task Metadata" description="Dispatch schedule and ownership">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Workflow Status</span>
                    <StatusBadge status={currentStatus} />
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Priority Tier</span>
                    <StatusBadge status={task.priority} />
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Assigned Technician</span>
                    <span className="font-semibold text-slate-800">{task.assignedToName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Target Due Date</span>
                    <span className="font-semibold text-slate-800">{task.dueDate}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">Created On</span>
                    <span className="text-slate-700">{task.createdAt}</span>
                  </div>
                </div>
              </Card>

              {/* Status Update Quick Action */}
              <Card title="Status Transition" description="Update task progress">
                <div className="space-y-2">
                  <Button
                    variant={currentStatus === 'IN_PROGRESS' ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setCurrentStatus('IN_PROGRESS')}
                  >
                    ▶ Mark In Progress
                  </Button>
                  <Button
                    variant={currentStatus === 'COMPLETED' ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setCurrentStatus('COMPLETED')}
                  >
                    ✓ Mark Completed
                  </Button>
                  <Button
                    variant={currentStatus === 'CANCELLED' ? 'destructive' : 'outline'}
                    size="sm"
                    className="w-full justify-start text-xs"
                    onClick={() => setCurrentStatus('CANCELLED')}
                  >
                    ✕ Cancel Task
                  </Button>
                </div>
              </Card>
            </div>

            {/* Task Details & Checklist */}
            <div className="lg:col-span-2 space-y-6">
              <Card title="Task Instructions & Scope" description="Detailed procedural requirements">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                  {task.description}
                </div>
              </Card>

              <Card
                title={`Procedural Checklist (${checklist.filter((i) => i.done).length}/${checklist.length} Completed)`}
                description="Step-by-step verification milestones"
              >
                {checklist.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    No individual checklist items defined for this task.
                  </div>
                ) : (
                  <div className="space-y-2 text-xs">
                    {checklist.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors cursor-pointer ${
                          item.done
                            ? 'bg-emerald-50/60 border-emerald-200 text-slate-700'
                            : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-900'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.done}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                        />
                        <span className={item.done ? 'line-through text-slate-500' : 'font-medium'}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
