'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Play, Check, X, ArrowLeft } from 'lucide-react';
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
              { label: task.id },
            ]}
            actions={
              <Button variant="outline" size="sm" onClick={() => router.push('/tasks')} className="inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Tasks</span>
              </Button>
            }
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Task Overview Sidebar */}
            <div className="space-y-6">
              <Card title="Task Metadata" description="Assignment & priority details">
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Current Status</span>
                    <StatusBadge status={currentStatus} />
                  </div>
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <span className="text-slate-400">Priority Level</span>
                    <StatusBadge status={task.priority} />
                  </div>
                  <div>
                    <span className="text-slate-400">Assigned Operator</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{task.assignedToName}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Target Due Date</span>
                    <p className="font-semibold text-slate-800 mt-0.5">{task.dueDate}</p>
                  </div>
                </div>
              </Card>

              {/* Status Update Quick Action */}
              <Card title="Status Transition" description="Update task progress">
                <div className="space-y-2">
                  <Button
                    variant={currentStatus === 'IN_PROGRESS' ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full justify-start text-xs inline-flex items-center gap-1.5"
                    onClick={() => setCurrentStatus('IN_PROGRESS')}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Mark In Progress</span>
                  </Button>
                  <Button
                    variant={currentStatus === 'COMPLETED' ? 'primary' : 'outline'}
                    size="sm"
                    className="w-full justify-start text-xs inline-flex items-center gap-1.5"
                    onClick={() => setCurrentStatus('COMPLETED')}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </Button>
                  <Button
                    variant={currentStatus === 'CANCELLED' ? 'destructive' : 'outline'}
                    size="sm"
                    className="w-full justify-start text-xs inline-flex items-center gap-1.5"
                    onClick={() => setCurrentStatus('CANCELLED')}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancel Task</span>
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
